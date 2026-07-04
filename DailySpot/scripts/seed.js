require('dotenv').config();
const db = require('../config/db');

async function seed() {
  console.log('Creating schema...');

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category_id INTEGER,
      stock INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      full_name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  console.log('Schema created. Seeding categories...');

  const categories = ['Tropical', 'Berries', 'Citrus', 'Common'];
  for (const name of categories) {
    await db.execute({ sql: 'INSERT OR IGNORE INTO categories (name) VALUES (?)', args: [name] });
  }

  const catResult = await db.execute('SELECT * FROM categories');
  const catMap = {};
  catResult.rows.forEach(c => { catMap[c.name] = c.id; });

  console.log('Seeding products...');

  const products = [
    { name: 'Red Apple', description: 'Crisp and sweet red apples, freshly picked from the orchard.', price: 2.99, image_url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400', category_id: catMap['Common'], stock: 150, featured: 1 },
    { name: 'Mango', description: 'Juicy Alphonso mangoes bursting with tropical sweetness.', price: 3.49, image_url: 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=400', category_id: catMap['Tropical'], stock: 80, featured: 1 },
    { name: 'Banana', description: 'Naturally ripened bananas — the perfect daily energy boost.', price: 1.49, image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', category_id: catMap['Common'], stock: 200, featured: 1 },
    { name: 'Strawberry', description: 'Fresh, bright red strawberries with a sweet-tart flavour.', price: 4.99, image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400', category_id: catMap['Berries'], stock: 60, featured: 1 },
    { name: 'Grapes', description: 'Seedless green grapes — chilled and refreshing.', price: 3.99, image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400', category_id: catMap['Common'], stock: 90, featured: 1 },
    { name: 'Watermelon', description: 'Giant sweet watermelons, perfect for summer hydration.', price: 5.99, image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', category_id: catMap['Tropical'], stock: 40, featured: 1 },
    { name: 'Orange', description: 'Navel oranges packed with vitamin C and citrus goodness.', price: 2.49, image_url: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', category_id: catMap['Citrus'], stock: 120, featured: 0 },
    { name: 'Pineapple', description: 'Sweet-tangy pineapples, freshly sourced from tropical farms.', price: 4.49, image_url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400', category_id: catMap['Tropical'], stock: 50, featured: 0 },
    { name: 'Blueberry', description: 'Antioxidant-rich blueberries — tiny, powerful, and delicious.', price: 5.49, image_url: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400', category_id: catMap['Berries'], stock: 70, featured: 0 },
    { name: 'Kiwi', description: 'Tangy New Zealand kiwis with brilliant green flesh.', price: 3.29, image_url: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400', category_id: catMap['Common'], stock: 85, featured: 0 },
    { name: 'Lemon', description: 'Zesty lemons for drinks, cooking, and everything in between.', price: 1.99, image_url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400', category_id: catMap['Citrus'], stock: 130, featured: 0 },
    { name: 'Papaya', description: 'Ripe papayas with silky orange flesh and gentle sweetness.', price: 3.79, image_url: 'https://images.unsplash.com/photo-1623492229917-b9d76a63ce79?w=400', category_id: catMap['Tropical'], stock: 45, featured: 0 },
  ];

  for (const p of products) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO products (name, description, price, image_url, category_id, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [p.name, p.description, p.price, p.image_url, p.category_id, p.stock, p.featured],
    });
  }

  console.log('Done! Database seeded with 4 categories and 12 fruit products.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
