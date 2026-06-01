const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const ProductMedia = require('../models/ProductMedia');
const ProductVariant = require('../models/ProductVariant');

/**
 * Normalize a populated product to ensure consistent field names.
 */
const normalizeCartProduct = async (product) => {
  if (!product) return product;
  const obj = typeof product.toObject === 'function' ? product.toObject() : { ...product };

  if (!obj.selling_price && obj.base_price) {
    obj.selling_price = obj.base_price;
  }
  if (!obj.mrp_price) {
    obj.mrp_price = obj.selling_price || obj.base_price || 0;
  }

  let mediaUrls = [];
  if (Array.isArray(obj.media) && obj.media.length > 0) {
    if (typeof obj.media[0] === 'string') {
      mediaUrls = obj.media;
    } else {
      mediaUrls = obj.media
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(m => m.media_url);
    }
  } else {
    const externalMedia = await ProductMedia.find({ product_id: obj._id }).sort({ sort_order: 1 }).limit(1);
    mediaUrls = externalMedia.map(m => m.media_url);
  }
  if (mediaUrls.length > 0) {
    obj.media = mediaUrls;
  }

  if (!obj.shop_id && obj.shop) {
    obj.shop_id = obj.shop;
  }

  if (!obj.category_id && obj.category) {
    obj.category_id = obj.category;
  }

  return obj;
};

// Helper to get carts collection
const getCartCollection = () => mongoose.connection.db.collection('carts');

const ensureCart = async (userId) => {
  let cart = await Cart.findOne({ user_id: userId });
  let legacyCart = null;

  if (!cart) {
    try {
      const collection = getCartCollection();
      legacyCart = await collection.findOne({ $or: [{ user: userId }, { user_id: userId }] });
      if (legacyCart) {
        if (!legacyCart.user_id) {
          try {
            await collection.updateOne(
              { _id: legacyCart._id },
              { $set: { user_id: userId }, $unset: { user: '' } }
            );
          } catch (updateErr) {
            // If update fails due to duplicate key, delete problematic legacy carts
            if (updateErr.code === 11000) {
              await cleanupLegacyCarts();
              legacyCart = null;
            } else {
              throw updateErr;
            }
          }
        }
        if (legacyCart) {
          cart = await Cart.findById(legacyCart._id);
        }
      }
    } catch (err) {
      console.error('Legacy cart migration error:', err.message);
      legacyCart = null;
    }
  }

  if (!cart) {
    cart = await Cart.create({ user_id: userId });
  }

  return { cart, legacyCart };
};

const migrateLegacyItems = async (legacyCart, cartId) => {
  if (!legacyCart || !Array.isArray(legacyCart.items) || legacyCart.items.length === 0) return;
  const existingCount = await CartItem.countDocuments({ cart_id: cartId });
  if (existingCount > 0) return;

  const itemsToInsert = legacyCart.items
    .filter(item => item && item.product)
    .map(item => ({
      cart_id: cartId,
      product_id: item.product,
      quantity: Number(item.quantity) || 1,
      createdAt: item.createdAt || new Date(),
      updatedAt: item.updatedAt || new Date()
    }));

  if (itemsToInsert.length > 0) {
    await CartItem.insertMany(itemsToInsert);
  }
};

const cleanupLegacyCarts = async () => {
  try {
    const collection = getCartCollection();
    // Remove legacy carts with no user_id
    const result = await collection.deleteMany({ 
      user_id: { $exists: false },
      user: null 
    });
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} legacy cart documents`);
    }
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
};

const getCart = async (userId) => {
  const { cart, legacyCart } = await ensureCart(userId);
  await migrateLegacyItems(legacyCart, cart._id);

  const items = await CartItem.find({ cart_id: cart._id });
  if (!items || items.length === 0) return [];

  const populatedItems = await Promise.all(items.map(async (item) => {
    const product = await Product.findById(item.product_id);
    if (!product) return null;
    const normalizedProduct = await normalizeCartProduct(product);
    return {
      id: item._id ? item._id.toString() : item.product_id.toString(),
      cart_id: cart._id,
      product_id: item.product_id.toString(),
      product: normalizedProduct,
      quantity: item.quantity
    };
  }));

  return populatedItems.filter(Boolean);
};

const addToCart = async (userId, productId, quantity) => {
  const { cart, legacyCart } = await ensureCart(userId);
  await migrateLegacyItems(legacyCart, cart._id);
  const safeQuantity = Number(quantity) || 1;

  // Check if product exists in DB
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  // Check total stock available
  const variants = await ProductVariant.find({ product_id: productId });
  const totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);

  // Check if item already exists in cart
  const existingItem = await CartItem.findOne({ cart_id: cart._id, product_id: productId });
  const currentQuantity = existingItem ? existingItem.quantity : 0;

  if (currentQuantity + safeQuantity > totalStock) {
    throw new Error('Not enough stock available');
  }

  if (existingItem) {
    existingItem.quantity += safeQuantity;
    await existingItem.save();
  } else {
    await CartItem.create({
      cart_id: cart._id,
      product_id: productId,
      quantity: safeQuantity
    });
  }

  return getCart(userId);
};

const updateCartItem = async (userId, itemId, quantity) => {
  const { cart, legacyCart } = await ensureCart(userId);
  await migrateLegacyItems(legacyCart, cart._id);

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new Error('Cart item not found');
  }

  const item = await CartItem.findOne({
    cart_id: cart._id,
    $or: [{ _id: itemId }, { product_id: itemId }]
  });
  if (!item) throw new Error('Cart item not found');

  if (Number(quantity) <= 0) {
    await CartItem.deleteOne({ _id: item._id });
  } else {
    const variants = await ProductVariant.find({ product_id: item.product_id });
    const totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);

    if (Number(quantity) > totalStock) {
      throw new Error('Not enough stock available');
    }

    item.quantity = Number(quantity);
    await item.save();
  }

  return getCart(userId);
};

const removeCartItem = async (userId, itemId) => {
  return updateCartItem(userId, itemId, 0);
};

const clearCart = async (userId) => {
  const { cart } = await ensureCart(userId);
  await CartItem.deleteMany({ cart_id: cart._id });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
