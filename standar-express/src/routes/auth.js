import { Router } from "express";
import { loginController, registerController } from "../controllers/auth.js";
import { upload } from "../middleware/multer-storage.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  registerController
);

router.post("/login", loginController);

export default router;
