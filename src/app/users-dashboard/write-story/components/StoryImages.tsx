"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { uploadImage } from "@/lib/uploadImage";
import {
  UploadedImage,
  useStoryForm,
} from "./StoryFormContext";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function StoryImages() {
  const {
    storyImages,
    setStoryImages,
  } = useStoryForm();

  const [uploadingIds, setUploadingIds] =
    useState<string[]>([]);

  async function handleImages(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;

    if (!files) return;

    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not a valid image.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} is larger than 10MB.`);
        continue;
      }

      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        uploading: true,
      });
    }

    if (newImages.length === 0) {
      e.target.value = "";
      return;
    }

    setStoryImages([
      ...storyImages,
      ...newImages,
    ]);

    setUploadingIds((current) => [
      ...current,
      ...newImages.map((image) => image.id),
    ]);

    e.target.value = "";

    await Promise.all(
      newImages.map(async (image) => {
        try {
          const uploaded = await uploadImage(
            image.file,
            "parenting-blog/story-images"
          );

          setStoryImages((current) =>
            current.map((currentImage) =>
              currentImage.id === image.id
                ? {
                    ...currentImage,
                    url: uploaded.url,
                    publicId:
                      uploaded.publicId,
                    preview: uploaded.url,
                    uploading: false,
                    error: undefined,
                  }
                : currentImage
            )
          );
        } catch (error) {
          console.error(
            "Story image upload error:",
            error
          );

          setStoryImages((current) =>
            current.map((currentImage) =>
              currentImage.id === image.id
                ? {
                    ...currentImage,
                    uploading: false,
                    error:
                      error instanceof Error
                        ? error.message
                        : "Unable to upload image.",
                  }
                : currentImage
            )
          );
        } finally {
          setUploadingIds((current) =>
            current.filter(
              (id) => id !== image.id
            )
          );
        }
      })
    );
  }

  function removeImage(id: string) {
    const image = storyImages.find(
      (img) => img.id === id
    );

    if (
      image?.preview?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(image.preview);
    }

    setStoryImages(
      storyImages.filter(
        (img) => img.id !== id
      )
    );

    setUploadingIds((current) =>
      current.filter(
        (uploadingId) =>
          uploadingId !== id
      )
    );
  }

  useEffect(() => {
    return () => {
      storyImages.forEach((image) => {
        if (
          image.preview?.startsWith("blob:")
        ) {
          URL.revokeObjectURL(
            image.preview
          );
        }
      });
    };
  }, [storyImages]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          Story Images
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Add extra images to support your parenting story.
        </p>
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImages}
        className="mb-6 block w-full cursor-pointer rounded-lg border border-gray-300 p-3 transition hover:border-blue-400 hover:bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />

      {storyImages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No additional images selected.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {storyImages.map((image) => {
            const isUploading =
              uploadingIds.includes(image.id) ||
              image.uploading;

            return (
              <div
                key={image.id}
                className="overflow-hidden rounded-xl border border-gray-200 transition hover:shadow-md"
              >
                <div className="relative h-48">
                  <Image
                    src={image.preview}
                    alt="Story Image"
                    fill
                    unoptimized
                    className="object-cover"
                  />

                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                      <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg">
                        Uploading...
                      </div>
                    </div>
                  )}
                </div>

                {image.error && (
                  <p
                    className="p-3 text-xs text-red-600"
                    role="alert"
                  >
                    {image.error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    removeImage(image.id)
                  }
                  disabled={isUploading}
                  className="w-full cursor-pointer border-t border-gray-200 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 active:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
