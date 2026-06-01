const Product = require('../models/Product');
const Order = require('../models/Order');
const response = require('../utils/response');

// --- PRODUCT MANAGEMENT ---

exports.createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    return response.success(res, { statusCode: 201, message: 'Product created', data: newProduct });
  } catch (error) {
    return response.error(res, { statusCode: 400, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedProduct) return response.error(res, { statusCode: 404, message: 'Product not found' });
    return response.success(res, { message: 'Product updated', data: updatedProduct });
  } catch (error) {
    return response.error(res, { statusCode: 400, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return response.error(res, { statusCode: 404, message: 'Product not found' });
    return response.success(res, { message: 'Product deleted' });
  } catch (error) {
    return response.error(res, { statusCode: 400, message: error.message });
  }
};

// --- ORDER MANAGEMENT ---

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer_id', 'full_name email').sort({ createdAt: -1 });
    return response.success(res, { data: orders });
  } catch (error) {
    return response.error(res, { statusCode: 500, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'canceled', 'cancel_requested'];
    if (!validStatuses.includes(status)) {
      return response.error(res, { statusCode: 400, message: 'Invalid status' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedOrder) return response.error(res, { statusCode: 404, message: 'Order not found' });
    
    return response.success(res, { message: 'Order status updated', data: updatedOrder });
  } catch (error) {
    return response.error(res, { statusCode: 400, message: error.message });
  }
};

exports.handleCancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const order = await Order.findById(id);
    if (!order) return response.error(res, { statusCode: 404, message: 'Order not found' });
    if (order.status !== 'cancel_requested') {
      return response.error(res, { statusCode: 400, message: 'Order is not requesting cancellation' });
    }

    if (action === 'approve') {
      order.status = 'canceled';
    } else if (action === 'reject') {
      order.status = 'confirmed'; // Revert back to confirmed
    } else {
      return response.error(res, { statusCode: 400, message: 'Invalid action. Use "approve" or "reject"' });
    }

    await order.save();
    return response.success(res, { message: `Cancel request ${action}d`, data: order });
  } catch (error) {
    return response.error(res, { statusCode: 400, message: error.message });
  }
};
