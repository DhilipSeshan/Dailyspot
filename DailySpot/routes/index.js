var express = require('express');
var router = express.Router();
var Product = require('../models/product');

router.get('/', async function (req, res, next) {
  try {
    const featured = await Product.findFeatured();
    res.render('index', { title: 'Dailyspot — Fresh Fruits Delivered', featured });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

