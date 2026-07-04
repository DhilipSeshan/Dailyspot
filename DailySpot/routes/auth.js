var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/login', function (req, res) {
  if (req.session && req.session.userId) return res.redirect('/');
  res.render('auth/login', { title: 'Login — Dailyspot' });
});

router.post('/login', async function (req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !(await User.verifyPassword(password, user.password_hash))) {
      req.flash('error', 'Invalid email or password. Please try again.');
      return req.session.save(() => res.redirect('/auth/login'));
    }
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.save(function (err) {
      if (err) return next(err);
      req.flash('success', 'Welcome back, ' + user.name + '!');
      res.redirect('/shop');
    });
  } catch (err) {
    next(err);
  }
});

router.get('/register', function (req, res) {
  if (req.session && req.session.userId) return res.redirect('/');
  res.render('auth/register', { title: 'Register — Dailyspot' });
});

router.post('/register', async function (req, res, next) {
  try {
    const { name, email, password, confirm_password } = req.body;
    if (!name || !email || !password) {
      req.flash('error', 'All fields are required.');
      return req.session.save(() => res.redirect('/auth/register'));
    }
    if (password !== confirm_password) {
      req.flash('error', 'Passwords do not match.');
      return req.session.save(() => res.redirect('/auth/register'));
    }
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return req.session.save(() => res.redirect('/auth/register'));
    }
    const existing = await User.findByEmail(email);
    if (existing) {
      req.flash('error', 'This email is already registered. Please login instead.');
      return req.session.save(() => res.redirect('/auth/login'));
    }
    const userId = await User.create(name, email, password);
    req.session.userId = userId;
    req.session.userName = name;
    req.session.save(function (err) {
      if (err) return next(err);
      req.flash('success', 'Account created! Welcome to Dailyspot, ' + name + '!');
      res.redirect('/shop');
    });
  } catch (err) {
    next(err);
  }
});

router.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/');
  });
});

module.exports = router;

