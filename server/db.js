import mongoose from "mongoose"

mongoose.connect("mongodb://localhost:27017/ewallet")
.then(() => {
    console.log("Connected to Database")
})
.catch(() => {
    console.error("Failed to connect to Database")
})

const userSchema = new mongoose.Schema({
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    email:{type:String,required:true},
    //username:{type:String,required:true},
    password:{type:String},
    balance:{type:Number,default:0}
})

const transactionSchema = new mongoose.Schema({
    user:{type:String,required:true,ref:"User"},
    type:{type:String,required:true},
    amount:{type:Number,required:true},
    description:{type:String,required:true},
    method:{type:String},
    recipientEmail:{type:String},
},{timestamps:true})

const notificationSubSchema = new mongoose.Schema({
    notification:{type:String},
    read:{type:Boolean,default:false}
})

const notificationSchema = new mongoose.Schema({
    user:{type:String,required:true,ref:"User"},
    notification:notificationSubSchema
},{timestamps:true})


const User = mongoose.model("User",userSchema);
const Transaction = mongoose.model("Transaction",transactionSchema);
const Notification = mongoose.model("Notification",notificationSchema);

export {User,Transaction,Notification};

