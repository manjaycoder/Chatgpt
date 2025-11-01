import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";

const asyncHandler = expressAsyncHandler;

const RegisterUser = asyncHandler(async (req, res) => {
  const {
    fullName: { firstName, lastName },
    email,
    password,
  } = req.body;

  const isUserAlreadyExist = await userModel.findOne({ email });
  if (isUserAlreadyExist) {
    return res.status(400).json({ message: "User  already exists" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    fullName: {
      firstName,
      lastName,
    },
    email,
    password: hashPassword,
  });
  console.log(user);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.cookie("token", token, { httpOnly: true });
  res.status(201).json({
    message: "User  registered successfully",
    user: {
      email: user.email,
      _id: user._id,
      fullName: user.fullName,
    },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.cookie("token", token, { httpOnly: true });
  res.status(200).json({
    message: "Login successful",
    user: {
      email: user.email,
      _id: user._id,
      fullName: user.fullName,
    },
  });
});

export { RegisterUser, loginUser };
