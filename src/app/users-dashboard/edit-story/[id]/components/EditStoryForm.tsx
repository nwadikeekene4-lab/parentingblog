"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
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
  | ORIGINAL STORY STATE
  |--------------------------------------------------------------------------
  |
  | This is the baseline used to determine whether anything actually changed.
  |
  */

  const initialState =
    useRef<InitialState | null>(null);

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
        setSuccess("");

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

        if (cancelled) {
          return;
        }

        setStory(loadedStory);

        const loadedTitle =
          loadedStory.title ?? "";

        const loadedContent =
          loadedStory.content ?? "";

        const loadedCategory =
          loadedStory.category ?? "";

        const loadedCoverImage =
          loadedStory.coverImage ?? null;

        const loadedCoverImagePublicId =
          loadedStory.coverImagePublicId ??
          null;

        const loadedStoryImages =
          (loadedStory.images ?? []).map(
            (image) => ({
              id: image.id,
              url: image.imageUrl,
              publicId: image.publicId,
            })
          );

        /*
        |--------------------------------------------------------------------------
        | Store the original state.
        |--------------------------------------------------------------------------
        */

        initialState.current = {
          title: loadedTitle,
          content: loadedContent,
          category: loadedCategory,
          coverImage:
            loadedCoverImage,
          coverImagePublicId:
            loadedCoverImagePublicId,
          storyImages:
            loadedStoryImages,
        };

        setTitle(
          loadedTitle
        );

        setContent(
          loadedContent
        );

        setCategory(
          loadedCategory
        );

        /*
        |--------------------------------------------------------------------------
        | Existing cover image
        |
        | IMPORTANT:
        | Existing Cloudinary images have NO File object.
        | Therefore they will NEVER be uploaded again.
        |--------------------------------------------------------------------------
        */

        if (loadedCoverImage) {
          setCoverImage({
            id: `existing-cover-${loadedStory.id}`,
            file: null,
            preview:
              loadedCoverImage,
            url:
              loadedCoverImage,
            publicId:
              loadedCoverImagePublicId ??
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
              preview:
                image.imageUrl,
              url:
                image.imageUrl,
              publicId:
                image.publicId,
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
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid cover image."
      );

      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Cover image must be smaller than 10MB."
      );

      e.target.value = "";
      return;
    }

    setError("");
    setSuccess("");

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
    setError("");
    setSuccess("");

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
    const files =
      e.target.files;

    if (!files) {
      return;
    }

    setError("");
    setSuccess("");

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

    if (newImages.length > 0) {
      setStoryImages(
        (current) => [
          ...current,
          ...newImages,
        ]
      );
    }

    e.target.value = "";
  }

  function removeStoryImage(
    id: string
  ) {
    setError("");
    setSuccess("");

    setStoryImages((current) => {
      const image =
        current.find(
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
  | CHECK WHETHER STORY IMAGES CHANGED
  |--------------------------------------------------------------------------
  */

  function haveStoryImagesChanged() {
    const original =
      initialState.current;

    if (!original) {
      return true;
    }

    /*
    |--------------------------------------------------------------------------
    | Any new local file means images changed.
    |--------------------------------------------------------------------------
    */

    const hasNewFiles =
      storyImages.some(
        (image) =>
          image.file !== null
      );

    if (hasNewFiles) {
      return true;
    }

    /*
    |--------------------------------------------------------------------------
    | Compare current existing images with original images.
    |--------------------------------------------------------------------------
    */

    const currentImages =
      storyImages.map(
        (image) => ({
          id: image.id,
          url:
            image.url ?? "",
          publicId:
            image.publicId ?? "",
        })
      );

    if (
      currentImages.length !==
      original.storyImages.length
    ) {
      return true;
    }

    return currentImages.some(
      (current, index) => {
        const originalImage =
          original.storyImages[
            index
          ];

        if (!originalImage) {
          return true;
        }

        return (
          current.id !==
            originalImage.id ||
          current.url !==
            originalImage.url ||
          current.publicId !==
            originalImage.publicId
        );
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE CHANGES
  |--------------------------------------------------------------------------
  */

  async function saveChanges() {
    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    const cleanTitle =
      title.trim();

    const cleanContent =
      content.trim();

    const cleanCategory =
      category.trim();

    if (!cleanTitle) {
      setError(
        "Please enter a story title."
      );
      return;
    }

    if (!cleanContent) {
      setError(
        "Please write your story."
      );
      return;
    }

    if (!cleanCategory) {
      setError(
        "Please select a category."
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Make sure the original story was loaded.
    |--------------------------------------------------------------------------
    */

    if (!initialState.current) {
      setError(
        "The original story information is not ready. Please refresh the page and try again."
      );
      return;
    }

    const original =
      initialState.current;

    /*
    |--------------------------------------------------------------------------
    | Determine actual changes.
    |--------------------------------------------------------------------------
    */

    const titleChanged =
      cleanTitle !==
      original.title;

    const contentChanged =
      cleanContent !==
      original.content;

    const categoryChanged =
      cleanCategory !==
      original.category;

    const coverImageChanged =
      (coverImage?.url ?? null) !==
        original.coverImage ||
      (coverImage?.publicId ?? null) !==
        original.coverImagePublicId;

    const storyImagesChanged =
      haveStoryImagesChanged();

    /*
    |--------------------------------------------------------------------------
    | NOTHING CHANGED
    |--------------------------------------------------------------------------
    |
    | Do not even make a database request.
    |
    */

    if (
      !titleChanged &&
      !contentChanged &&
      !categoryChanged &&
      !coverImageChanged &&
      !storyImagesChanged
    ) {
      setSuccess(
        "There are no changes to save."
      );
      return;
    }

    setSaving(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | COVER IMAGE
      |--------------------------------------------------------------------------
      |
      | Only upload when the user selected a NEW file.
      |
      | Existing Cloudinary image:
      | - is reused
      | - is NOT uploaded
      |
      | Removed image:
      | - sends null
      |--------------------------------------------------------------------------
      */

      let coverImageUrl:
        | string
        | null
        | undefined;

      let coverImagePublicId:
        | string
        | null
        | undefined;

      if (coverImageChanged) {
        if (coverImage?.file) {
          const uploadedCover =
            await uploadImage(
              coverImage.file,
              "parenting-blog/cover-images"
            );

          coverImageUrl =
            uploadedCover.url;

          coverImagePublicId =
            uploadedCover.publicId;
        } else {
          coverImageUrl =
            coverImage?.url ??
            null;

          coverImagePublicId =
            coverImage?.publicId ??
            null;
        }
      }

      /*
      |--------------------------------------------------------------------------
      | STORY IMAGES
      |--------------------------------------------------------------------------
      |
      | Only process this section when the user actually changed
      | the story-image collection.
      |
      | Existing images are reused.
      | New files are uploaded.
      |--------------------------------------------------------------------------
      */

      let uploadedStoryImages:
        | {
            url: string;
            publicId: string;
          }[]
        | undefined;

      if (storyImagesChanged) {
        uploadedStoryImages =
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
                  url:
                    image.url ?? "",
                  publicId:
                    image.publicId ??
                    "",
                };
              }
            )
          );
      }

      /*
      |--------------------------------------------------------------------------
      | Build request.
      |--------------------------------------------------------------------------
      |
      | The text fields are always supplied because the current PUT
      | endpoint validates title/content/category.
      |
      | Images are supplied ONLY when their section changed.
      |--------------------------------------------------------------------------
      */

      const requestBody: {
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
        title:
          cleanTitle,

        content:
          cleanContent,

        category:
          cleanCategory,
      };

      if (coverImageChanged) {
        requestBody.coverImageUrl =
          coverImageUrl ?? null;

        requestBody.coverImagePublicId =
          coverImagePublicId ?? null;
      }

      if (
        storyImagesChanged
      ) {
        requestBody.storyImages =
          uploadedStoryImages ?? [];
      }

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

            body: JSON.stringify(
              requestBody
            ),
          }
        );

      let data: {
        message?: string;
        story?: StoryData;
      } = {};

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Your changes were not confirmed as saved."
        );
      }

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
      |
      | The API only returns success after its database save completes.
      |--------------------------------------------------------------------------
      */

      const savedStory =
        data.story;

      if (savedStory) {
        setStory(
          savedStory
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Reset the original baseline.
      |
      | This means another Save click will NOT repeat the same operation.
      |--------------------------------------------------------------------------
      */

      const savedCover =
        coverImageChanged
          ? coverImageUrl ??
            null
          : original.coverImage;

      const savedCoverPublicId =
        coverImageChanged
          ? coverImagePublicId ??
            null
          : original.coverImagePublicId;

      const savedImages =
        storyImages.map(
          (image, index) => ({
            id:
              image.id,
            url:
              image.url ??
              uploadedStoryImages?.[
                index
              ]?.url ??
              "",
            publicId:
              image.publicId ??
              uploadedStoryImages?.[
                index
              ]?.publicId ??
              "",
          })
        );

      initialState.current = {
        title:
          cleanTitle,

        content:
          cleanContent,

        category:
          cleanCategory,

        coverImage:
          savedCover,

        coverImagePublicId:
          savedCoverPublicId,

        storyImages:
          savedImages,
      };

      /*
      |--------------------------------------------------------------------------
      | Replace newly uploaded image URLs with their permanent URLs.
      |--------------------------------------------------------------------------
      */

      if (
        storyImagesChanged &&
        uploadedStoryImages
      ) {
        setStoryImages(
          (current) =>
            current.map(
              (image, index) => 
