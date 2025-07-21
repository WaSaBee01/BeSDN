const bcrypt = require("bcrypt");
const { genneralAccessToken, genneralRefreshToken } = require('./jwtService');
const Order = require("../models/OrderProduct");
const Product = require("../models/ProductModal");
const EmailService = require('../services/EmailService');

const createOrder = (newOrder) => {
    return new Promise(async (resolve, reject) => {
        const { orderItems, paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone, user, isPaid, paidAt, email } = newOrder;

        try {
            const promises = orderItems.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: order.product,
                        countInStock: { $gte: order.amount }
                    },
                    {
                        $inc: {
                            countInStock: -order.amount,
                            selled: +order.amount
                        }
                    },
                    { new: true }
                )
                if (productData) {

                    return {
                        status: 'OK',
                        message: 'Order created successfully',
                    }
                } else {
                    return {
                        status: 'ERR',
                        message: 'ERR',
                        id: order.product
                    }
                }
            })
            const results = await Promise.all(promises);
            const newData = results && results.filter((item) => item.id)
            if (newData.length) {
                const arrId = []
                newData.forEach((item) => {
                    arrId.push(item.id)
                })
                resolve({
                    status: 'ERR',
                    message: `Sản phẩm với id ${arrId.join(',')} đã hết hàng`,
                    data: newData
                })
            } else {
                const createdOrder = await Order.create({
                    orderItems,
                    shippingAdress: {
                        fullName,
                        address,
                        city,
                        phone
                    },
                    paymentMethod,
                    itemsPrice,
                    shippingPrice,
                    totalPrice,
                    user: user,
                    isPaid,
                    paidAt
                })
                if (createdOrder) {
                    await EmailService.sendEmailCreateOrder(email, orderItems)
                    resolve({
                        status: 'OK',
                        message: 'Order created successfully',
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    });
}

const getAllOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.find({
                user: id
            })
            if (order === null) {
                resolve({
                    status: 'ERR',
                    message: 'The order does not exist'
                })
            } else {
                resolve({
                    status: 'OK',
                    message: 'Success',
                    data: order
                })
            }
        } catch (e) {
            reject(e);
        }
    });
}

const getOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findById({
                _id: id
            })
            if (order === null) {
                resolve({
                    status: 'ERR',
                    message: 'The order does not exist'
                })
            } else {
                resolve({
                    status: 'OK',
                    message: 'Success',
                    data: order
                })
            }
        } catch (e) {
            reject(e);
        }
    });
}

const cancelOrder = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findByIdAndDelete(id)
            if (order === null) {
                resolve({
                    status: 'ERR',
                    message: 'The order does not exist'
                })
            }
            resolve({
                status: 'OK',
                message: 'Success',
                data: order
            })

        } catch (e) {
            reject(e);
        }
    });
}

const getAllOrder = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const allOrder = await Order.find()

            resolve({
                status: 'OK',
                message: 'Success',
                data: allOrder
            })
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    createOrder,
    getAllOrderDetails,
    getOrderDetails,
    cancelOrder,
    getAllOrder
}