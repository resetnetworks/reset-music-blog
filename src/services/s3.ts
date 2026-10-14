import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function generateUploadUrl(fileType: string, prefix = "uploads") {
  const extension = fileType.split("/")[1] || "png";
  const key = `${prefix}/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME || "",
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl, key };
}

export async function deleteS3Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME || "",
    Key: key,
  });
  await s3Client.send(command);
}

export async function uploadBufferToS3(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  prefix = "resumes"
): Promise<{ fileUrl: string; key: string }> {
  // 1. Sanitize file name & prevent path traversal
  const safeBase = path.basename(fileName).replace(/[^a-zA-Z0-9_\.-]/g, "_").replace(/\.+/g, ".");
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_\-]/g, "");
  const uniqueId = uuidv4();
  const cleanFileName = `${Date.now()}-${uniqueId}-${safeBase || "resume.pdf"}`;

  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || "ap-south-1";

  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured in environment variables.");
  }

  const key = `${cleanPrefix}/${cleanFileName}`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  return { fileUrl, key };
}
