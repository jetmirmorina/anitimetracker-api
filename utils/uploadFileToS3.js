const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadFileToS3 = (file) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `profil-images/${file.name}`,
    Body: file.data,
    ContentType: file.mimetype,
    // ACL: "public-read", // Optional: Set permissions, e.g., public-read
  };

  return s3.upload(params).promise();
};

module.exports = uploadFileToS3;
