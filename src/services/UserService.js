const User = require("../models/UserModel");
const Order = require("../models/OrderProduct");
const Product = require("../models/ProductModal");
const EmailService = require("../services/EmailService");

const bcrypt = require("bcrypt");
const { genneralAccessToken, genneralRefreshToken } = require("./jwtService");

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { name, email, password, confirmPassword, phone } = newUser;

    try {
      const checkUser = await User.findOne({ email });
      if (checkUser !== null) {
        return resolve({
          status: "ERR",
          message: "Email already exists",
        });
      }

      const hash = bcrypt.hashSync(password, 10);
      const createdUser = await User.create({
        name,
        email,
        password: hash,
        phone,
      });
      if (createdUser) {
        return resolve({
          status: "OK",
          message: "User created successfully",
          data: createdUser,
        });
      }
      return resolve({
        status: "ERR",
        message: "Tạo tài khoản thất bại!",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;

    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "The email does not exist",
        });
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password);

      if (!comparePassword) {
        resolve({
          status: "ERR",
          message: "Password is incorrect",
        });
      }
      const access_token = await genneralAccessToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      const refresh_token = await genneralRefreshToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      resolve({
        status: "OK",
        message: "User login successfully",
        access_token,
        refresh_token,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        _id: id,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "The user does not exist",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

      resolve({
        status: "OK",
        message: "User update successfully",
        data: updatedUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({ _id: id });
      if (checkUser === null) {
        return resolve({
          status: "ERR",
          message: "The user does not exist",
        });
      }

      if (checkUser.role === "admin" || checkUser.isAdmin) {
        return resolve({
          status: "ERR",
          message: "Cannot delete admin accounts.",
        });
      }

      const hasOrder = await Order.exists({ user: id });
      if (hasOrder) {
        return resolve({
          status: "ERR",
          message: "Cannot delete users with existing orders.",
        });
      }

      await User.findByIdAndDelete(id);

      resolve({
        status: "OK",
        message: "Delete user success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteManyUser = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      await User.deleteMany({ _id: ids });

      resolve({
        status: "OK",
        message: "Delete user success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find();
      resolve({
        status: "OK",
        message: "Success",
        data: allUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        _id: id,
      });
      if (user === null) {
        resolve({
          status: "ERR",
          message: "The user does not exist",
        });
      }

      resolve({
        status: "OK",
        message: "Success",
        data: user,
      });
    } catch (e) {
      reject(e);
    }
  });
};
const addFavorite = (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) return resolve({ status: "ERR", message: "User not found" });

      const product = await Product.findById(productId);
      if (!product)
        return resolve({ status: "ERR", message: "Product not found" });

      await User.findByIdAndUpdate(userId, {
        $addToSet: { favorites: productId },
      });

      resolve({ status: "OK", message: "Added to favorites" });
    } catch (e) {
      reject(e);
    }
  });
};

const removeFavorite = (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      await User.findByIdAndUpdate(userId, { $pull: { favorites: productId } });
      resolve({ status: "OK", message: "Removed from favorites" });
    } catch (e) {
      reject(e);
    }
  });
};

const getFavorites = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId).populate("favorites");
      if (!user) return resolve({ status: "ERR", message: "User not found" });

      resolve({ status: "OK", message: "Success", data: user.favorites });
    } catch (e) {
      reject(e);
    }
  });
};

const forgotPassword = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return resolve({
          status: "ERR",
          message: "Email không tồn tại!",
        });
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetPasswordToken = code;
      user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

      await user.save();
      await EmailService.sendEmailResetPassword(email, code);

      resolve({
        status: "OK",
        message: "Mã xác nhận đã gửi về email!",
      });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

const resetPassword = (email, code, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ email, resetPasswordToken: code });
      if (!user) {
        return resolve({
          status: "ERR",
          message: "Mã xác nhận không hợp lệ hoặc email không đúng!",
        });
      }
      if (user.resetPasswordExpires < Date.now()) {
        return resolve({
          status: "ERR",
          message: "Mã xác nhận đã hết hạn. Vui lòng thử lại!",
        });
      }
      const hash = bcrypt.hashSync(newPassword, 10);
      user.password = hash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      resolve({
        status: "OK",
        message: "Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.",
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  deleteManyUser,
  addFavorite,
  removeFavorite,
  getFavorites,
  forgotPassword,
  resetPassword,
};
