"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Initialize S3 client
console.log({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
})
const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

interface UploadResult {
    key: string;
    url: string;
    success: boolean;
    error?: string;
}

export async function uploadImageToS3(
    base64String: string,
    folder?: string
): Promise<UploadResult> {
    try {
        // Validate base64 string
        if (!base64String || !base64String.includes(",")) {
            return {
                key: "",
                url: "",
                success: false,
                error: "Invalid base64 string format",
            };
        }

        // Extract the base64 data and mime type
        const [mimeTypePart, base64Data] = base64String.split(",");
        const mimeType = mimeTypePart.match(/:(.*?);/)?.[1] || "image/jpeg";

        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, "base64");

        // Generate unique filename
        const fileExtension = mimeType.split("/")[1] || "jpg";
        const fileName = `${uuidv4()}.${fileExtension}`;

        // Create S3 key (with optional folder)
        const key = folder ? `${folder}/${fileName}` : fileName;

        // Upload parameters
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
            ContentEncoding: "base64",
        };

        // Upload to S3
        const command = new PutObjectCommand(uploadParams);
        console.log({ command })
        await s3Client.send(command);

        // Construct the URL
        const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        return {
            key,
            url,
            success: true,
        };
    } catch (error) {
        console.error("Error uploading to S3:", error);
        return {
            key: "",
            url: "",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}

// Alternative version that accepts FormData (if you're using forms)
export async function uploadImageFromFormData(
    formData: FormData
): Promise<UploadResult> {
    const base64String = formData.get("image") as string;
    const folder = (formData.get("folder") as string) || undefined;

    return uploadImageToS3(base64String, folder);
}