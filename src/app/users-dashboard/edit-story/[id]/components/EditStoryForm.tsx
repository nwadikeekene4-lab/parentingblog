"use client";

import { useEffect, useRef, useState } from "react";
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

type InitialState = {
  title: string;
  content: string;
  category: string;
  coverImage: string | null;
  coverImagePublicId: string | null;
  storyImages: {
    id: string;
    url: string;
    publicId: string;
  }[];
};

export default function EditStoryForm({
  storyId,
}: {
  storyId: string;
}) {
  const [story, setStory] = useState<StoryData | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] =
    useState<EditImage | null>(null);
  const [storyImages, setStoryImages] =
    useState<EditImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initial = useRef<InitialState | null>(null);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        clearMessages();

        const res = await fetch(`/api/stories/${storyId}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message ?? "Failed to load story.");
        }

        const s = data.story as StoryData;
        if (cancelled) return;

        const images = (s.images ?? []).map((image) => ({
          id: image.id,
          url: image.imageUrl,
          publicId: image.publicId,
        }));

        initial.current = {
          title: s.title ?? "",
          content: s.content ?? "",
          category: s.category ?? "",
          coverImage: s.coverImage ?? null,
          coverImagePublicId: s.coverImagePublicId ?? null,
          storyImages: images,
        };

        setStory(s);
        setTitle(s.title ?? "");
        setContent(s.content ?? "");
        setCategory(s.category ?? "");

        setCoverImage(
          s.coverImage
            ? {
                id: `cover-${s.id}`,
                file: null,
                preview: s.coverImage,
                url: s.coverImage,
                publicId: s.coverImagePublicId ?? undefined,
              }
            : null
        );

        setStoryImages(
          (s.images ?? []).map((image) => ({
            id: image.id,
            file: null,
            preview: image.imageUrl,
            url: image.imageUrl,
            publicId: image.publicId,
          }))
        );
      } catch (err) {
        console.error("Load story error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load story."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [storyId]);

  function handleCoverImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid cover image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Cover image must be smaller than 10MB.");
      e.target.value = "";
      return;
    }

    clearMessages();

    if (
      coverImage?.file &&
      coverImage.preview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(coverImage.preview);
    }

    setCoverImage({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    });

    e.target.value = "";
  }

  function removeCoverImage() {
    clearMessages();

    if (
      coverImage?.file &&
      coverImage.preview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(coverImage.preview);
    }

    setCoverImage(null);
  }

  function handleStoryImages(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;
    if (!files) return;

    clearMessages();

    const images: EditImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not a valid image.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} is larger than 10MB.`);
        continue;
      }

      images.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (images.length) {
      setStoryImages((current) => [...current, ...images]);
    }

    e.target.value = "";
  }

  function removeStoryImage(id: string) {
    clearMessages();

    setStoryImages((current) => {
      const image = current.find((item) => item.id === id);

      if (
        image?.file &&
        image.preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(image.preview);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function imagesChanged() {
    const old = initial.current;
    if (!old) return true;

    if (storyImages.some((image) => image.file)) return true;

    const current = storyImages.map((image) => ({
      id: image.id,
      url: image.url ?? "",
      publicId: image.publicId ?? "",
    }));

    if (current.length !== old.storyImages.length) return true;

    return current.some((image, i) => {
      const original = old.storyImages[i];

      return (
        !original ||
        image.id !== original.id ||
        image.url !== original.url ||
        image.publicId !== original.publicId
      );
    });
  }

  async function saveChanges() {
    if (saving) return;

    clearMessages();

    const t = title.trim();
    const c = content.trim();
    const cat = category.trim();
    const old = initial.current;

    if (!t) {
      setError("Please enter a story title.");
      return;
    }

    if (!c) {
      setError("Please write your story.");
      return;
    }

    if (!cat) {
      setError("Please select a category.");
      return;
    }

    if (!old) {
      setError(
        "The original story information is not ready. Please refresh the page."
      );
      return;
    }

    const titleChanged = t !== old.title;
    const contentChanged = c !== old.content;
    const categoryChanged = cat !== old.category;

    const coverChanged =
      (coverImage?.url ?? null) !== old.coverImage ||
      (coverImage?.publicId ?? null) !==
        old.coverImagePublicId;

    const storyImagesChanged = imagesChanged();

    if (
      !titleChanged &&
      !contentChanged &&
      !categoryChanged &&
      !coverChanged &&
      !storyImagesChanged
    ) {
      setSuccess("There are no changes to save.");
      return;
    }

    setSaving(true);

    try {
      let coverUrl: string | null | undefined;
      let coverPublicId: string | null | undefined;

      if (coverChanged) {
        if (coverImage?.file) {
          const uploaded = await uploadImage(
            coverImage.file,
            "parenting-blog/cover-images"
          );

          coverUrl = uploaded.url;
          coverPublicId = uploaded.publicId;
        } else {
          coverUrl = coverImage?.url ?? null;
          coverPublicId = coverImage?.publicId ?? null;
        }
      }

      let uploadedImages:
        | { url: string; publicId: string }[]
        | undefined;

      if (storyImagesChanged) {
        uploadedImages = await Promise.all(
          storyImages.map((image) =>
            image.file
              ? uploadImage(
                  image.file,
                  "parenting-blog/story-images"
                )
              : {
                  url: image.url ?? "",
                  publicId: image.publicId ?? "",
                }
          )
        );
      }

      const body: {
        title: string;
        content: string;
        category: string;
        coverImageUrl?: string | null;
        coverImagePublicId?: string | null;
        storyImages?: {
          url: string;
          publicId: string;
        }[];
      } = {
        title: t,
        content: c,
        category: cat,
      };

      if (coverChanged) {
        body.coverImageUrl = coverUrl ?? null;
        body.coverImagePublicId = coverPublicId ?? null;
      }

      if (storyImagesChanged) {
        body.storyImages = uploadedImages ?? [];
      }

      const res = await fetch(`/api/stories/${storyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ?? "Failed to save changes."
        );
      }

      if (data.story) {
        setStory(data.story);
      }

      const savedImages = storyImages.map((image, i) => ({
        id: image.id,
        url:
          image.url ??
          uploadedImages?.[i]?.url ??
          "",
        publicId:
          image.publicId ??
          uploadedImages?.[i]?.publicId ??
          "",
      }));

      initial.current = {
        title: t,
        content: c,
        category: cat,
        coverImage: coverChanged
          ? coverUrl ?? null
          : old.coverImage,
        coverImagePublicId: coverChanged
          ? coverPublicId ?? null
          : old.coverImagePublicId,
        storyImages: savedImages,
      };

      if (storyImagesChanged && uploadedImages) {
        setStoryImages((current) =>
          current.map((image, i) => {
            const uploaded = uploadedImages?.[i];

            if (!image.file || !uploaded) return image;

            if (image.preview.startsWith("blob:")) {
              URL.revokeObjectURL(image.preview);
            }

            return {
              ...image,
              file: null,
              preview: uploaded.url,
              url: uploaded.url,
              publicId: uploaded.publicId,
            };
          })
        );
      }

      if (coverChanged && coverImage?.file && coverUrl) {
        if (coverImage.preview.startsWith("blob:")) {
          URL.revokeObjectURL(coverImage.preview);
        }

        setCoverImage({
          ...coverImage,
          file: null,
          preview: coverUrl,
          url: coverUrl,
          publicId: coverPublicId ?? undefined,
        });
      }

      setSuccess(
        "Changes saved successfully. Your story remains pending review."
      );

      setTimeout(() => {
        window.location.href =
          "/users-dashboard/pending-review";
      }, 1000);
    } catch (err) {
      console.error("Save edited story error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-600">Loading story...</p>
      </section>
    );
  }

  if (error && !story) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-red-800">
          Unable to load story
        </h2>
        <p className="mt-2 text-red-700">{error}</p>
      </section>
    );
  }

  if (!story) {
    return (
      <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-600">Story not found.</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
        <h2 className="font-semibold text-yellow-900">
          Story is awaiting review
        </h2>
        <p className="mt-1 text-sm text-yellow-800">
          You can make changes to your story here.
          After saving, it will remain pending review.
        </p>
      </section>

      <EditStoryEditor
        title={title}
        content={content}
        onTitleChange={(value) => {
          setTitle(value);
          clearMessages();
        }}
        onContentChange={(value) => {
          setContent(value);
          clearMessages();
        }}
      />

      <EditCategorySelector
        category={category}
        onCategoryChange={(value) => {
          setCategory(value);
          clearMessages();
        }}
      />

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Cover Image
        </h2>

        <p className="mt-2 mb-5 text-sm text-gray-500">
          Replace the cover image if needed.
        </p>

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
              disabled={saving}
              className="rounded-xl border border-red-500 px-5 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Remove Image
            </button>
          </div>
        ) : (
          <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50">
            <span className="text-5xl">📷</span>
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
              disabled={saving}
              className="hidden"
            />
          </label>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Story Images
        </h2>

        <p className="mt-2 mb-5 text-sm text-gray-500">
          Add, remove or replace additional story images.
        </p>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleStoryImages}
          disabled={saving}
          className="mb-6 block w-full rounded-lg border border-gray-300 p-3"
        />

        {!storyImages.length ? (
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
                  disabled={saving}
                  className="w-full border-t border-gray-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

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

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveChanges}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </section>
    </div>
  );
  }
