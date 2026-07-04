var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');

router.get('/', async function (req, res, next) {
  try {
    const { category, search } = req.query;
    const [products, categories] = await Promise.all([
      Product.findAll({ category_id: category || null, search: search || null }),
      Category.findAll(),
    ]);
    res.render('shop/index', { title: 'Shop — Dailyspot', products, categories, activeCategory: category || null, search: search || '' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next();
    res.render('shop/detail', { title: product.name + ' — Dailyspot', product });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
