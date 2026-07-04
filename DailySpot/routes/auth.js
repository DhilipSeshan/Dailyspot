var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/login', function (req, res) {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/login', { title: 'Login — Dailyspot' });
});

router.post('/login', async function (req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !(await User.verifyPassword(password, user.password_hash))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

router.get('/register', function (req, res) {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/register', { title: 'Register — Dailyspot' });
});

router.post('/register', async function (req, res, next) {
  try {
    const { name, email, password, confirm_password } = req.body;
    if (password !== confirm_password) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/auth/register');
    }
    const existing = await User.findByEmail(email);
    if (existing) {
      req.flash('error', 'Email is already registered.');
      return res.redirect('/auth/register');
    }
    await User.create(name, email, password);
    req.flash('success', 'Account created! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    next(err);
  }
});

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
