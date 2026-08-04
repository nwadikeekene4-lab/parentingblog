import imageCompression from "browser-image-compression";

export type UploadFolder =
  | "parenting-blog/cover-images"
  | "parenting-blog/story-images"
  | "parenting-blog/profile-images"
  | "parenting-blog/organization-logos";


type UploadResponse = {
  success: boolean;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
};


async function compressImage(file: File) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  };

  try {
    return await imageCompression(
      file,
      options
    );

  } catch (error) {
    console.error(
      "Image compression failed:",
      error
    );

    return file;
  }
}


export async function uploadImage(
  file: File,
  folder: UploadFolder
): Promise<UploadResponse> {

  // Optimize image before sending to Cloudinary
  const optimizedFile =
    await compressImage(file);


  const formData =
    new FormData();


  formData.append(
    "file",
    optimizedFile
  );


  formData.append(
    "folder",
    folder
  );


  const response =
    await fetch(
      "/api/upload",
      {
        method: "POST",
        body: formData,
      }
    );


  const data =
    await response.json();


  if (!response.ok) {
    throw new Error(
      data.error ||
      "Failed to upload image."
    );
  }


  return data;
      }
