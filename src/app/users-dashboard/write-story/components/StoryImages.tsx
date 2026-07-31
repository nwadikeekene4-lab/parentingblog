"use client";

import Image from "next/image";
import { useState } from "react";

export default function StoryImages() {
  const [images, setImages] = useState<string[]>([]);

  function handleImages(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;

    if (!files) return;

    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );

    setImages((prev) => [...prev, ...newImages]);
  }

  function removeImage(index: number) {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

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

      {images.length === 0 ? (

        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No additional images selected.
        </div>

      ) : (

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {images.map((image, index) => (

            <div
              key={index}
              className="overflow-hidden rounded-xl border border-gray-200"
            >

              <div className="relative h-48">

                <Image
                  src={image}
                  alt={`Story image ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />

              </div>

              <button
                type="button"
                onClick={() => removeImage(index)}
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
