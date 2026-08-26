import "dotenv/config";
import { HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { s3, S3_BUCKET } from "../lib/s3.js";

async function main() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
    console.log(`Bucket "${S3_BUCKET}" already exists.`);
    return;
  } catch {
    // bucket doesn't exist yet, fall through and create it
  }

  await s3.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
  console.log(`Bucket "${S3_BUCKET}" created.`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
