// router/userRouter.js

import { userSchema } from "../schema/userSchema.js";

import bcrypt from "bcrypt"

export async function userRoutes(fastify, options) {
    // Create user - REMOVE /api from path since you're using prefix: '/api'
    fastify.post('/users', {
        schema: userSchema.users
    }, async (request, reply) => {
        try {
            const { email, name, password } = request.body;
            // console.log('Creating user:', user);
            const db = fastify.mongo.db;
            console.log('dbnew', db)
            const usersCollection = db.collection('users');
            console.log('usersCollectionn', usersCollection)
            const existingUser = await usersCollection.findOne({
                $or: [{ email }, { name }]
            });
            console.log('existingUser', existingUser)

            if (existingUser) {
                return reply.code(409).send({
                    error: 'User already exists',
                    message: existingUser.email === email
                        ? 'Email already registered'
                        : 'Username already taken'
                });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user document
            const newUser = {
                email,
                name,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Insert into database
            const result = await usersCollection.insertOne(newUser);

            console.log('result', result)

            // Return response (without password)
            return reply.code(201).send({
                id: result.insertedId.toString(),
                email: newUser.email,
                name: newUser.name,
                createdAt: newUser.createdAt.toISOString()
            });

        } catch (error) {
            console.error('Error creating user:', error);
            return reply.code(500).send({
                error: 'Failed to create user',
                message: error.message
            });
        }
    });

    // Get user by ID
    fastify.get('/users/:id', {
        schema: userSchema.users
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            console.log('Getting user:', id);

            // Fetch and return user
            reply.send({
                id,
                email: 'user@example.com',
                name: 'johndoe',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error getting user:', error);
            reply.code(500).send({ error: error.message });
        }
    });

    // Get all users
    fastify.get('/users', {
        schema: userSchema.users
    }, async (request, reply) => {
        try {
            const { page = 1, limit = 10 } = request.query;
            const db = fastify.mongo.db;
            const usersCollection = db.collection('users');

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Fetch users (exclude password field)
            const users = await usersCollection
                .find({}, { projection: { password: 0 } })
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 })
                .toArray();

            const total = await usersCollection.countDocuments();

            return {
                users: users.map(user => ({
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    createdAt: user.createdAt
                })),
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            };

        } catch (error) {
            console.error('Error getting users:', error);
            return reply.code(500).send({ error: error.message });
        }
    });


    // Update user
    fastify.put('/users/:id', {
        schema: userSchema.updateUser
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const updates = request.body;
            console.log('Updating user:', id, updates);

            // Update and return user
            reply.send({
                id,
                ...updates,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating user:', error);
            reply.code(500).send({ error: error.message });
        }
    });

    // Delete user
    fastify.delete('/users/:id', {
        schema: userSchema.deleteUser
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            console.log('Deleting user:', id);

            // Delete user
            reply.code(204).send();
        } catch (error) {
            console.error('Error deleting user:', error);
            reply.code(500).send({ error: error.message });
        }
    });

    // Test route
    fastify.get('/test', async (request, reply) => {
        return { message: 'User routes are registered and working!' };
    });
}