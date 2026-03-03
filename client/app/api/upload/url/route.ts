import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
    try {
        const session = await auth();

        // 1. Verify Authentication
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { filename, contentType } = await req.json();

        if (!filename || !contentType) {
            return NextResponse.json(
                { error: "Filename and contentType are required" },
                { status: 400 }
            );
        }

        // 2. Validate File Type
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(contentType)) {
            return NextResponse.json(
                { error: "Invalid file type. Only PDF and DOCX are allowed." },
                { status: 400 }
            );
        }

        // 3. Generate secure S3 Key (Path)
        // Structure: user_id/timestamp_filename
        const timestamp = Date.now();
        const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "");
        const key = `resumes/${session.user.id}/${timestamp}_${safeFilename}`;

        // 4. Create S3 PutObject Command
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
            // Optional: Add metadata like the user ID
            Metadata: {
                userId: session.user.id,
            },
        });

        // 5. Generate Presigned URL (Valid for 60 seconds)
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });

        return NextResponse.json({ url, key });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return NextResponse.json(
            { error: "Failed to generate upload URL" },
            { status: 500 }
        );
    }
}
