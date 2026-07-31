"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function CoverImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);

  function handleSelectImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);
  }

  function removeImage() {
    setPreview(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

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

        {!preview ? (

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-500 hover:bg-blue-50"
          >

            <span className="text-5xl">
              📷
            </span>

            <p className="mt-4 font-semibold text-gray-700">
              Click to upload cover image
            </p>

            <p className="mt-2 text-sm text-gray-500">
              JPG, PNG or WEBP
            </p>

          </button>

        ) : (

          <div className="space-y-4">

            <div className="relative h-72 overflow-hidden rounded-2xl">

              <Image
                src={preview}
                alt="Cover Preview"
                fill
                unoptimized
                className="object-cover"
              />

            </div>

            <button
              type="button"
              onClick={removeImage}
              className="rounded-xl border border-red-500 px-5 py-2 font-medium text-red-600 transition hover:bg-red-50"
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
