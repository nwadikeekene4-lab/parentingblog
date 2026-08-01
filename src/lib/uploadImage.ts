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

export async function uploadImage(
  file: File,
  folder: UploadFolder
): Promise<UploadResponse> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to upload image."
    );
  }

  return data;
  }
