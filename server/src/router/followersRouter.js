import { followerSchema } from "../schema/followersSchema.js";
import { randomUUID } from "crypto";

export async function followersRoute(fastify, opts) {
    fastify.post("/followers", {
        schema: {
            body: followerSchema,
            response: {
                201: followerSchema
            }
        }
    }, async (request, reply) => {
        const { followers_id, following_id } = request.body;

        // Check if user is trying to follow themselves
        if (followers_id === following_id) {
            return reply.code(400).send({ error: "You cannot follow yourself" });
        }

        const db = fastify.mongo.db;
        const followersCollection = db.collection('followers');
        // const usersCollection = db.collection('users');

        // Check if both users exist using _id (MongoDB's default field)
        // let followerExists, followingExists;

        // try {
        //     followerExists = await usersCollection.findOne({ _id: new ObjectId(followers_id) });
        //     followingExists = await usersCollection.findOne({ _id: new ObjectId(following_id) });
        // } catch (error) {
        //     return reply.code(400).send({ error: "Invalid user ID format" });
        // }

        // if (!followerExists) {
        //     return reply.code(404).send({ error: "Follower user not found" });
        // }

        // if (!followingExists) {
        //     return reply.code(404).send({ error: "Following user not found" });
        // }
        // Check if already following
        // const existingFollow = await followersCollection.findOne({
        //     followers_id,
        //     following_id
        // });

        // if (existingFollow) {
        //     return reply.code(400).send({ error: "Already following this user" });
        // }

        // Create follow document
        const follow = {
            id: randomUUID(),
            followers_id,
            following_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Insert into MongoDB
        await followersCollection.insertOne(follow);

        console.log("follow saved:", follow);

        reply.code(201).send(follow);
    });
}