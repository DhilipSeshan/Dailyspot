const db = require('../config/db');

const Order = {
  async create({ user_id, full_name, address, phone, total_amount, items }) {
    const orderResult = await db.execute({
      sql: 'INSERT INTO orders (user_id, full_name, address, phone, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      args: [user_id || null, full_name, address, phone, total_amount, 'pending'],
    });
    const orderId = orderResult.lastInsertRowid;
    for (const item of items) {
      await db.execute({
        sql: 'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        args: [orderId, item.id, item.name, item.qty, item.price],
      });
    }
    return orderId;
  },

  async findByUser(user_id) {
    const result = await db.execute({
      sql: 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      args: [user_id],
    });
    return result.rows;
  },

  async findById(id) {
    const orderResult = await db.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id],
    });
    const order = orderResult.rows[0];
    if (!order) return null;
    const itemsResult = await db.execute({
      sql: 'SELECT * FROM order_items WHERE order_id = ?',
      args: [id],
    });
    return { ...order, items: itemsResult.rows };
  },

  async findAll() {
    const result = await db.execute(`
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    return result.rows;
  },

  async updateStatus(id, status) {
    await db.execute({
      sql: 'UPDATE orders SET status = ? WHERE id = ?',
      args: [status, id],
    });
  },

  async count() {
    const result = await db.execute('SELECT COUNT(*) as total FROM orders');
    return result.rows[0].total;
  },

  async totalRevenue() {
    const result = await db.execute("SELECT SUM(total_amount) as revenue FROM orders WHERE status != 'cancelled'");
    return result.rows[0].revenue || 0;
  },
};

module.exports = Order;
