export const followerSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        followers_id: { type: "string" },
        following_id: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
    },
    required: ['followers_id', 'following_id']
}