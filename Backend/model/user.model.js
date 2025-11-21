import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username field is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email field is required"],
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
      lowercase: true,
    },
    password: {
      type: String, 
      required: [true, "Password field is required"],
      minlength: 6,
      select: false,
    },
    confirmPassword: {
      type: String, 
      required: [true, "Confirm Password field is required"],
      select: false,
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Password and Confirm Password do not match",
      },
    },
  },
  {
    timestamps: true, 
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined; 
  next();
});

// Compare passwords during login
userSchema.methods.comparePassword = function (rawPassword, hashedPassword) {
  return bcrypt.compare(rawPassword, hashedPassword);
};

const User = mongoose.model("User", userSchema);

export default User;
