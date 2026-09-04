const mongoose=require("mongoose")

const productSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:3,
        maxLength:30
    },
    
    description:{
        type:String,
        required:true,
        minLength:3
    },
    price:{
        type:Number,
        required:true,
        unique:false,
        min:1
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    category:{
        type:String
    },
    images:{
        type:String
    },
    status:{
        type:String,
        enum:["pending","approved","rejected"],
        default:"pending"
    },
    rejectionReason:{
        type:String,
        default:""
    }
},{timestamps:true})

const Product=mongoose.model("Product",productSchema)

module.exports=Product 
