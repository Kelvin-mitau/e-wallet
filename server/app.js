import dotenv from "dotenv";
import express from "express" ;
import jwt from "jsonwebtoken";
import { User,Transaction } from "./db.js";
import bcrypt from "bcrypt";
import cors from "cors";
import { OAuth2Client } from 'google-auth-library';

dotenv.config({quiet:true})

const app = express()
app.use(cors({
    origin:"*"
})) 

app.use(express.json())

const jwtSecret = process.env.JWT_SECRET;
//Authentication
const jwtOptions = {
    expiresIn:"30d"
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/auth/signup/google', async (req, res) => {
    try {
        const { token } = req.body;
    
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
            if ( await User.findOne({email:payload.email}) != null){
                res.status(405).json({message:"This email is already registered"})
            }
            const newUser = new User ({
                email:payload.email,
                firstName:payload.given_name,
                lastName:payload.family_name,
                username:payload.email
            })
            await newUser.save()
            res.status(200).send()
    } catch (error) {
        //console.error(error)
        res.status(500).json({message:"Oops...Something went wrong"}) 
    }

});
app.post('/auth/signin/google', async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const user = await User.findOne({email:payload.email});
            if (!user ){
                res.status(404).json({message:"This account does not exit"})
            }
            await user.save()
            res.status(200).json({
                token:jwt.sign({id:user._id},jwtOptions),
                user
            })
    } catch (error) {
        //console.error(error)
        res.status(500).json({message:"Oops...Something went wrong"}) 
    }

});


app.post("/auth/signin", async (req,res) => {
    try {
        const requestBody = req.body
        const user = await User.findOne({email:requestBody.email})
        if (!user){
             res.status(405).send("Invalid details")
             return
        }
        const validatePassword = await bcrypt.compare(requestBody.password,user.password)
        if (!validatePassword){
             res.status(405).send("Invalid details")
             return
        }
        const token = jwt.sign({id:user._id},jwtSecret)
        console.log(token)
        res.status(200).json({
            token,
            id:user._id
        })
        
    } catch (error) {
        //console.error(error)
        res.status(500).send({message:"Oops...Something went wrong"})   
    }
})

app.post("/auth/signup", async (req,res) => {
    try {
        const reqBody = req.body;
        if ( await User.findOne({email:reqBody.email}) != null){
            res.status(405).send("This email is already registered")
        }
        const newUser = new User ({...reqBody,password: await bcrypt.hash(reqBody.password,10)})
        await newUser.save()
        res.status(200).send()
    } catch (error) {
        console.error(error)
        res.status(500).send("Oops...Something went wrong")
    }
})
//To get user details
app.get("/user/:id",async (req,res) => {
    try {
        const userID = req.params.id;
        const authToken = req.headers.authorization;
        const verifyHeaders = jwt.verify(authToken,jwtSecret)
        console.log("Auth Token: ",authToken)
        if (!verifyHeaders){
            res.status(400).send("Unauthorized")
            return;
        }
        const user = await User.findById(userID).select(["-password"])
        if (!user){
             res.status(404).send()
            return;
        }
        res.send(user)
    } catch (error) {
        console.error(error)
        res.status(500).send("Oops...Something went wrong")
    }
})

//Update user data
app.put("/user/:id", async (req,res) => {
    try {
        const reqBody = req.body
        const userID = req.params.id;
        const authToken = req.headers.authorization;
        const verifyHeaders = jwt.verify(authToken,jwtSecret)
          if (!verifyHeaders){
            res.status(400).send("Unauthorized")
            return;
        }
        const user = await User.findByIdAndUpdate(userID,{
            $set:{
                firstName:reqBody.firstName,
                lastName:reqBody.lastName,
                password:await bcrypt.hash(reqBody.password,10)
            }
        })
        .select(["-password"])
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(500).send("Oops...Something went wrong")
    }
})
app.delete("/user/:id", async (req,res) => {
    try {
        const userID = req.params.id;
        const authToken = req.headers.authorization;
        await User.findByIdAndDelete(userID)
         res.status(200).send()
    } catch (error) {
        console.error(error)
        res.status(500).send({message:"Oops...Something went wrong"})
    }
})

/* 
Transactiions
*/
app.get("/transactions/:id", async (req,res) => {
    try {
        const userID = req.params.id;
        if (!userID){
             res.status(400).send("Unauthorized")
            return;
        }
        const authToken = req.headers.authorization;
        const user = await User.findById(userID).select(["firstName","lastName","email"])
        if (!user){
             res.status(404).send()
            return;
        }
        const transactions = await Transaction.find({user:userID}).sort("-createdAt")
         res.status(200).json({user,transactions})
    } catch (error) {
        console.error(error)
        res.status(500).send({message:"Oops...Something went wrong"})
    }
})


const port = process.env.PORT;
app.listen(port,() => {
    console.log("server running on pport: " + port) 
})
