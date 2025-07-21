const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const {
  authMiddleware,
  authUserMiddleware,
} = require("../middleware/authMiddleware");

router.post("/sign-up", userController.createUser);
router.post("/sign-in", userController.loginUser);
router.post("/log-out", userController.logoutUser);
router.put("/update-user/:id", authUserMiddleware, userController.updateUser);
router.delete("/delete-user/:id", userController.deleteUser);
router.get("/getAll", authMiddleware, userController.getAllUser);
router.get("/get-details/:id", userController.getDetailsUser);
router.post("/refresh-token", userController.refreshToken);
router.post("/delete-many", authMiddleware, userController.deleteMany);
router.post("/add-favorite", userController.addFavorite);
router.post("/remove-favorite", userController.removeFavorite);
router.get("/favorites/:userId", userController.getFavorites);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
module.exports = router;
