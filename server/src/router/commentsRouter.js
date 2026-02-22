import Fastify from 'fastify';

const fastify = Fastify({ logger: true });
import { commentsSchema } from '../schema/commentsSchema.js';
import { postSchema } from "../schema/postSchema.js"


export async function commentsRoutes(fastify, opts) {
    fastify.post('/comments', {
        schema: {
            body: commentsSchema,
            response: {
                201: commentsSchema
            }
        }
    }, async (request, reply) => {
        const { id, user_id, post_id, parents_comments_id, content } = request.body;
        const db = fastify.mongo.db;
        const commentsCollection = db.collection('comments');
        const postsCollection = db.collection('posts');
        const post = await postsCollection.findOne({ id: post_id });
        if (!post) {
            return reply.status(404).send({ message: 'Post not found' });
        }
        const comment = {
            id: new fastify.mongo.ObjectId().toString(),
            user_id,
            post_id: post_id,
            parents_comments_id: parents_comments_id || null,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await commentsCollection.insertOne(comment);
        reply.status(201).send(comment);
    });
}