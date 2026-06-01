const Banner = require('../models/Banner');
const Product = require('../models/Product');
const ProductMedia = require('../models/ProductMedia');
const Category = require('../models/Category');
const Campaign = require('../models/Campaign');
const CampaignTarget = require('../models/CampaignTarget');
const ProductVariant = require('../models/ProductVariant');
const OrderItem = require('../models/OrderItem');
const ProductReview = require('../models/ProductReview');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { toCamelCase } = require('../utils/formatter');

exports.getHomepageData = async (req, res, next) => {
  try {
    // 1. Fetch Banners
    const banners = await Banner.find({ is_active: true }).sort({ sort_order: 1 });

    // 2. Fetch Categories (Top level)
    const categories = await Category.find({ parent_id: null }).limit(6);

    // 3. Fetch Flash Deals (Active campaigns)
    const activeCampaigns = await Campaign.find({
      start_at: { $lte: new Date() },
      end_at: { $gte: new Date() }
    }).limit(1);

    let flashDeals = [];
    if (activeCampaigns.length > 0) {
      const targets = await CampaignTarget.find({ campaign_id: activeCampaigns[0]._id }).limit(4);
      const productIds = targets.map(t => t.product_id);
      flashDeals = await Product.find({ _id: { $in: productIds }, approval_status: 'approved' });
    }

    // 4. Fetch New Arrivals
    const newArrivals = await Product.find({ approval_status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(10);

    // 5. Fetch Best Sellers (Mocked by rating for now)
    const bestSellers = await Product.find({ approval_status: 'approved' })
      .sort({ average_rating: -1 })
      .limit(10);

    // Helper to attach media and normalize price fields for products
    const normalizeProduct = async (p) => {
      const obj = p.toObject();

      // --- Fix prices: DB uses base_price, model expects selling_price/mrp_price ---
      if (!obj.selling_price && obj.base_price) {
        obj.selling_price = obj.base_price;
      }
      if (!obj.mrp_price) {
        obj.mrp_price = obj.selling_price || obj.base_price || 0;
      }

      // --- Fix media: DB embeds media[] inside product, fallback to ProductMedia collection ---
      let mediaUrls = [];
      if (Array.isArray(obj.media) && obj.media.length > 0) {
        // Embedded media array in the product document
        if (typeof obj.media[0] === 'string') {
          mediaUrls = obj.media;
        } else {
          mediaUrls = obj.media
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(m => m.media_url);
        }
      } else {
        // Fallback: separate ProductMedia collection
        const externalMedia = await ProductMedia.find({ product_id: obj._id }).sort({ sort_order: 1 });
        mediaUrls = externalMedia.map(m => m.media_url);
      }
      obj.media = mediaUrls;

      // --- Fix category ref: DB uses 'category' field, model expects 'category_id' ---
      if (!obj.category_id && obj.category) {
        obj.category_id = obj.category;
      }

      // --- Fix shop ref: DB uses 'shop' field, model expects 'shop_id' ---
      if (!obj.shop_id && obj.shop) {
        obj.shop_id = obj.shop;
      }

      return obj;
    };

    const attachMedia = async (products) => {
      return await Promise.all(products.map(p => normalizeProduct(p)));
    };

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Homepage data fetched successfully',
      data: toCamelCase({
        banners,
        categories,
        flashDeals: await attachMedia(flashDeals),
        newArrivals: await attachMedia(newArrivals),
        bestSellers: await attachMedia(bestSellers),
        campaign: activeCampaigns[0] || null
      }),
      timestamp: Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // 1. Fetch Product
    const productRaw = await Product.findOne({ slug, approval_status: 'approved', is_active: true });
    if (!productRaw) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'Product not found',
        data: null,
        timestamp: Math.floor(Date.now() / 1000)
      });
    }

    // Normalize the product (fix prices, media, refs)
    const product = productRaw.toObject();
    if (!product.selling_price && product.base_price) {
      product.selling_price = product.base_price;
    }
    if (!product.mrp_price) {
      product.mrp_price = product.selling_price || product.base_price || 0;
    }
    if (!product.category_id && product.category) {
      product.category_id = product.category;
    }
    if (!product.shop_id && product.shop) {
      product.shop_id = product.shop;
    }

    // 2. Fetch Shop with more stats
    const shop = await Shop.findById(product.shop_id).select('name slug logo_url address rating status followers response_rate joined_at response_time');

    // 3. Fetch Category hierarchy (up to 3 levels)
    let breadcrumbs = [];
    let currentCat = await Category.findById(product.category_id);
    while (currentCat) {
      breadcrumbs.unshift({ name: currentCat.name, slug: currentCat.slug });
      if (currentCat.parent_id) {
        currentCat = await Category.findById(currentCat.parent_id);
      } else {
        currentCat = null;
      }
      if (breadcrumbs.length >= 3) break; // Limit to 3 levels as per spec
    }

    // 4. Fetch Media — prefer embedded media[], fallback to ProductMedia collection
    let media = [];
    if (Array.isArray(product.media) && product.media.length > 0) {
      if (typeof product.media[0] === 'string') {
        media = product.media.map((url, index) => ({
          media_url: url,
          sort_order: index
        }));
      } else {
        media = product.media
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      }
    } else {
      media = await ProductMedia.find({ product_id: product._id }).sort({ sort_order: 1 });
    }

    // 5. Fetch Variants & Calculate Total Stock
    // Try embedded variants first, then external collection
    let variants = [];
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      variants = product.variants;
    } else {
      variants = await ProductVariant.find({ product_id: product._id });
    }
    const totalStock = variants.length > 0 
      ? variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0)
      : 100;

    // 6. Calculate Sold Quantity
    const soldData = await OrderItem.aggregate([
      { $match: { product_id: product._id } },
      { $group: { _id: null, totalSold: { $sum: '$quantity' } } }
    ]);
    // Base sold count + real sold data
    const baseSold = product.sku ? (parseInt(product.sku.split('-').pop()) || 0) * 10 : 0;
    const totalSold = (soldData.length > 0 ? soldData[0].totalSold : 0) + baseSold + 50;

    // 7. Fetch Reviews with better details
    const reviews = await ProductReview.find({ product_id: product._id })
      .populate('user_id', 'full_name avatar_url')
      .sort({ createdAt: -1 });

    // 8. Fetch Related Products (Same category, approved, not current)
    const catId = product.category_id || product.category;
    const relatedProductsRaw = await Product.find({ 
      $or: [{ category_id: catId }, { category: catId }], 
      _id: { $ne: product._id },
      approval_status: 'approved'
    }).limit(4);

    const relatedProducts = await Promise.all(relatedProductsRaw.map(async (p) => {
      const obj = p.toObject();
      // Normalize prices
      if (!obj.selling_price && obj.base_price) obj.selling_price = obj.base_price;
      if (!obj.mrp_price) obj.mrp_price = obj.selling_price || obj.base_price || 0;
      // Normalize media
      let pMediaUrls = [];
      if (Array.isArray(obj.media) && obj.media.length > 0) {
        if (typeof obj.media[0] === 'string') {
          pMediaUrls = obj.media;
        } else {
          pMediaUrls = obj.media
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(m => m.media_url);
        }
      } else {
        const pMedia = await ProductMedia.find({ product_id: p._id }).sort({ sort_order: 1 }).limit(1);
        pMediaUrls = pMedia.map(m => m.media_url);
      }
      const pCatId = obj.category_id || obj.category;
      const pCat = pCatId ? await Category.findById(pCatId).select('name') : null;
      return {
        ...obj,
        media: pMediaUrls,
        category: pCat
      };
    }));

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Product details fetched successfully',
      data: toCamelCase({
        product,
        shop,
        category: {
          breadcrumbs
        },
        media,
        variants,
        stock: totalStock,
        sold: totalSold,
        reviews: reviews.map(r => ({
          id: r._id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          user: r.user_id ? {
            fullName: r.user_id.full_name,
            avatarUrl: r.user_id.avatar_url
          } : { fullName: 'Anonymous' }
        })),
        relatedProducts
      }),
      timestamp: Math.floor(Date.now() / 1000)
    });

  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      success: true,
      code: 200,
      message: 'Categories fetched successfully',
      data: toCamelCase(categories),
      timestamp: Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    next(error);
  }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {
      approval_status: 'approved',
      is_active: true
    };
    const andFilters = [];

    // 1. Keyword Search
    if (q) {
      query.$text = { $search: q };
    }

    // 2. Category Filter
    if (category) {
      // Find category and its children if needed, but for now exact match or specific hierarchy
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        // If it's a parent, we might want to include subcategories. 
        // For simplicity, let's just find products in this exact category or its children.
        const subCats = await Category.find({ parent_id: cat._id });
        const catIds = [cat._id, ...subCats.map(c => c._id)];
        andFilters.push({
          $or: [
            { category_id: { $in: catIds } },
            { category: { $in: catIds } }
          ]
        });
      }
    }

    // 3. Price Range — support both selling_price and base_price fields
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      // Match products that have EITHER field name
      andFilters.push({
        $or: [
          { selling_price: priceFilter },
          { base_price: priceFilter }
        ]
      });
    }

    // 4. Rating
    if (rating) {
      query.average_rating = { $gte: Number(rating) };
    }

    if (andFilters.length > 0) {
      query.$and = andFilters;
    }

    // 5. Sorting — use base_price as fallback sort field for price
    let sortOption = { createdAt: -1 }; // Default: Newest
    if (sort === 'price_asc') sortOption = { base_price: 1, selling_price: 1 };
    else if (sort === 'price_desc') sortOption = { base_price: -1, selling_price: -1 };
    else if (sort === 'top_rated') sortOption = { average_rating: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    // 6. Execution with Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    // 7. Attach Media & Categories — handle both DB schemas
    const results = await Promise.all(products.map(async (p) => {
      const obj = p.toObject();

      // Normalize prices
      if (!obj.selling_price && obj.base_price) obj.selling_price = obj.base_price;
      if (!obj.mrp_price) obj.mrp_price = obj.selling_price || obj.base_price || 0;

      // Normalize media
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
        const externalMedia = await ProductMedia.find({ product_id: p._id }).sort({ sort_order: 1 }).limit(1);
        mediaUrls = externalMedia.map(m => m.media_url);
      }

      // Normalize category ref
      const catId = obj.category_id || obj.category;
      const cat = catId ? await Category.findById(catId).select('name slug') : null;

      return {
        ...obj,
        media: mediaUrls,
        category: cat
      };
    }));

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Products fetched successfully',
      data: toCamelCase(results),
      meta: {
        pagination: {
          total,
          count: results.length,
          perPage: Number(limit),
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit))
        }
      },
      timestamp: Math.floor(Date.now() / 1000)
    });

  } catch (error) {
    next(error);
  }
};
