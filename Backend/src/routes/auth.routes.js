import express from "express";
import {RegisterUser,loginUser} from "../controller/auth.controller.js";
const router=express.Router();
router.post("/register",RegisterUser)
router.post("/login",loginUser)
export default router
