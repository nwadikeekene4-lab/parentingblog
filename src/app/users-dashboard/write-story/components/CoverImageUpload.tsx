"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { uploadImage } from "@/lib/uploadImage";
import { useStoryForm } from "./StoryFormContext";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function CoverImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    coverImage,
    setCoverImage,
    updateCoverUpload,
  } = useStoryForm();

  async function handleSelectImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Image must be smaller than 10MB.");
      return;
    }

    if (coverImage?.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverImage.preview);
    }

    const preview = URL.createObjectURL(file);
    const id = crypto.randomUUID();

    setCoverImage({
      id,
      file,
      preview,
      uploading: true,
    });

    setUploading(true);

    try {
      const uploaded = await uploadImage(
        file,
        "parenting-blog/cover-images"
      );

      updateCoverUpload(
        uploaded.url,
        uploaded.publicId
      );
    } catch (error) {
      console.error(
        "Cover image upload error:",
        error
      );

      /*
      |--------------------------------------------------------------------------
      | The context setter accepts an image value,
      | not a functional state updater.
      |--------------------------------------------------------------------------
      */

      const currentImage = coverImage;

      if (
        currentImage &&
        currentImage.id === id
      ) {
        setCoverImage({
          ...currentImage,
          uploading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to upload cover image.",
        });
      }
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    if (
      coverImage?.preview?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(coverImage.preview);
    }

    setCoverImage(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  useEffect(() => {
    return () => {
      if (
        coverImage?.preview?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          coverImage.preview
        );
      }
    };
  }, [coverImage]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          Cover Image
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Upload a beautiful image that represents your story.
        </p>
      </div>

      <div className="space-y-5">
        {!coverImage ? (
          <button
            type="button"
            onClick={() =>
              inputRef.current?.click()
            }
            className="flex h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-500 hover:bg-blue-50"
          >
            <span className="text-5xl">
              📷
            </span>

            <p className="mt-4 font-semibold text-gray-700">
              Click to upload cover image
            </p>

            <p className="mt-2 text-sm text-gray-500">
              JPG, PNG or WEBP (Max 10MB)
            </p>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="relative h-72 overflow-hidden rounded-2xl">
              <Image
                src={coverImage.preview}
                alt="Cover Preview"
                fill
                unoptimized
                className="object-cover"
              />

              {(uploading ||
                coverImage.uploading) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                  <div className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-lg">
                    Compressing and uploading...
                  </div>
                </div>
              )}
            </div>

            {coverImage.error && (
              <p
                className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
                role="alert"
              >
                {coverImage.error}
              </p>
            )}

            <button
              type="button"
              onClick={removeImage}
              disabled={uploading}
              className="rounded-xl border border-red-500 px-5 py-2 font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove Image
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleSelectImage}
          className="hidden"
        />
      </div>
    </section>
  );
        }
