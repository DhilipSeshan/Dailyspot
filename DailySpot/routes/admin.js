var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Product = require('../models/product');
var Order = require('../models/order');
var Category = require('../models/category');
var { requireAdmin } = require('../middleware/auth');
require('dotenv').config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@dailyspot.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';

router.get('/login', function (req, res) {
  if (req.session.isAdmin) return res.redirect('/ds-admin-9x7k/dashboard');
  res.render('admin/login', { title: 'Admin Login — Dailyspot' });
});

router.post('/login', function (req, res) {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect('/ds-admin-9x7k/dashboard');
  }
  req.flash('error', 'Invalid admin credentials.');
  res.redirect('/ds-admin-9x7k/login');
});

router.get('/logout', function (req, res) {
  req.session.isAdmin = false;
  res.redirect('/ds-admin-9x7k/login');
});

router.get('/dashboard', requireAdmin, async function (req, res, next) {
  try {
    const [totalProducts, totalOrders, totalUsers, revenue] = await Promise.all([
      Product.count(), Order.count(), User.count(), Order.totalRevenue(),
    ]);
    const recentOrders = (await Order.findAll()).slice(0, 5);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard — Dailyspot',
      totalProducts, totalOrders, totalUsers, revenue: parseFloat(revenue).toFixed(2), recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/products', requireAdmin, async function (req, res, next) {
  try {
    const [products, categories] = await Promise.all([Product.findAll(), Category.findAll()]);
    res.render('admin/products/index', { title: 'Products — Admin', products, categories });
  } catch (err) {
    next(err);
  }
});

router.get('/products/add', requireAdmin, async function (req, res, next) {
  try {
    const categories = await Category.findAll();
    res.render('admin/products/add', { title: 'Add Product — Admin', categories });
  } catch (err) {
    next(err);
  }
});

router.post('/products/add', requireAdmin, async function (req, res, next) {
  try {
    const { name, description, price, image_url, category_id, stock, featured } = req.body;
    await Product.create({ name, description, price: parseFloat(price), image_url, category_id, stock: parseInt(stock), featured: featured === 'on' });
    req.flash('success', 'Product added successfully!');
    res.redirect('/ds-admin-9x7k/products');
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id/edit', requireAdmin, async function (req, res, next) {
  try {
    const [product, categories] = await Promise.all([Product.findById(req.params.id), Category.findAll()]);
    if (!product) return next();
    res.render('admin/products/edit', { title: 'Edit Product — Admin', product, categories });
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id/edit', requireAdmin, async function (req, res, next) {
  try {
    const { name, description, price, image_url, category_id, stock, featured } = req.body;
    await Product.update(req.params.id, { name, description, price: parseFloat(price), image_url, category_id, stock: parseInt(stock), featured: featured === 'on' });
    req.flash('success', 'Product updated successfully!');
    res.redirect('/ds-admin-9x7k/products');
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id/delete', requireAdmin, async function (req, res, next) {
  try {
    await Product.delete(req.params.id);
    req.flash('success', 'Product deleted.');
    res.redirect('/ds-admin-9x7k/products');
  } catch (err) {
    next(err);
  }
});

router.get('/orders', requireAdmin, async function (req, res, next) {
  try {
    const orders = await Order.findAll();
    res.render('admin/orders/index', { title: 'Orders — Admin', orders });
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:id/status', requireAdmin, async function (req, res, next) {
  try {
    const { status } = req.body;
    await Order.updateStatus(req.params.id, status);
    req.flash('success', 'Order status updated.');
    res.redirect('/ds-admin-9x7k/orders');
  } catch (err) {
    next(err);
  }
});

router.get('/users', requireAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    res.render('admin/users/index', { title: 'Users — Admin', users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
