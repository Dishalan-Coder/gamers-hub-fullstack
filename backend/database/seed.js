require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const products = [
  {
    name: 'Nebula RGB Mechanical Keyboard',
    category: 'Keyboards',
    price: 18500,
    stock: 18,
    image_url: '/images/keyboard.jpg',
    description: 'Hot-swappable gaming keyboard with blue switches, RGB lighting, and compact tournament layout.',
  },
  {
    name: 'ShadowStrike Wireless Gaming Mouse',
    category: 'Mice',
    price: 11900,
    stock: 24,
    image_url: '/images/mouse.jpg',
    description: 'Lightweight wireless mouse with 16000 DPI sensor, side buttons, and long battery life.',
  },
  {
    name: 'PulseX 7.1 Surround Headset',
    category: 'Headsets',
    price: 14900,
    stock: 15,
    image_url: '/images/headset.jpg',
    description: 'Comfortable over-ear gaming headset with noise-cancelling microphone and virtual surround sound.',
  },
  {
    name: 'TurboPad Pro Controller',
    category: 'Controllers',
    price: 13200,
    stock: 20,
    image_url: '/images/controller.jpg',
    description: 'USB and Bluetooth controller with responsive triggers, vibration, and phone holder support.',
  },
  {
    name: 'Titan XL RGB Desk Mat',
    category: 'Desk Gear',
    price: 7600,
    stock: 30,
    image_url: '/images/mat.jpg',
    description: 'Large non-slip desk mat with stitched edges and soft RGB glow for keyboard and mouse setups.',
  },
  {
    name: 'ArcadeGlow Mini Speakers',
    category: 'Audio',
    price: 9800,
    stock: 16,
    image_url: '/images/speakers.jpg',
    description: 'Compact stereo speakers with strong bass, USB power, and neon gaming light effects.',
  },
  {
    name: 'Falcon 1080p Streaming Webcam',
    category: 'Streaming',
    price: 10900,
    stock: 14,
    image_url: '/images/webcam.jpg',
    description: 'Full HD webcam with built-in privacy cover and clear microphone for streaming and meetings.',
  },
  {
    name: 'FrostByte Laptop Cooling Pad',
    category: 'Cooling',
    price: 8900,
    stock: 22,
    image_url: '/images/cooler.jpg',
    description: 'Adjustable cooling pad with quiet fans, USB hub, and blue LED airflow design.',
  },
  {
    name: 'NovaCast USB Condenser Mic',
    category: 'Streaming',
    price: 16700,
    stock: 12,
    image_url: '/images/mic.jpg',
    description: 'Studio-style USB microphone with mute button, shock stand, and clean voice capture.',
  },
  {
    name: 'Quantum Ergonomic Gaming Chair',
    category: 'Chairs',
    price: 58500,
    stock: 8,
    image_url: '/images/chair.jpg',
    description: 'Premium gaming chair with lumbar pillow, adjustable arm rests, and reclining comfort.',
  },
];

const seed = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Seeding Gamers Hub database...');

    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const userPassword = await bcrypt.hash('User@1234', 10);

    await connection.query(
      `INSERT INTO users (name, email, phone, password, role, status)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), role = VALUES(role), status = VALUES(status)`,
      ['Main Admin', 'admin@gamershub.lk', '0771111111', adminPassword, 'admin', 'active']
    );

    await connection.query(
      `INSERT INTO users (name, email, phone, password, role, status)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), role = VALUES(role), status = VALUES(status)`,
      ['Demo Customer', 'user@gamershub.lk', '0772222222', userPassword, 'user', 'active']
    );

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DELETE FROM request_items');
    await connection.query('DELETE FROM product_requests');
    await connection.query('DELETE FROM wishlist_items');
    await connection.query('DELETE FROM cart_items');
    await connection.query('DELETE FROM products');
    await connection.query('ALTER TABLE products AUTO_INCREMENT = 1');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    for (const product of products) {
      await connection.query(
        `INSERT INTO products (name, category, price, stock, image_url, description, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [product.name, product.category, product.price, product.stock, product.image_url, product.description]
      );
    }

    console.log('Seed complete.');
    console.log('Admin login: admin@gamershub.lk / Admin@123');
    console.log('User login: user@gamershub.lk / User@1234');
  } catch (error) {
    console.error('Seed failed:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
};

seed();
