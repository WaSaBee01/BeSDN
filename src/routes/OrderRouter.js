const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authUserMiddleware } = require('../middleware/authMiddleware');

router.post('/create', OrderController.createOrder)
router.get('/get-all-order/:id', OrderController.getAllOrderDetails)
router.get('/get-order-details/:id', OrderController.getOrderDetails)
router.delete('/cancel-order/:id', OrderController.cancelOrder)
router.get('/get-all-orders/', OrderController.getAllOrder)


//authUserMiddleware,

module.exports = router;