const db = require('../config/db');

const Product = {
  async findAll({ category_id, search } = {}) {
    let sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const args = [];
    if (category_id) {
      sql += ' AND p.category_id = ?';
      args.push(category_id);
    }
    if (search) {
      sql += ' AND p.name LIKE ?';
      args.push(`%${search}%`);
    }
    sql += ' ORDER BY p.created_at DESC';
    const result = await db.execute({ sql, args });
    return result.rows;
  },

  async findById(id) {
    const result = await db.execute({
      sql: `SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?`,
      args: [id],
    });
    return result.rows[0] || null;
  },

  async findFeatured() {
    const result = await db.execute({
      sql: `SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.featured = 1 LIMIT 6`,
      args: [],
    });
    return result.rows;
  },

  async create({ name, description, price, image_url, category_id, stock, featured }) {
    const result = await db.execute({
      sql: 'INSERT INTO products (name, description, price, image_url, category_id, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [name, description, price, image_url, category_id, stock || 0, featured ? 1 : 0],
    });
    return result.lastInsertRowid;
  },

  async update(id, { name, description, price, image_url, category_id, stock, featured }) {
    await db.execute({
      sql: 'UPDATE products SET name=?, description=?, price=?, image_url=?, category_id=?, stock=?, featured=? WHERE id=?',
      args: [name, description, price, image_url, category_id, stock, featured ? 1 : 0, id],
    });
  },

  async delete(id) {
    await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
  },

  async count() {
    const result = await db.execute('SELECT COUNT(*) as total FROM products');
    return result.rows[0].total;
  },
};

module.exports = Product;
