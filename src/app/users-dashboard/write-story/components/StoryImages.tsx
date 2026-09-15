"use client";

import { ChangeEvent, useRef, useState } from "react";

import { useStoryForm } from "./StoryFormContext";
import { uploadImage } from "@/lib/uploadImage";

export default function StoryImages() {
  const { storyImages, setStoryImages } = useStoryForm();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingIds, setUploadingIds] = useState<string[]>([]);

  function createId() {
    return `story-image-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  }

  async function handleFiles(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    /*
    |--------------------------------------------------------------------------
    | Add selected images to the form immediately
    |--------------------------------------------------------------------------
    */

    const newImages = files.map((file) => ({
      id: createId(),
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setStoryImages([...storyImages, ...newImages]);

    setUploadingIds((current) => [
      ...current,
      ...newImages.map((image) => image.id),
    ]);

    /*
    |--------------------------------------------------------------------------
    | Upload images
    |--------------------------------------------------------------------------
    |
    | uploadImage() already compresses large images before sending
    | them to Cloudinary.
    |--------------------------------------------------------------------------
    */

    const uploadedResults = await Promise.all(
      newImages.map(async (image) => {
        try {
          const result = await uploadImage(
            image.file,
            "parenting-blog/story-images"
          );

          return {
            id: image.id,
            url: result.url,
            publicId: result.publicId,
            error: undefined as string | undefined,
          };
        } catch (error) {
          console.error(
            "Story image upload error:",
            error
          );

          return {
            id: image.id,
            url: "",
            publicId: "",
            error:
              error instanceof Error
                ? error.message
                : "Image upload failed.",
          };
        }
      })
    );

    /*
    |--------------------------------------------------------------------------
    | Apply upload results
    |--------------------------------------------------------------------------
    |
    | We use the current storyImages state captured before this
    | upload batch and add the completed results to it.
    |
    | No functional React setter is used because the context
    | intentionally exposes setStoryImages as a direct setter.
    |--------------------------------------------------------------------------
    */

    const resultMap = new Map(
      uploadedResults.map((result) => [
        result.id,
        result,
      ])
    );

    const updatedImages = [
      ...storyImages,
      ...newImages,
    ].map((image) => {
      const result = resultMap.get(image.id);

      if (!result) {
        return image;
      }

      return {
        ...image,
        url: result.url || undefined,
        publicId: result.publicId || undefined,
        preview: result.url || image.preview,
        uploading: false,
        error: result.error,
      };
    });

    setStoryImages(updatedImages);

    setUploadingIds((current) =>
      current.filter(
        (id) =>
          !newImages.some(
            (image) => image.id === id
          )
      )
    );

    /*
    |--------------------------------------------------------------------------
    | Reset file input so the same image can be selected again
    |--------------------------------------------------------------------------
    */

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeImage(id: string) {
    const image = storyImages.find(
      (item) => item.id === id
    );

    if (image?.preview.startsWith("blob:")) {
      URL.revokeObjectURL(image.preview);
    }

    setStoryImages(
      storyImages.filter((item) => item.id !== id)
    );

    setUploadingIds((current) =>
      current.filter((itemId) => itemId !== id)
    );
  }

  const hasImages = storyImages.length > 0;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">
          Story Images
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Add additional images to appear inside your
          published story.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
      >
        Add Story Images
      </button>

      {hasImages && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {storyImages.map((image) => {
            const isUploading =
              uploadingIds.includes(image.id) ||
              image.uploading;

            return (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
              >
                <img
                  src={image.preview}
                  alt=""
                  className="h-48 w-full object-cover"
                />

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="rounded-xl bg-white px-4 py-3 text-center shadow-lg">
                      <p className="text-sm font-semibold text-gray-900">
                        Uploading...
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Compressing and uploading image
                      </p>
                    </div>
                  </div>
                )}

                {image.error && !isUploading && (
                  <div className="absolute inset-x-0 bottom-0 bg-red-600/90 p-3 text-xs text-white">
                    {image.error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    removeImage(image.id)
                  }
                  disabled={isUploading}
                  className="absolute right-2 top-2 rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
