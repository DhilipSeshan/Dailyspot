const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async findByEmail(email) {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email],
    });
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await db.execute({
      sql: 'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      args: [id],
    });
    return result.rows[0] || null;
  },

  async create(name, email, password) {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.execute({
      sql: 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      args: [name, email, hash],
    });
    return result.lastInsertRowid;
  },

  async verifyPassword(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  },

  async findAll() {
    const result = await db.execute('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  },

  async count() {
    const result = await db.execute('SELECT COUNT(*) as total FROM users');
    return result.rows[0].total;
  },
};

module.exports = User;
