export const storySchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        user_id: { type: 'string' },
        media_type: {
            type: 'string',
            enum: ['image', 'video', 'text', 'gif', 'audio']
        },
        media_url: { type: 'string', format: 'uri' },
        content: { type: 'string' },
        caption: { type: 'string' },
        expires_at: { type: 'string', format: 'date-time' },
        is_highlighted: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'user_id', 'media_type']
}