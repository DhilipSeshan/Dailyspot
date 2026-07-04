const db = require('../config/db');

const Category = {
  async findAll() {
    const result = await db.execute('SELECT * FROM categories ORDER BY name');
    return result.rows;
  },

  async findById(id) {
    const result = await db.execute({
      sql: 'SELECT * FROM categories WHERE id = ?',
      args: [id],
    });
    return result.rows[0] || null;
  },
};

module.exports = Category;
