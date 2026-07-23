require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db/connectDB');
const Category = require('./models/Category');
const Product = require('./models/Product');

const sampleCategories = [
  { name: 'Electronics', description: 'Gadgets, devices, and computing essentials', slug: 'electronics' },
  { name: 'Books', description: 'Physical books, e-books, and educational audio', slug: 'books' },
  { name: 'Apparel', description: 'Clothing, footwear, and accessories', slug: 'apparel' }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Starting database cleanup...');
    
    await Product.deleteMany({});
    console.log('Products cleared.');
    
    await Category.deleteMany({});
    console.log('Categories cleared.');

    console.log('Seeding new data...');
    
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`Successfully seeded ${createdCategories.length} categories.`);

    const [electronics, books, apparel] = createdCategories;

    const sampleProducts = [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Noise-canceling over-ear headphones',
        price: 99.99,
        stock: 25,
        category: electronics._id,
        images: ['https://example.com/images/headphones1.jpg'],
        inStock: true
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit tactile mechanical keyboard',
        price: 74.50,
        stock: 15,
        category: electronics._id,
        images: ['https://example.com/images/keyboard.jpg'],
        inStock: true
      },
      {
        name: 'The Pragmatic Programmer Book',
        description: 'Your journey to mastery classic software book',
        price: 39.99,
        stock: 40,
        category: books._id,
        images: ['https://example.com/images/book1.jpg'],
        inStock: true
      },
      {
        name: 'Node.js Design Patterns',
        description: 'Master production grade backend patterns',
        price: 45.00,
        stock: 12,
        category: books._id,
        images: ['https://example.com/images/book2.jpg'],
        inStock: true
      },
      {
        name: 'Classic Leather Jacket',
        description: 'Premium slim-fit vintage leather apparel jacket',
        price: 189.00,
        stock: 8,
        category: apparel._id,
        images: ['https://example.com/images/jacket.jpg'],
        inStock: true
      },
      {
        name: 'Running Sports Shoes',
        description: 'Lightweight breathable mesh sneakers',
        price: 65.00,
        stock: 0,
        category: apparel._id,
        images: ['https://example.com/images/shoes.jpg'],
        inStock: false
      }
    ];

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${createdProducts.length} products.`);
    
    console.log(`Summary: Added ${createdCategories.length} categories and ${createdProducts.length} products.`);
    
  } catch (error) {
    console.error(`Error during seeding lifecycle: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection safely closed.');
    process.exit(0);
  }
};

seedDatabase();