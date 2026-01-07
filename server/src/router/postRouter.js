// import { postSchema } from "../schema/postSchema";
import { fastifyMultipart } from "@fastify/multipart"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { randomUUID } from "crypto"

export async function postRoutes(fastify, opts) {
    fastify.register(fastifyMultipart, {
        limits: {
            fileSize: 100 * 1024 * 1024, // 100MB max file size
            files: 10 // max 10 files for carousel
        }
    });
    fastify.post('/posts', async (request, reply) => {
        try {
            // Check if it's a multipart request (file upload)
            const isMultipart = request.isMultipart();

            if (!isMultipart) {
                return reply.code(400).send({
                    success: false,
                    message: 'Request must be multipart/form-data'
                });
            }

            // Collect all form fields and files
            const fields = {};
            const files = [];

            // Process all parts
            const parts = request.parts();

            for await (const part of parts) {
                if (part.type === 'field') {
                    // It's a text field
                    fields[part.fieldname] = part.value;
                } else {
                    // It's a file
                    files.push({
                        fieldname: part.fieldname,
                        filename: part.filename,
                        mimetype: part.mimetype,
                        buffer: await part.toBuffer()
                    });
                }
            }

            console.log('Received fields:', fields);
            console.log('Received files:', files.length);

            const { user_id, post_type, caption, location, text, aspect_ratio } = fields;

            // Validate required fields
            if (!user_id || !post_type) {
                return reply.code(400).send({
                    success: false,
                    message: 'user_id and post_type are required',
                    received: { user_id, post_type }
                });
            }

            // Validate post_type
            const validPostTypes = ['text', 'image', 'video', 'carousel', 'reel'];
            if (!validPostTypes.includes(post_type)) {
                return reply.code(400).send({
                    success: false,
                    message: 'Invalid post_type. Must be one of: ' + validPostTypes.join(', ')
                });
            }

            const post_id = randomUUID();
            const content = {};

            // Get the first file if exists
            const fileData = files.length > 0 ? files[0] : null;

            // Handle different post types
            switch (post_type) {
                case 'text':
                    if (!text) {
                        return reply.code(400).send({
                            success: false,
                            message: 'Text content is required for text posts'
                        });
                    }
                    content.text = text;
                    break;

                case 'image':
                    if (!fileData) {
                        return reply.code(400).send({
                            success: false,
                            message: 'Image file is required for image posts'
                        });
                    }

                    console.log('Uploading image to Cloudinary...');
                    const imageUpload = await uploadOnCloudinary(fileData.buffer, {
                        folder: `posts/${user_id}`,
                        resource_type: 'image'
                    });

                    if (!imageUpload) {
                        return reply.code(500).send({
                            success: false,
                            message: 'Failed to upload image'
                        });
                    }

                    console.log('Image uploaded:', imageUpload.secure_url);
                    content.media_url = imageUpload.secure_url;
                    content.aspect_ratio = aspect_ratio || '1:1';
                    break;

                case 'video':
                case 'reel':
                    if (!fileData) {
                        return reply.code(400).send({
                            success: false,
                            message: `Video file is required for ${post_type} posts`
                        });
                    }

                    console.log('Uploading video to Cloudinary...');
                    const videoUpload = await uploadOnCloudinary(fileData.buffer, {
                        folder: `posts/${user_id}`,
                        resource_type: 'video'
                    });

                    if (!videoUpload) {
                        return reply.code(500).send({
                            success: false,
                            message: 'Failed to upload video'
                        });
                    }

                    console.log('Video uploaded:', videoUpload.secure_url);
                    content.media_url = videoUpload.secure_url;
                    content.thumbnail_url = videoUpload.secure_url.replace(/\.[^/.]+$/, '.jpg');
                    content.duration = videoUpload.duration;
                    content.aspect_ratio = post_type === 'reel' ? '9:16' : (aspect_ratio || '16:9');
                    break;

                case 'carousel':
                    if (files.length === 0) {
                        return reply.code(400).send({
                            success: false,
                            message: 'At least one file is required for carousel posts'
                        });
                    }

                    console.log('Uploading carousel images...');
                    const carouselUrls = [];

                    for (const file of files) {
                        const carouselUpload = await uploadOnCloudinary(file.buffer, {
                            folder: `posts/${user_id}/carousel`,
                            resource_type: 'auto'
                        });

                        if (carouselUpload) {
                            carouselUrls.push(carouselUpload.secure_url);
                        }
                    }

                    if (carouselUrls.length === 0) {
                        return reply.code(500).send({
                            success: false,
                            message: 'Failed to upload carousel media'
                        });
                    }

                    console.log(`Uploaded ${carouselUrls.length} carousel images`);
                    content.media_urls = carouselUrls;
                    content.aspect_ratio = aspect_ratio || '1:1';
                    break;
            }

            // Create post object
            const post = {
                id: post_id,
                user_id,
                post_type,
                caption: caption || '',
                content,
                location: location || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_archived: false
            };

            // Save to database
            const db = fastify.mongo.db;
            const postsCollection = db.collection('posts');
            await postsCollection.insertOne(post);

            console.log('✅ Post created successfully:', post_id);

            reply.code(201).send({
                success: true,
                message: 'Post created successfully',
                data: post
            });

        } catch (error) {
            console.error('❌ Error creating post:', error);
            fastify.log.error(error);
            reply.code(500).send({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    });

    fastify.get('/posts', async (request, reply) => {
        try {
            const { user_id, post_type, limit = 20, offset = 0 } = request.query;

            const db = fastify.mongo.db;
            const postsCollection = db.collection('posts');

            // Build query
            const query = { is_archived: false };
            if (user_id) query.user_id = user_id;
            if (post_type) query.post_type = post_type;

            // Fetch posts
            const posts = await postsCollection
                .find(query)
                .sort({ created_at: -1 })
                .skip(parseInt(offset))
                .limit(parseInt(limit))
                .toArray();

            // Get total count
            const total = await postsCollection.countDocuments(query);

            reply.send({
                success: true,
                data: posts,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total
                }
            });
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    });

    fastify.get('/posts/:id', async (request, reply) => {

        try {
            const { id } = request.params;

            const db = fastify.mongo.db;
            const postsCollection = db.collection('posts');
            const post = await postsCollection.findOne({
                id,
                is_archived: false
            });


            if (!post) {
                return reply.code(404).send({
                    success: false,
                    message: 'Post not found'
                });
            }

            const { user_id, post_type, limit = 20, offset = 0 } = request.query;

            // const db = fastify.mongo.db;
            // const postsCollection = db.collection('posts');

            // const query = { is_archived: false };
            // if (user_id) query.user_id = user_id;
            // if (post_type) query.post_type = post_type;

            // const posts = await postsCollection
            //     .find(query)
            //     .sort({ created_at: -1 })
            //     .skip(parseInt(offset))
            //     .limit(parseInt(limit))
            //     .toArray();

            // const total = await postsCollection.countDocuments(query);

            reply.send({
                success: true,
                data: post,
                // pagination: {
                //     limit: parseInt(limit),
                //     offset: parseInt(offset),
                //     total
                // }
            });
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }

    })

}