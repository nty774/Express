import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
 import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      uniquee: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    profile_photo: {
      type: String,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordisMatch = async function(password){
    return await bcrypt.compare(password,this.password);

}

userSchema.methods.generateAccessToken = async function(){
    jwt.sign({
        _id: this.id,
        email : this.email,
        username : this.username,        
    },process.env.ACCESSTOKEN_SECRET_KEY,{
        expiresIn : ACCESSTOKEN_EXP_TIME,
    }
);
}

userSchema.methods.generateRefreshToken = async function(){
    jwt.sign({
        _id: this.id,           
    },process.env.REFRESH_TOKEN_SECRET_KEY,{
        expiresIn : REFRESH_TOKEN_EXP_TIME,
    }
);
}



userSchema.plugin(mongooseAggregatePaginate);

export const User = mongoose.model("User", userSchema);
