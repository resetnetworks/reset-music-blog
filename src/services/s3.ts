import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import path from "path";

function getS3Client() {
  const accessKeyId = (process.env.AWS_ACCESS_KEY_ID || "").trim().replace(/^["']|["']$/g, "");
  const secretAccessKey = (process.env.AWS_SECRET_ACCESS_KEY || "").trim().replace(/^["']|["']$/g, "");
  const region = (process.env.AWS_REGION || "ap-south-1").trim();

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function generateUploadUrl(fileType: string, prefix = "uploads") {
  const s3Client = getS3Client();
  const extension = fileType.split("/")[1] || "png";
  const key = `${prefix}/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: (process.env.AWS_S3_BUCKET_NAME || "").trim(),
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const fileUrl = `https://${(process.env.AWS_S3_BUCKET_NAME || "").trim()}.s3.${(process.env.AWS_REGION || "ap-south-1").trim()}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl, key };
}

export async function deleteS3Object(key: string) {
  const s3Client = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: (process.env.AWS_S3_BUCKET_NAME || "").trim(),
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

  const bucketName = (process.env.AWS_S3_BUCKET_NAME || "").trim();
  const region = (process.env.AWS_REGION || "ap-south-1").trim();

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

  const s3Client = getS3Client();
  await s3Client.send(command);
  const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  return { fileUrl, key };
}
