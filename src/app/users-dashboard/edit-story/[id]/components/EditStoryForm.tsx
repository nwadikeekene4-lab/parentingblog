"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import EditCategorySelector from "./EditCategorySelector";
import EditStoryEditor from "./EditStoryEditor";

import { uploadImage } from "@/lib/uploadImage";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type StoryImage = {
  id: string;
  imageUrl: string;
  publicId: string;
  caption?: string | null;
  displayOrder: number;
};

type StoryData = {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  category: string;
  coverImage: string | null;
  coverImagePublicId: string | null;
  images: StoryImage[];
};

type EditImage = {
  id: string;
  file: File | null;
  preview: string;
  url?: string;
  publicId?: string;
};

type EditStoryFormProps = {
  storyId: string;
};

export default function EditStoryForm({
  storyId,
}: EditStoryFormProps) {
  const [story, setStory] =
    useState<StoryData | null>(null);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [coverImage, setCoverImage] =
    useState<EditImage | null>(null);

  const [storyImages, setStoryImages] =
    useState<EditImage[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD STORY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function loadStory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/stories/${storyId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ??
              "Failed to load story."
          );
        }

        const loadedStory =
          data.story as StoryData;

        if (cancelled) return;

        setStory(loadedStory);

        setTitle(
          loadedStory.title ?? ""
        );

        setContent(
          loadedStory.content ?? ""
        );

        setCategory(
          loadedStory.category ?? ""
        );

        /*
        |--------------------------------------------------------------------------
        | Existing cover image
        |--------------------------------------------------------------------------
        */

        if (loadedStory.coverImage) {
          setCoverImage({
            id: `existing-cover-${loadedStory.id}`,
            file: null,
            preview:
              loadedStory.coverImage,
            url:
              loadedStory.coverImage,
            publicId:
              loadedStory.coverImagePublicId ??
              undefined,
          });
        } else {
          setCoverImage(null);
        }

        /*
        |--------------------------------------------------------------------------
        | Existing story images
        |--------------------------------------------------------------------------
        */

        setStoryImages(
          (loadedStory.images ?? []).map(
            (image) => ({
              id: image.id,
              file: null,
              preview: image.imageUrl,
              url: image.imageUrl,
              publicId: image.publicId,
            })
          )
        );
      } catch (error) {
        console.error(
          "Load story for editing error:",
          error
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load story."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStory();

    return () => {
      cancelled = true;
    };
  }, [storyId]);

  /*
  |--------------------------------------------------------------------------
  | COVER IMAGE
  |--------------------------------------------------------------------------
  */

  function handleCoverImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid cover image."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Cover image must be smaller than 10MB."
      );
      return;
    }

    setError("");

    if (
      coverImage?.file &&
      coverImage.preview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        coverImage.preview
      );
    }

    const preview =
      URL.createObjectURL(file);

    setCoverImage({
      id: crypto.randomUUID(),
      file,
      preview,
    });

    e.target.value = "";
  }

  function removeCoverImage() {
    if (
      coverImage?.file &&
      coverImage.preview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        coverImage.preview
      );
    }

    setCoverImage(null);
  }

  /*
  |--------------------------------------------------------------------------
  | STORY IMAGES
  |--------------------------------------------------------------------------
  */

  function handleStoryImages(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;

    if (!files) return;

    const newImages: EditImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError(
          `${file.name} is not a valid image.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `${file.name} is larger than 10MB.`
        );
        continue;
      }

      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview:
          URL.createObjectURL(file),
      });
    }

    setStoryImages((current) => [
      ...current,
      ...newImages,
    ]);

    e.target.value = "";
  }

  function removeStoryImage(
    id: string
  ) {
    setStoryImages((current) => {
      const image = current.find(
        (item) => item.id === id
      );

      if (
        image?.file &&
        image.preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          image.preview
        );
      }

      return current.filter(
        (item) => item.id !== id
      );
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE CHANGES
  |--------------------------------------------------------------------------
  */

  async function saveChanges() {
    if (saving) return;

    setError("");
    setSuccess("");

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!title.trim()) {
      setError(
        "Please enter a story title."
      );
      return;
    }

    if (!content.trim()) {
      setError(
        "Please write your story."
      );
      return;
    }

    if (!category.trim()) {
      setError(
        "Please select a category."
      );
      return;
    }

    setSaving(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | Upload changed cover image
      |--------------------------------------------------------------------------
      */

      let uploadedCover:
        | {
            url: string;
            publicId: string;
          }
        | null = null;

      if (coverImage?.file) {
        uploadedCover =
          await uploadImage(
            coverImage.file,
            "parenting-blog/cover-images"
          );
      } else if (coverImage?.url) {
        uploadedCover = {
          url: coverImage.url,
          publicId:
            coverImage.publicId ?? "",
        };
      }

      /*
      |--------------------------------------------------------------------------
      | Upload story images
      |--------------------------------------------------------------------------
      */

      const uploadedStoryImages =
        await Promise.all(
          storyImages.map(
            async (image) => {
              if (image.file) {
                return uploadImage(
                  image.file,
                  "parenting-blog/story-images"
                );
              }

              return {
                url: image.url ?? "",
                publicId:
                  image.publicId ?? "",
              };
            }
          )
        );

      /*
      |--------------------------------------------------------------------------
      | SAVE TO DATABASE
      |--------------------------------------------------------------------------
      */

      const response =
        await fetch(
          `/api/stories/${storyId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title: title.trim(),

              content:
                content.trim(),

              category:
                category.trim(),

              coverImageUrl:
                uploadedCover?.url ??
                null,

              coverImagePublicId:
                uploadedCover?.publicId ??
                null,

              storyImages:
                uploadedStoryImages.map(
                  (image) => ({
                    url: image.url,
                    publicId:
                      image.publicId,
                  })
                ),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Failed to save changes."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      setSuccess(
        "Changes saved successfully. Your story remains pending review."
      );

      setStory(
        data.story ?? story
      );

      /*
      |--------------------------------------------------------------------------
      | Navigate back to Pending Review
      |--------------------------------------------------------------------------
      */

      setTimeout(() => {
        window.location.href =
          "/users-dashboard/pending-review";
      }, 1000);
    } catch (error) {
      console.error(
        "Save edited story error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-600">
          Loading story...
        </p>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error && !story) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-red-800">
          Unable to load story
        </h2>

        <p className="mt-2 text-red-700">
          {error}
        </p>
      </section>
    );
  }

  if (!story) {
    return (
      <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-600">
          Story not found.
        </p>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | EDITOR
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-8">

      {/* Pending review notice */}

      <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
        <h2 className="font-semibold text-yellow-900">
          Story is awaiting review
        </h2>

        <p className="mt-1 text-sm text-yellow-800">
          You can make changes to your story here.
          After saving, it will remain pending review.
        </p>
      </section>

      {/* Story Details */}

      <EditStoryEditor
        title={title}
        content={content}
        onTitleChange={setTitle}
        onContentChange={setContent}
      />

      {/* Category */}

      <EditCategorySelector
        category={category}
        onCategoryChange={setCategory}
      />

      {/* Cover Image */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Cover Image
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Replace the cover image if you want to use a different one.
          </p>
        </div>

        {coverImage ? (
          <div className="space-y-4">
            <div className="relative h-72 overflow-hidden rounded-2xl">
              <Image
                src={coverImage.preview}
                alt="Cover Preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <button
              type="button"
              onClick={removeCoverImage}
              className="rounded-xl border border-red-500 px-5 py-2 font-medium text-red-600 transition hover:bg-red-50"
            >
              Remove Image
            </button>
          </div>
        ) : (
          <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-500 hover:bg-blue-50">
            <span className="text-5xl">
              📷
            </span>

            <p className="mt-4 font-semibold text-gray-700">
              Click to upload cover image
            </p>

            <p className="mt-2 text-sm text-gray-500">
              JPG, PNG or WEBP (Max 10MB)
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImage}
              className="hidden"
            />
          </label>
        )}
      </section>

      {/* Story Images */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Story Images
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Add, remove or replace additional images supporting your story.
          </p>
        </div>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleStoryImages}
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
                    removeStoryImage(image.id)
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

      {/* Messages */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Save Changes */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveChanges}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving Changes..."
              : "Save Changes"}
          </button>
        </div>
      </section>

    </div>
  );
  }
