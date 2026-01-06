export const postSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        user_id: { type: 'string' },
        post_type: {
            type: 'string',
            enum: ['text', 'image', 'video', 'carousel', 'reel']
        },
        caption: { type: 'string' },
        content: {
            type: 'object',
            properties: {
                text: { type: 'string' },
                media_url: { type: 'string', format: 'uri' },
                media_urls: {
                    type: 'array',
                    items: { type: 'string', format: 'uri' }
                },
                thumbnail_url: { type: 'string', format: 'uri' },
                duration: { type: 'number' }, // for videos
                aspect_ratio: { type: 'string' } // e.g., "1:1", "16:9", "4:5"
            }
        },
        location: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        is_archived: { type: 'boolean' }
    },
    required: ['id', 'user_id', 'post_type', 'content']
};

