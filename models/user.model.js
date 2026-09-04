const mongoose=require("mongoose")


const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:3,
        maxLength:30
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minLength:6,
        select:false
    },
    phone:{
        type:Number,
        required:true,
        min:100000000,
        max:9999999999
    },
    addresses: [{
    fullName: {type: String, required:true},
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  }],
  role:{
    type:String,
    enum:["user","seller","admin"],
    default:"user"
  },
  sellerStatus:{
    type:String,
    enum:["none","pending","approved"],
    default:"none"
  },
  isVerified: {
    type: Boolean,
    default: false
},
}
)
const User=mongoose.model("User",userSchema)

module.exports=User 
