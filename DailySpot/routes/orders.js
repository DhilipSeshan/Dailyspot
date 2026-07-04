var express = require('express');
var router = express.Router();
var Order = require('../models/order');
var { requireLogin } = require('../middleware/auth');

router.get('/', requireLogin, async function (req, res, next) {
  try {
    const orders = await Order.findByUser(req.session.userId);
    res.render('orders/my-orders', { title: 'My Orders — Dailyspot', orders });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireLogin, async function (req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || String(order.user_id) !== String(req.session.userId)) return next();
    res.render('orders/detail', { title: `Order #${order.id} — Dailyspot`, order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
