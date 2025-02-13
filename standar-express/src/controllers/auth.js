import { uploadFileToCloundinary } from "../utils/cloudinary.js";
import { User } from "../models/user.js";
import fs from "fs";
import jwt from "jsonwebtoken";

export const registerController = async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({ message: "All fiedls are required." });
  }

  const profile_photo_path = req.files.profile_photo[0].path;
  const cover_photo_path = req.files.cover_photo[0].path;

  try {
    const exitingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (exitingUser) {
      res.status(409).json({ message: "Email or username is already exists." });
      throw new Error("Email or username is already exists.");
    }

    let profile_photo = "";
    let cover_photo = "";

    if (profile_photo_path && cover_photo_path) {
      profile_photo = await uploadFileToCloundinary(profile_photo_path);
      cover_photo = await uploadFileToCloundinary(cover_photo_path);
    }

    const user = await User.create({
      email,
      username: username.toLowerCase(),
      password,
      profile_photo,
      cover_photo,
    });

    const createUser = await User.findById(user._id).select(
      "-password -refresh_token"
    );

    if (!createUser) {
      return res
        .status(500)
        .json({ message: "Something went worng in registration new user." });
    }

    return res
      .status(200)
      .json({ userInfo: createUser, mesage: "Register is scuccess." });
  } catch (error) {
    console.log(error);
    fs.unlinkSync(profile_photo_path);
    fs.unlinkSync(cover_photo_path);
  }

  // console.log(profile_photo_path);
  // console.log(cover_photo_path);

  // console.log(profile_photo, cover_photo);
};

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const exitingUser = await User.findOne(userId);

    if (!exitingUser) {
      return res.status(404).json({ message: "No user found." });
    }

    const accessToken = await exitingUser.generateAccessToken();
    const refreshToken = await exitingUser.generateRefreshToken();

    exitingUser.refresh_token = refreshToken;
    await exitingUser.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const loginController = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fiedls are required." });
  }

  const exitingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!exitingUser) {
    return res.status(404).json({ message: "No user found." });
  }
  const isPasswordMath = await exitingUser.isPasswordisMatch(password);

  if (!isPasswordMath) {
    return res.status(401).json({ message: "Invaild Credentials." });
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(exitingUser._id);

  const loggedUser = await User.findById(exitingUser._id).select(
    "-password,-refresh_token"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refrechToken", refreshToken, options)
    .json({ user: loggedUser, message: "Login success" });
};

export const generateNewRefreshToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "No refresh token." });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY
    );

    const existingUser = await User.findById(decodedToken?._id);

    if (!existingUser) {
      return res.status(404).json({ message: "No user found." });
    }

    if (incomingRefreshToken !== existingUser.refresh_token) {
      return res.status(401).json({ message: "Invaild refresh token." });
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(existingUser._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ message: "Token updated." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const logoutController = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(400).json({ message: "Logout Unauthorized" });
  }

  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refresh_token: 1,
        },
      },
      {
        new: true,
      }
    );

    const existingUser = await User.findById(req.user._id);
    // console.log(existingUser);
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: `${req.user.username} logout successfully ` });
  } catch (error) {}
  console.log("Logout error :", error);
  return res.status(500).json({ message: "Something went wrong." });
  // res.status(200).json({user:req.user});
};
