// ============================================
// FILE: app.js - Export a FUNCTION, not an instance
// ============================================
import cors from "@fastify/cors";
import cookies from "@fastify/cookie";
import { userRoutes } from "./router/userRouter.js";

export const configureApp = async (fastify) => {
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

    // Register routes with prefix
    await fastify.register(userRoutes, { prefix: '/api' });

    // Health check route
    fastify.get('/health', async (request, reply) => {
        return {
            status: 'ok',
            mongodb: fastify.mongo ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        };
    });

    // Error handler
    fastify.setErrorHandler((error, request, reply) => {
        fastify.log.error(error);
        reply.status(error.statusCode || 500).send({
            error: error.message || 'Internal Server Error',
            statusCode: error.statusCode || 500
        });
    });

    console.log('✅ App configured successfully');
};
