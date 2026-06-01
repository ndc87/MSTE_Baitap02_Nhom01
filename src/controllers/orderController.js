const orderService = require('../services/orderService');
const response = require('../utils/response');

exports.checkout = async (req, res) => {
  try {
    const { addressId } = req.body;
    const orders = await orderService.checkoutCOD(req.user._id, addressId);
    return res.status(201).json({
      success: true,
      code: 201,
      message: 'Order placed successfully',
      data: orders
    });
  } catch (error) {
    return response.error(res, { statusCode: 400, message: error.message });
  }
};


exports.getHistory = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await orderService.getOrders(req.user._id, Number(page), Number(limit), status);
    return response.success(res, { data: result });
  } catch (error) {
    return response.error(res, { statusCode: 500, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.cancelOrder(req.user._id, orderId);
    return response.success(res, { message: 'Order canceled', data: order });
  } catch (error) {
    return response.error(res, { statusCode: 400, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(req.user._id, orderId);
    if (!order) {
      return response.error(res, { statusCode: 404, message: 'Order not found' });
    }
    return response.success(res, { data: order });
  } catch (error) {
    return response.error(res, { statusCode: 500, message: error.message });
  }
};

