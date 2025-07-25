const OrderService = require('../services/OrderService')

const createOrder = async (req, res) => {
    try {
        const { paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone } = req.body;
        if (!paymentMethod || !itemsPrice || !shippingPrice || !totalPrice || !fullName || !address || !city || !phone) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Please fill in all fields'
            })
        }
        const response = await OrderService.createOrder(req.body);
        return res.status(200).json(response)
    } catch (e) {
        res.status(404).json({
            message: e
        })
    }
}

const getAllOrderDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'User ID is required'
            })
        }
        const response = await OrderService.getAllOrderDetails(userId);
        return res.status(200).json(response)
    } catch (e) {
        res.status(404).json({
            message: e
        })
    }
}

const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        if (!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'User ID is required'
            })
        }
        const response = await OrderService.getOrderDetails(orderId);
        return res.status(200).json(response)
    } catch (e) {
        res.status(404).json({
            message: e
        })
    }
}

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const data = req.body;
        if (!orderId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Order ID is required'
            })
        }
        const response = await OrderService.cancelOrder(orderId, data);
        return res.status(200).json(response)
    } catch (e) {
        res.status(404).json({
            message: e
        })
    }
}
const getAllOrder = async (req, res) => {
    try {

        const data = await OrderService.getAllOrder();
        return res.status(200).json(data)
    } catch (e) {
        res.status(404).json({
            message: e
        })
    }
}


module.exports = {
    createOrder,
    getAllOrderDetails,
    getOrderDetails,
    cancelOrder,
    getAllOrder
}