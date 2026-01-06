// User schema definitions for Fastify (ES Module)
export const userSchema = {
    // Schema for user object
    users: {
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string', minLength: 3, maxLength: 30 },
            password: { type: 'string', minLength: 5 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        }
    },

    // POST /users - Create user
    // createUser: {
    //     body: {
    //         type: 'object',
    //         required: ['email', 'name', 'password'],
    //         properties: {
    //             email: { type: 'string', format: 'email' },
    //             name: { type: 'string', minLength: 3, maxLength: 30 },
    //             password: { type: 'string', minLength: 8 },
    //         }
    //     },
    //     response: {
    //         200: {
    //             type: 'object',
    //             properties: {
    //                 id: { type: 'string', format: 'uuid' },
    //                 email: { type: 'string', format: 'email' },
    //                 name: { type: 'string' },
    //                 createdAt: { type: 'string', format: 'date-time' }
    //             }
    //         }
    //     }
    // },

    // GET /users/:id - Get user by ID
    // getUser: {
    //     params: {
    //         type: 'object',
    //         required: ['id'],
    //         properties: {
    //             id: { type: 'string', format: 'uuid' }
    //         }
    //     },
    //     response: {
    //         200: {
    //             type: 'object',
    //             properties: {
    //                 id: { type: 'string', format: 'uuid' },
    //                 email: { type: 'string', format: 'email' },
    //                 name: { type: 'string' },
    //                 createdAt: { type: 'string', format: 'date-time' },
    //                 updatedAt: { type: 'string', format: 'date-time' }
    //             }
    //         }
    //     }
    // },

    // GET /users - Get all users
    // getUsers: {
    //     querystring: {
    //         type: 'object',
    //         properties: {
    //             page: { type: 'integer', minimum: 1, default: 1 },
    //             limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
    //         }
    //     },
    //     response: {
    //         200: {
    //             type: 'object',
    //             properties: {
    //                 users: {
    //                     type: 'array',
    //                     items: {
    //                         type: 'object',
    //                         properties: {
    //                             id: { type: 'string', format: 'uuid' },
    //                             email: { type: 'string', format: 'email' },
    //                             username: { type: 'string' },
    //                             firstName: { type: 'string' },
    //                             lastName: { type: 'string' },
    //                             createdAt: { type: 'string', format: 'date-time' }
    //                         }
    //                     }
    //                 },
    //                 total: { type: 'integer' },
    //                 page: { type: 'integer' },
    //                 limit: { type: 'integer' }
    //             }
    //         }
    //     }
    // },

    // PUT /users/:id - Update user
    // updateUser: {
    //     params: {
    //         type: 'object',
    //         required: ['id'],
    //         properties: {
    //             id: { type: 'string', format: 'uuid' }
    //         }
    //     },
    //     body: {
    //         type: 'object',
    //         properties: {
    //             email: { type: 'string', format: 'email' },
    //             username: { type: 'string', minLength: 3, maxLength: 30 },
    //             firstName: { type: 'string', minLength: 1, maxLength: 50 },
    //             lastName: { type: 'string', minLength: 1, maxLength: 50 }
    //         }
    //     },
    //     response: {
    //         200: {
    //             type: 'object',
    //             properties: {
    //                 id: { type: 'string', format: 'uuid' },
    //                 email: { type: 'string', format: 'email' },
    //                 username: { type: 'string' },
    //                 firstName: { type: 'string' },
    //                 lastName: { type: 'string' },
    //                 updatedAt: { type: 'string', format: 'date-time' }
    //             }
    //         }
    //     }
    // },

    // DELETE /users/:id - Delete user
    // deleteUser: {
    //     params: {
    //         type: 'object',
    //         required: ['id'],
    //         properties: {
    //             id: { type: 'string', format: 'uuid' }
    //         }
    //     },
    //     response: {
    //         204: {
    //             type: 'null',
    //             description: 'No content'
    //         }
    //     }
    // }
};

