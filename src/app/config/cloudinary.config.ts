import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { envVars } from './env';
import AppError from '../errorHelpers/AppError';
import stream from 'stream';

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  filename: string
): Promise<UploadApiResponse | undefined> => {
  try {
    return new Promise((resolve, reject) => {
      const public_id = `pdf/${filename}-${Date.now()}`;
      const bufferStrem = new stream.PassThrough();
      bufferStrem.end(buffer);
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'auto',
            public_id: public_id,
            folder: 'pdf',
          },
          (error, result) => {
            if (error) {
              return reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });
  } catch (error: any) {
    console.log(error);
    throw new AppError(401, `Error uploading file ${error.message}`);
  }
};

export const deleteImageFromCloudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
    const match = url.match(regex);
    if (match && match[1]) {
      const public_id = match[1];
      await cloudinary.uploader.destroy(public_id);
    }
  } catch (error: any) {
    throw new AppError(401, 'Cloudinary image deletion failed', error.message);
  }
};

export const cloudinaryUpload = cloudinary;
