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

}