// ============================================
// FILE: index.js or server.js - CORRECTED
// ============================================
import Fastify from 'fastify';
import { db } from './db/index.js';
import { configureApp } from './app.js'; // Renamed from fastifyapp

const fastify = Fastify({
    logger: true
});

// Configure the app (routes, plugins, etc.)
await configureApp(fastify);

// Connect to MongoDB - pass the fastify instance
await db(fastify);

// Start server
const start = async () => {
    try {
        const port = parseInt(process.env.PORT) || 4000;
        const host = '0.0.0.0';

        await fastify.listen({ port, host });
        console.log(`✅ Server is running at http://localhost:${port}`);
    } catch (error) {
        console.error('❌ MongoDB connection failed!', error);
        process.exit(1);
    }
};

start();