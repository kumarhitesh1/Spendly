const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{  
        type:String,
        required:true,
    },
    profilePicUrl:{
        type:String,
        default:null,
    }
},{
    timestamps:true,
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}


const User=mongoose.model("User",userSchema);

module.exports=User;