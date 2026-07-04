var express = require('express');
var router = express.Router();
var Product = require('../models/product');

function getCart(req) {
  return req.session.cart || [];
}

router.get('/', function (req, res) {
  const cart = getCart(req);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.render('cart', { title: 'Your Cart — Dailyspot', cart, total: total.toFixed(2) });
});

router.post('/add', async function (req, res, next) {
  try {
    const { productId, qty } = req.body;
    const quantity = parseInt(qty) || 1;
    const product = await Product.findById(productId);
    if (!product) return res.redirect('/shop');
    const cart = getCart(req);
    const existing = cart.find(i => String(i.id) === String(productId));
    if (existing) {
      existing.qty += quantity;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, qty: quantity });
    }
    req.session.cart = cart;
    req.flash('success', `${product.name} added to cart!`);
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
});

router.post('/update', function (req, res) {
  const { productId, qty } = req.body;
  const cart = getCart(req);
  const item = cart.find(i => String(i.id) === String(productId));
  if (item) {
    item.qty = Math.max(1, parseInt(qty) || 1);
  }
  req.session.cart = cart;
  res.redirect('/cart');
});

router.post('/remove', function (req, res) {
  const { productId } = req.body;
  req.session.cart = getCart(req).filter(i => String(i.id) !== String(productId));
  req.flash('success', 'Item removed from cart.');
  res.redirect('/cart');
});

module.exports = router;
