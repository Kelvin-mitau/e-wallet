import dotenv from "dotenv";
import express from "express" ;
import jwt from "jsonwebtoken";
import { User,Transaction, Notification } from "./db.js";
import bcrypt from "bcrypt";
import cors from "cors";
import { OAuth2Client } from 'google-auth-library';
import mongoose, { Mongoose } from "mongoose";

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
                res.status(400).json({message:"This email is already registered"})
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
                token:jwt.sign({id:user._id},jwtSecret),
                userID:user._id
            })
    } catch (error) {
        console.error(error)
        res.status(500).json({message:"Oops...Something went wrong"}) 
    }

});


app.post("/auth/signin", async (req,res) => {
    try {
        const requestBody = req.body
        const user = await User.findOne({email:requestBody.email})
        if (!user){
             res.status(405).send({message:"Invalid login details"})
             return
        }
        const validatePassword = await bcrypt.compare(requestBody.password,user.password)
        if (!validatePassword){
             res.status(405).send({message:"Invalid login details"})
             return
        }
        const token = jwt.sign({id:user._id},jwtSecret)
        console.log(token)
        res.status(200).json({
                token,
                userID:user._id
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

        try {
            jwt.verify(authToken,jwtSecret)
        } catch (error) {
            res.status(403).send({message:"Unauthorised"})
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
        try {
            jwt.verify(authToken,jwtSecret)
        } catch (error) {
            res.status(403).send({message:"Unauthorised"})
            return;
        }
         if ( await User.findOne({
            email:reqBody.email,
            _id:{$ne:userID}
        }) != null){
            res.status(405).send("This email is already registered")

        }
        const user = await User.findByIdAndUpdate(userID,{
            $set:{
                firstName:reqBody.firstName,
                lastName:reqBody.lastName,
                email:reqBody.email
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
        try {
            jwt.verify(authToken,jwtSecret)
        } catch (error) {
            res.status(403).send({message:"Unauthorised"})
            return;
        }
        await User.findByIdAndDelete(userID)
         res.status(200).send()
    } catch (error) {
        console.error(error)
        res.status(500).send({message:"Oops...Something went wrong"})
    }
})

//Notifications
app.get("/notifications/:id",async (req,res) => {
    try {
        const userID = req.params.id;
        const authToken = req.headers.authorization;

        try {
            jwt.verify(authToken,jwtSecret)
        } catch (error) {
            res.status(403).send({message:"Unauthorised"})
            return;
        }
        const notifications = await Notification.find({user:userID})
        res.send(notifications)
    } catch (error) {
        console.error(error)
        res.status(500).send("Oops...Something went wrong")
    }
})

app.get("/unread_notifications_count/:id",async (req,res) => {
    try {
        const userID = req.params.id;
        const authToken = req.headers.authorization;

        try {
            jwt.verify(authToken,jwtSecret)
        } catch (error) {
            res.status(403).send({message:"Unauthorised"})
            return;
        }
        const notifications = await Notification.find({
            user:userID,
            "notification.read":false
        })
        console.log(notifications)

        res.send({count:notifications.length})
    } catch (error) {
        console.error(error)
        res.status(500).send("Oops...Something went wrong")
    }
})

app.get("/read_notifications/:id",async (req,res) => {
    try {
        const userID = req.params.id;
        const authToken = req.headers.authorization;

        try {
            jwt.verify(authToken,jwtSecret)
        } catch (error) {
            res.status(403).send({message:"Unauthorised"})
            return;
        }
        await Notification.updateMany({$and:[
            {user:userID},
            {"notification.read":false}
        ]},
        {
            $set:{
                "notification.read":true
            }
         })
        res.status(200).send()
    } catch (error) {
        console.error(error)
        res.status(500).send("Oops...Something went wrong")
    }
})


app.delete("/notifications/:id", async (req,res) => {
    try {
        const notificationID = req.params.id;
        const authToken = req.headers.authorization;
        try {
            jwt.verify(authToken,jwtSecret)
        } catch (error) {
            res.status(403).send({message:"Unauthorised"})
            return;
        }
        await Notification.findByIdAndDelete(notificationID)
         res.status(200).send()
    } catch (error) {
        console.error(error)
        res.status(500).send({message:"Oops...Something went wrong"})
    }
})

app.delete("/clear_notifications/:id", async (req,res) => {
    try {
        const userID = req.params.id;
        const authToken = req.headers.authorization;
        try {
            jwt.verify(authToken,jwtSecret)
        } catch (error) {
            res.status(403).send({message:"Unauthorised"})
            return;
        }
        await Notification.deleteMany({user:userID})
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
             res.status(403).send({message:"Unauthorised"})
            return;
        }
        const authToken = req.headers.authorization;
          try {
            jwt.verify(authToken,jwtSecret)
        } catch (error) {
            res.status(403).send({message:"Unauthorised"})
            return;
        }
        const user = await User.findById(userID).select(["firstName","lastName","email","balance"])
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
//Topup handler
app.post("/transactions/topup/:id", async (req,res) => {
    try {
        const userID = req.params.id;
        if (!userID){
             res.status(403).send({message:"Unauthorised"})
            return;
        }
        const authToken = req.headers.authorization;
        
        try {
            jwt.verify(authToken,jwtSecret)
        } catch (error) {
            res.status(403).send({message:"Unauthorised"})
            return;
        }
        function getTopUpMethod(value){
            switch (value) {
                case "Bank":
                    return "bank transfer"
                case "Card":
                    return "debit card transfer"
                case "MobileMoney":
                    return "mobile money transfer"
                default:
                    break;
            }
        }
        const dbSession = await mongoose.startSession ()
        await dbSession.withTransaction(async () => {
            const newTransaction = new Transaction({
                method:req.body.method,
                amount:req.body.amount,
                description:req.body.description || " ",
                type:"positive",
                user:userID
            })  ;
            await newTransaction.save();
            const newNotification = new Notification({
                user:userID,
                notification:{
                    notification:`You have received ${req.body.amount} via a $${getTopUpMethod(req.body.method)} top-up .`
            }}) ;
            await newNotification.save();
            await User.findByIdAndUpdate(userID,{
                $inc:{
                    balance:req.body.amount
                }
            })
        })
         res.status(200).send()
    } catch (error) {
        console.error(error)
        res.status(500).send({message:"Oops...Something went wrong"})
    }
    
})
//Send handler
app.post("/transactions/send/:id", async (req,res) => {
    try {
        const userID = req.params.id;
        if (!userID){
             res.status(403).send({message:"Unauthorised"})
            return;
        }
        const authToken = req.headers.authorization;
          try {
            jwt.verify(authToken,jwtSecret)
        } catch (error) {
            res.status(403).send({message:"Unauthorised"})
            return;
        }

        const sender = await User.findByIdAndUpdate(userID)
        const recipient = await User.findOne({email:req.body.recipientEmail})

        if (!sender){
            res.status(404).send({message:"Sender not registered"})
            return;
        }

        if (sender.balance < req.body.amount){
            res.status(404).send({message:"You have nsufficient funds"})
            return;
        }

        if (!recipient){
            res.status(404).send({message:"Recepient not registered"})
            return;
        }

        if (recipient.email == req.body.recipientEmail){
            res.status(400).send({message:"You can't send money to yourself"})
            return;
        }

        const dbSession = await mongoose.startSession ()
        await dbSession.withTransaction(async () => {

            const senderTransaction = new Transaction({
                amount:req.body.amount,
                description:req.body.description || " ",
                type:"negative",
                user:userID
            })  ;
            await senderTransaction.save();

            const newNotification = new Notification({
                user:userID,
                notification:{
                    notification:`You have sent ${req.body.amount} to the account ${recipient.email} .`
            }}) ;
            await newNotification.save();

            const receiverTransaction = new Transaction({
                amount:req.body.amount,
                description: `Received from ${sender.email} `,
                type:"positive",
                user:recipient._id
            })  ;
            await receiverTransaction.save();

            const newRecepientNotification = new Notification({
                user:recipient._id,
                notification:{
                    notification:`You have received ${req.body.amount} from the account ${sender.email} .`
            }}) ;
            await newRecepientNotification.save();

            //Deduct sender bal
            sender.balance -= req.body.amount;
            sender.save()
            //Add recepient bal
            recipient.balance += req.body.amount;
            recipient.save()
        })
         res.status(200).send()

    } catch (error) {
        console.error(error)
        res.status(500).send({message:"Oops...Something went wrong"})
    }
})

const port = process.env.PORT;
app.listen(port,() => {
    console.log("server running on pport: " + port) 
})
