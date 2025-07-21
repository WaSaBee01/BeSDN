const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_ACCOUNT,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendEmailResetPassword = async (email, code) => {
  await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "Yêu cầu đặt lại mật khẩu từ EStore",
    text: `Mã xác nhận của bạn là: ${code}`,
    html: `<div>
                <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu tài khoản EStore.</p>
                <p><b>Mã xác nhận của bạn là: <span style="color: #dc3545; font-size: 24px">${code}</span></b></p>
                <p>Mã có hiệu lực trong 15 phút. Nếu không phải bạn thực hiện, hãy bỏ qua email này.</p>
              </div>`,
  });
};

const sendEmailCreateOrder = async (email, orderItems) => {
  let listItems = "";
  const attachImage = [];
  orderItems.forEach((order) => {
    listItems += `<div>
            <div>Bạn đã đặt <b>${order.name}</b> với số lượng: <b>${order.amount}</b> - giá <b>${order.price}</b> VND </div>
        </div>`;
    attachImage.push({ path: order.image });
  });
  await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "Bạn đã đặt hàng tại EStore",
    text: "Order created successfully",
    html: `<div><p>Bạn đã đặt hàng thành công tại EStore</p></div> ${listItems}`,
    attachments: attachImage,
  });
};

module.exports = {
  sendEmailCreateOrder,
  sendEmailResetPassword,
};
