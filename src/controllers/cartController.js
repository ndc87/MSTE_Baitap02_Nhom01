const cartService = require('../services/cartService');
const response = require('../utils/response');

exports.getCart = async (req, res) => {
  try {
    const items = await cartService.getCart(req.user._id);
    return response.success(res, { data: items });
  } catch (error) {
    return response.error(res, { statusCode: 500, message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return response.error(res, { statusCode: 422, message: 'productId is required' });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 1) {
      return response.error(res, { statusCode: 422, message: 'quantity must be a positive integer (>= 1)' });
    }

    const items = await cartService.addToCart(req.user._id, productId, qty);
    return response.success(res, { message: 'Added to cart', data: items });
  } catch (error) {
    return response.error(res, { statusCode: 400, message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) {
      return response.error(res, { statusCode: 422, message: 'quantity must be a non-negative integer (0 = remove)' });
    }

    const items = await cartService.updateCartItem(req.user._id, itemId, qty);
    return response.success(res, { message: 'Cart updated', data: items });
  } catch (error) {
    return response.error(res, { statusCode: 400, message: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const items = await cartService.removeCartItem(req.user._id, itemId);
    return response.success(res, { message: 'Item removed', data: items });
  } catch (error) {
    return response.error(res, { statusCode: 400, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await cartService.clearCart(req.user._id);
    return response.success(res, { message: 'Cart cleared' });
  } catch (error) {
    return response.error(res, { statusCode: 400, message: error.message });
  }
};

