import User from "../model/user.model.js";
import bcrypt from "bcryptjs";

class UserService {
  async registerUser({ username, email, password, confirmPassword }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const user = await User.create({ username, email, password, confirmPassword });

    return {
      id: user._id,
      username: user.username,
      email: user.email,
    };
  }

  async getUserByEmail(email) {
    return await User.findOne({ email }).select("+password");
  }

  async getUserById(id) {
    return await User.findById(id);
  }

  async comparePassword(inputPassword, hashedPassword) {
    return bcrypt.compare(inputPassword, hashedPassword);
  }
}

export default new UserService();

