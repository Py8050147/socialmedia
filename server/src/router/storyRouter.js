import { storySchema } from "../schema/storySchema";
import fastifyMultipart from "@fastify/multipart";
import { uploadOnCloudinary } from "../utils/cloudinary";

// ✅ Define limits by media type
const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024,   // 5MB for images
    video: 10 * 1024 * 1024,  // 10MB for videos
};

export async function storyRoutes(fastify, opts) {
    fastify.register(fastifyMultipart, {
        limits: {
            fileSize: 10 * 1024 * 1024, // ✅ Hard cap at 10MB (covers both types)
            files: 10,
        },
    });

    fastify.post(
        "/stories",
        {
            schema: {
                response: {
                    201: storySchema,
                },
            },
        },
        async (request, reply) => {
            if (!request.isMultipart()) {
                return reply.code(400).send({
                    success: false,
                    message: "Request must be multipart/form-data",
                });
            }

            const fields = {};
            const files = [];

            try {
                for await (const part of request.parts()) {
                    if (part.type === "field") {
                        fields[part.fieldname] = part.value;
                    } else {
                        const buffer = await part.toBuffer();

                        // ✅ Determine file type
                        const isVideo = part.mimetype.startsWith("video");
                        const isImage = part.mimetype.startsWith("image");

                        // ✅ Reject unsupported file types
                        if (!isVideo && !isImage) {
                            return reply.code(400).send({
                                success: false,
                                message: `Unsupported file type: ${part.mimetype}. Only images and videos are allowed.`,
                            });
                        }

                        // ✅ Apply size limit based on file type
                        const limitKey = isVideo ? "video" : "image";
                        const sizeLimit = FILE_SIZE_LIMITS[limitKey];
                        const limitInMB = sizeLimit / (1024 * 1024);

                        if (buffer.length > sizeLimit) {
                            return reply.code(400).send({
                                success: false,
                                message: `${isVideo ? "Video" : "Image"} file "${part.filename}" exceeds the ${limitInMB}MB limit. Uploaded size: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB`,
                            });
                        }

                        files.push({
                            fieldname: part.fieldname,
                            filename: part.filename,
                            mimetype: part.mimetype,
                            buffer,
                            sizeInMB: (buffer.length / (1024 * 1024)).toFixed(2),
                        });
                    }
                }
            } catch (err) {
                // ✅ Catch @fastify/multipart's own size limit error
                if (err.code === "FST_FILES_LIMIT" || err.message?.includes("File size limit")) {
                    return reply.code(400).send({
                        success: false,
                        message: "File size exceeds the maximum allowed limit of 10MB.",
                    });
                }
                throw err;
            }

            const {
                user_id,
                post_type,
                caption,
                location,
                text,
                aspect_ratio,
                content,
                expires_at,
                is_highlighted,
            } = fields;

            if (!user_id || !post_type) {
                return reply.code(400).send({
                    success: false,
                    message: "user_id and post_type are required",
                    received: { user_id, post_type },
                });
            }

            const validPostTypes = ["text", "image", "video", "carousel", "reel"];
            if (!validPostTypes.includes(post_type)) {
                return reply.code(400).send({
                    success: false,
                    message: "Invalid post_type. Must be one of: " + validPostTypes.join(", "),
                });
            }

            // ✅ Upload validated files to Cloudinary
            const uploadedMedia = await Promise.all(
                files.map(async (file) => {
                    const result = await uploadOnCloudinary(file.buffer, {
                        resource_type: file.mimetype.startsWith("video") ? "video" : "image",
                        folder: "stories",
                    });
                    return {
                        url: result.secure_url,
                        mimetype: file.mimetype,
                        sizeInMB: file.sizeInMB,
                    };
                })
            );

            const media_url =
                uploadedMedia.length === 1
                    ? uploadedMedia[0].url
                    : uploadedMedia.map((m) => m.url);

            const media_type =
                post_type === "reel" || files[0]?.mimetype.startsWith("video")
                    ? "video"
                    : post_type === "carousel"
                        ? "carousel"
                        : "image";

            const db = fastify.mongo.db;
            const storiesCollection = db.collection("stories");

            const story = {
                id: new fastify.mongo.ObjectId().toString(),
                user_id,
                post_type,
                media_type,
                media_url,
                content: content || text || null,
                caption: caption || null,
                location: location || null,
                aspect_ratio: aspect_ratio || null,
                expires_at: expires_at || null,
                is_highlighted: is_highlighted === "true",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await storiesCollection.insertOne(story);
            return reply.status(201).send(story);
        }
    );
}