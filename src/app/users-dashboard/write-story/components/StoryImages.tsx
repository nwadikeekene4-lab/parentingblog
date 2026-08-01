"use client";

import Image from "next/image";
import { useEffect } from "react";
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

  function handleImages(
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
        uploading: false,
      });
    }

    setStoryImages([
      ...storyImages,
      ...newImages,
    ]);

    e.target.value = "";
  }

  function removeImage(id: string) {
    const image = storyImages.find(
      (img) => img.id === id
    );

    if (image) {
      URL.revokeObjectURL(image.preview);
    }

    setStoryImages(
      storyImages.filter(
        (img) => img.id !== id
      )
    );
  }

  useEffect(() => {
    return () => {
      storyImages.forEach((image) =>
        URL.revokeObjectURL(image.preview)
      );
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
        className="mb-6 block w-full rounded-lg border border-gray-300 p-3"
      />

      {storyImages.length === 0 ? (

        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No additional images selected.
        </div>

      ) : (

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {storyImages.map((image) => (

            <div
              key={image.id}
              className="overflow-hidden rounded-xl border border-gray-200"
            >

              <div className="relative h-48">

                <Image
                  src={image.preview}
                  alt="Story Image"
                  fill
                  unoptimized
                  className="object-cover"
                />

              </div>

              <button
                type="button"
                onClick={() =>
                  removeImage(image.id)
                }
                className="w-full border-t border-gray-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Remove
              </button>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}
