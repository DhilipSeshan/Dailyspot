var express = require('express');
var router = express.Router();
var Order = require('../models/order');

router.get('/', function (req, res) {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect('/cart');
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  res.render('checkout', { title: 'Checkout — Dailyspot', cart, total: total.toFixed(2) });
});

router.post('/', async function (req, res, next) {
  try {
    const cart = req.session.cart || [];
    if (!cart.length) return res.redirect('/cart');
    const { full_name, address, phone } = req.body;
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const orderId = await Order.create({
      user_id: req.session.userId || null,
      full_name,
      address,
      phone,
      total_amount: total.toFixed(2),
      items: cart,
    });
    req.session.cart = [];
    res.redirect(`/checkout/success/${orderId}`);
  } catch (err) {
    next(err);
  }
});

router.get('/success/:id', async function (req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next();
    res.render('order-success', { title: 'Order Confirmed — Dailyspot', order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
