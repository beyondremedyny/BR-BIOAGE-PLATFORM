import { PutObjectCommand, S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const region = process.env.AWS_REGION ?? 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET ?? 'beyond-remedy-labs';

const client = new S3Client({
  region,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export async function getPresignedUploadUrl(
  patientId: string,
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string; s3Key: string; s3Url: string }> {
  const ext = fileName.split('.').pop() ?? 'bin';
  const s3Key = `labs/${patientId}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: s3Key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });
  const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

  return { uploadUrl, s3Key, s3Url };
}

export async function getSignedReadUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: s3Key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

export async function uploadBuffer(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
