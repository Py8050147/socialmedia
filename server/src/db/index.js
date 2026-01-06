
import fastifyMongodb from "@fastify/mongodb";
import { DB_NAME } from "../constant.js";

export const db = async (fastify) => {
  try {
    console.log('🔌 Attempting MongoDB connection...');
    console.log(`📍 URL: ${process.env.DATABASE_URL}`);
    console.log(`📦 Database: ${DB_NAME}`);

    await fastify.register(fastifyMongodb, {
      forceClose: true,
      url: `${process.env.DATABASE_URL}/${DB_NAME}`,
      // Reduce timeout to fail faster
      serverSelectionTimeoutMS: 5000, // 5 seconds instead of 30
      connectTimeoutMS: 10000,
    });

    console.log('✅ MongoDB plugin registered');

    // Test the connection
    const database = fastify.mongo.db;
    await database.admin().ping();
    console.log('✅ MongoDB connection successful!');

  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n🔴 MongoDB server is NOT RUNNING!');
      console.error('\n💡 Solutions:');
      console.error('   1. Start MongoDB service:');
      console.error('      - Open services.msc');
      console.error('      - Find "MongoDB" and click Start');
      console.error('   2. Or run manually:');
      console.error('      - mongod --dbpath C:\\data\\db');
      console.error('   3. Or use Docker:');
      console.error('      - docker run -d -p 27017:27017 mongo');
      console.error('   4. Or install MongoDB:');
      console.error('      - https://www.mongodb.com/try/download/community');
    } else if (error.message.includes('Server selection timed out')) {
      console.error('\n🔴 Cannot connect to MongoDB server');
      console.error('\n💡 Check:');
      console.error(`   - Is MongoDB running on: ${process.env.DATABASE_URL}`);
      console.error('   - Check your .env file DATABASE_URL');
      console.error('   - Check if port 27017 is being used by another app');
    } else {
      console.error('\n🔴 Unknown MongoDB error');
      console.error('Full error:', error);
    }

    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    throw error;
  }
};

// import fastifyMongo from "@fastify/mongodb"
// import { DB_NAME } from "../constant.js";

// export const db = async (fastify) => {
//   try {
//     console.log('🔌 Connecting to MongoDB...');
//     console.log(`📍 Database URL: ${process.env.DATABASE_URL}`);
//     console.log(`📦 Database Name: ${DB_NAME}`);

//     await fastify.register(fastifyMongo, {
//       forceClose: true,
//       url: `${process.env.DATABASE_URL}/${DB_NAME}`,
//       // Add connection options to prevent timeout
//       // useNewUrlParser: true,
//       // useUnifiedTopology: true,
//       // serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
//       // connectTimeoutMS: 10000,
//     });

//     console.log('✅ MongoDB plugin registered');

//     // Test the connection
//     const database = fastify.mongo.db;
//     await database.admin().ping();
//     console.log('✅ MongoDB connection successful!');

//     // List existing collections
//     const collections = await database.listCollections().toArray();
//     console.log(`📚 Available collections: ${collections.map(c => c.name).join(', ') || 'none'}`);

//   } catch (error) {
//     console.error('❌ MongoDB connection failed!');
//     console.error('Error details:', error.message);

//     if (error.message.includes('ECONNREFUSED')) {
//       console.error('\n⚠️  MongoDB server is not running!');
//       console.error('💡 Start MongoDB with: mongod');
//       console.error('💡 Or if using Docker: docker run -d -p 27017:27017 mongo');
//     } else if (error.message.includes('Server selection timed out')) {
//       console.error('\n⚠️  Cannot connect to MongoDB server');
//       console.error('💡 Check if MongoDB is running on:', process.env.DATABASE_URL);
//       console.error('💡 Check your connection string in .env file');
//     }

//     throw error;
//   }
// };




// import fastifyMongo from "@fastify/mongodb";
// import { DB_NAME } from "../constant.js";
// import Fastify from "fastify";
// const fastify = Fastify({
//     logger: true
// })

// // Pass the fastify instance as a parameter
// const db = async (fastify) => {
//     try {
//         await fastify.register(fastifyMongo, {
//             forceClose: true,
//             url: `${process.env.DATABASE_URL}/${DB_NAME}`
//         });

//         console.log('✅ MongoDB connected successfully');
//     } catch (error) {
//         console.error('❌ MongoDB connection failed:', error);
//         throw error;
//     }
// };

// export { db };


// ============================================
// FILE: index.js or server.js - HOW TO USE IT
// ============================================
/*
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookies from "@fastify/cookie";
import { db } from "./db/index.js";
import { userRoutes } from "./router/userRouter.js";

const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Register cookies
await fastify.register(cookies, {
  secret: process.env.COOKIE_SECRET || "my-secret",
  hook: 'onRequest',
  parseOptions: {}
});

// Connect to MongoDB - PASS the fastify instance
await db(fastify);

// Register routes
await fastify.register(userRoutes, { prefix: '/api' });

// Test route to verify MongoDB connection
fastify.get('/db-test', async (request, reply) => {
  try {
    // Access MongoDB through fastify.mongo
    const db = fastify.mongo.db;
    const collections = await db.listCollections().toArray();
    return {
      status: 'connected',
      database: process.env.APP_NAME,
      collections: collections.map(c => c.name)
    };
  } catch (error) {
    return reply.code(500).send({ error: error.message });
  }
});

// Health check
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    mongodb: fastify.mongo ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  };
});

// Print routes
await fastify.ready();
console.log('\n=================================');
console.log('📋 REGISTERED ROUTES:');
console.log('=================================');
console.log(fastify.printRoutes());
console.log('=================================\n');

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(error.statusCode || 500).send({
    error: error.message || 'Internal Server Error',
    statusCode: error.statusCode || 500
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT) || 4000;
    const host = '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`\n✅ Server running on http://localhost:${port}`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();
*/


// ============================================
// ALTERNATIVE: Register MongoDB directly in server
// ============================================
/*
import Fastify from "fastify";
import fastifyMongo from "@fastify/mongodb";

const fastify = Fastify({ logger: true });

// Register MongoDB directly
await fastify.register(fastifyMongo, {
  forceClose: true,
  url: `${process.env.DATABASE_URL}/${process.env.APP_NAME}`
});

console.log('✅ MongoDB connected');

// Now you can access MongoDB via fastify.mongo.db
fastify.get('/users', async (request, reply) => {
  const db = fastify.mongo.db;
  const users = await db.collection('users').find().toArray();
  return { users };
});

await fastify.listen({ port: 4000 });
*/


// ============================================
// Example: Using MongoDB in routes
// ============================================
/*
export async function userRoutes(fastify, options) {
  // Create user with MongoDB
  fastify.post('/users', async (request, reply) => {
    try {
      const user = request.body;
      const db = fastify.mongo.db;
      
      // Insert into MongoDB
      const result = await db.collection('users').insertOne({
        email: user.email,
        username: user.username,
        password: user.password, // Remember to hash in production!
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return reply.code(201).send({
        id: result.insertedId,
        email: user.email,
        username: user.username,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return reply.code(500).send({ error: error.message });
    }
  });
  
  // Get all users from MongoDB
  fastify.get('/users', async (request, reply) => {
    try {
      const { page = 1, limit = 10 } = request.query;
      const db = fastify.mongo.db;
      
      const users = await db.collection('users')
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
      
      const total = await db.collection('users').countDocuments();
      
      return {
        users: users.map(u => ({
          id: u._id,
          email: u.email,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          createdAt: u.createdAt
        })),
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    } catch (error) {
      console.error('Error getting users:', error);
      return reply.code(500).send({ error: error.message });
    }
  });
}
*/