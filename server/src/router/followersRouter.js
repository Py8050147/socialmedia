// router/followersRouter.js
import fastify from "fastify";
import { ObjectId } from "mongodb";

export async function followersRoute(fastify, options) {
    // Follow a user
    fastify.post('/follows',
        {

            schema: {
                body: {
                    type: 'object',
                    properties: {
                        followers_id: { type: 'string' },
                        following_id: { type: 'string' }
                    },
                    required: ['followers_id', 'following_id']
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            message: { type: 'string' },
                            data: {
                                id: { type: 'string' },
                                followers_id: { type: 'string' },
                                following_id: { type: 'string' },
                                created_at: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }

            },
        },
        async (request, reply) => {
            try {
                const { followers_id, following_id } = request.body;
                // com

                // Validate input
                if (!followers_id || !following_id) {
                    return reply.code(400).send({
                        success: false,
                        message: 'follower_id and following_id are required'
                    });
                }

                // Cannot follow yourself
                if (followers_id === following_id) {
                    return reply.code(400).send({
                        success: false,
                        message: 'You cannot follow yourself'
                    });
                }

                const db = fastify.mongo.db;
                const followersCollection = db.collection('followers');

                // Check if already following
                const existingFollow = await followersCollection.findOne({
                    followers_id: followers_id,
                    following_id: following_id
                });

                if (existingFollow) {
                    return reply.code(409).send({
                        success: false,
                        message: 'Already following this user'
                    });
                }

                // Create follow relationship
                const newFollow = {
                    followers_id: followers_id,
                    following_id: following_id,
                    created_at: new Date(),
                    updated_at: new Date()
                };

                const result = await followersCollection.insertOne(newFollow);

                return reply.code(201).send({
                    success: true,
                    message: 'Successfully followed user',
                    data: {
                        id: result.insertedId.toString(),
                        followers_id: followers_id,
                        following_id: following_id,
                        created_at: newFollow.created_at.toISOString()
                    }
                });

            } catch (error) {
                console.error('Error following user:', error);
                return reply.code(500).send({
                    success: false,
                    error: 'Failed to follow user',
                    message: error.message
                });
            }
        });

    // Unfollow a user by follow relationship ID
    fastify.delete('/follows/:id', async (request, reply) => {
        try {
            const { id } = request.params;

            if (!ObjectId.isValid(id)) {
                return reply.code(400).send({
                    success: false,
                    message: 'Invalid follow ID'
                });
            }

            const db = fastify.mongo.db;
            const followersCollection = db.collection('followers');

            const result = await followersCollection.deleteOne({
                _id: new ObjectId(id)
            });

            if (result.deletedCount === 0) {
                return reply.code(404).send({
                    success: false,
                    message: 'Follow relationship not found'
                });
            }

            return reply.code(200).send({
                success: true,
                message: 'Successfully unfollowed user'
            });

        } catch (error) {
            console.error('Error unfollowing user:', error);
            return reply.code(500).send({
                success: false,
                error: 'Failed to unfollow user',
                message: error.message
            });
        }
    });

    // Unfollow by follower_id and following_id
    fastify.delete('/follows/:follower_id/:following_id', async (request, reply) => {
        try {
            const { follower_id, following_id } = request.params;

            const db = fastify.mongo.db;
            const followersCollection = db.collection('followers');

            const result = await followersCollection.deleteOne({
                followers_id: follower_id,
                following_id: following_id
            });

            if (result.deletedCount === 0) {
                return reply.code(404).send({
                    success: false,
                    message: 'Follow relationship not found'
                });
            }

            return reply.code(200).send({
                success: true,
                message: 'Successfully unfollowed user'
            });

        } catch (error) {
            console.error('Error unfollowing user:', error);
            return reply.code(500).send({
                success: false,
                error: 'Failed to unfollow user',
                message: error.message
            });
        }
    });

    // Get all followers of a user
    fastify.get('/followers/:userId', async (request, reply) => {
        try {
            const { userId } = request.params;
            const { page = 1, limit = 10 } = request.query;

            const db = fastify.mongo.db;
            const followersCollection = db.collection('followers');

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get all followers of this user
            const followers = await followersCollection
                .find({ following_id: userId })
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ created_at: -1 })
                .toArray();

            const total = await followersCollection.countDocuments({
                following_id: userId
            });

            return reply.send({
                success: true,
                data: followers.map(follow => ({
                    id: follow._id.toString(),
                    followers_id: follow.followers_id,
                    following_id: follow.following_id,
                    created_at: follow.created_at.toISOString()
                })),
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            });

        } catch (error) {
            console.error('Error getting followers:', error);
            return reply.code(500).send({
                success: false,
                error: 'Failed to get followers',
                message: error.message
            });
        }
    });

    // Get all users that someone is following
    fastify.get('/following/:userId', async (request, reply) => {
        try {
            const { userId } = request.params;
            const { page = 1, limit = 10 } = request.query;

            const db = fastify.mongo.db;
            const followersCollection = db.collection('followers');

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get all users that this user is following
            const following = await followersCollection
                .find({ followers_id: userId })
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ created_at: -1 })
                .toArray();

            const total = await followersCollection.countDocuments({
                followers_id: userId
            });

            return reply.send({
                success: true,
                data: following.map(follow => ({
                    id: follow._id.toString(),
                    followers_id: follow.followers_id,
                    following_id: follow.following_id,
                    created_at: follow.created_at.toISOString()
                })),
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            });

        } catch (error) {
            console.error('Error getting following:', error);
            return reply.code(500).send({
                success: false,
                error: 'Failed to get following',
                message: error.message
            });
        }
    });

    // Check if user is following another user
    fastify.get('/follows/check/:follower_id/:following_id', async (request, reply) => {
        try {
            const { follower_id, following_id } = request.params;

            const db = fastify.mongo.db;
            const followersCollection = db.collection('followers');

            const follow = await followersCollection.findOne({
                followers_id: follower_id,
                following_id: following_id
            });

            return reply.send({
                success: true,
                isFollowing: !!follow,
                followId: follow ? follow._id.toString() : null
            });

        } catch (error) {
            console.error('Error checking follow status:', error);
            return reply.code(500).send({
                success: false,
                error: 'Failed to check follow status',
                message: error.message
            });
        }
    });

    // Get follower and following counts
    fastify.get('/stats/:userId', async (request, reply) => {
        try {
            const { userId } = request.params;

            const db = fastify.mongo.db;
            const followersCollection = db.collection('followers');

            const followersCount = await followersCollection.countDocuments({
                following_id: userId
            });

            const followingCount = await followersCollection.countDocuments({
                followers_id: userId
            });

            return reply.send({
                success: true,
                data: {
                    userId,
                    followersCount,
                    followingCount
                }
            });

        } catch (error) {
            console.error('Error getting follow stats:', error);
            return reply.code(500).send({
                success: false,
                error: 'Failed to get follow stats',
                message: error.message
            });
        }
    });

    // Test route
    fastify.get('/follows/test', async (request, reply) => {
        return { message: 'Followers routes are registered and working!' };
    });
}
