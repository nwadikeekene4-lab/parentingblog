"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  useParams,
  usePathname,
  useSearchParams,
} from "next/navigation";

export type UploadedImage = {
  id: string;
  file: File;
  preview: string;
  url?: string;
  publicId?: string;
  uploading: boolean;
  error?: string;
};

type SavedAdminProgress = {
  title: string;
  content: string;
  category: string;
  coverImage: {
    id: string;
    preview: string;
    url?: string;
    publicId?: string;
  } | null;
  storyImages: {
    id: string;
    preview: string;
    url?: string;
    publicId?: string;
  }[];
};

type StoryFormContextType = {
  title: string;
  setTitle: (value: string) => void;

  content: string;
  setContent: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;

  coverImage: UploadedImage | null;

  setCoverImage: (
    image: UploadedImage | null
  ) => void;

  storyImages: UploadedImage[];

  setStoryImages: (
    images: UploadedImage[]
  ) => void;

  updateCoverUpload: (
    url: string,
    publicId: string
  ) => void;

  updateStoryImageUploads: (
    images: {
      url: string;
      publicId: string;
    }[]
  ) => void;

  resetForm: () => void;

  isEditMode: boolean;
  isPublishedEdit: boolean;
  loadingStory: boolean;
};

const StoryFormContext =
  createContext<StoryFormContextType | null>(
    null
  );

const ADMIN_PROGRESS_KEY =
  "admin-write-story-progress";

export function StoryFormProvider({
  children,
}: {
  children: ReactNode;
}) {
  const searchParams =
    useSearchParams();

  const params = useParams();

  const pathname = usePathname();

  const isAdminWriteStory =
    pathname === "/admin/write-story";

  const routeStoryId =
    typeof params?.id === "string"
      ? params.id
      : undefined;

  const queryStoryId =
    searchParams.get("edit") ??
    searchParams.get("draftId") ??
    undefined;

  const editStoryId =
    routeStoryId ??
    queryStoryId;

  const mode =
    searchParams.get("mode");

  const isPublishedEdit =
    mode === "published";

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [coverImage, setCoverImage] =
    useState<UploadedImage | null>(
      null
    );

  const [storyImages, setStoryImages] =
    useState<UploadedImage[]>([]);

  const [loadingStory, setLoadingStory] =
    useState(
      Boolean(editStoryId)
    );

  /*
  |--------------------------------------------------------------------------
  | Restore Admin unfinished progress
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !isAdminWriteStory ||
      editStoryId ||
      isPublishedEdit
    ) {
      return;
    }

    try {
      const saved =
        window.localStorage.getItem(
          ADMIN_PROGRESS_KEY
        );

      if (!saved) {
        setLoadingStory(false);
        return;
      }

      const progress =
        JSON.parse(
          saved
        ) as SavedAdminProgress;

      setTitle(
        progress.title ?? ""
      );

      setContent(
        progress.content ?? ""
      );

      setCategory(
        progress.category ?? ""
      );

      if (
        progress.coverImage
      ) {
        setCoverImage({
          id:
            progress.coverImage.id,
          file: new File(
            [],
            "saved-admin-cover-image"
          ),
          preview:
            progress.coverImage.preview,
          url:
            progress.coverImage.url,
          publicId:
            progress.coverImage.publicId,
          uploading: false,
        });
      }

      if (
        Array.isArray(
          progress.storyImages
        )
      ) {
        setStoryImages(
          progress.storyImages.map(
            (image) => ({
              id: image.id,
              file: new File(
                [],
                "saved-admin-story-image"
              ),
              preview:
                image.preview,
              url:
                image.url,
              publicId:
                image.publicId,
              uploading: false,
            })
          )
        );
      }
    } catch (error) {
      console.error(
        "Restore admin story progress error:",
        error
      );

      window.localStorage.removeItem(
        ADMIN_PROGRESS_KEY
      );
    } finally {
      setLoadingStory(false);
    }
  }, [
    isAdminWriteStory,
    editStoryId,
    isPublishedEdit,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Automatically save Admin progress
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !isAdminWriteStory ||
      editStoryId ||
      isPublishedEdit ||
      loadingStory
    ) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        try {
          const progress:
            SavedAdminProgress = {
            title,
            content,
            category,

            coverImage:
              coverImage
                ? {
                    id:
                      coverImage.id,
                    preview:
                      coverImage.preview,
                    url:
                      coverImage.url,
                    publicId:
                      coverImage.publicId,
                  }
                : null,

            storyImages:
              storyImages.map(
                (image) => ({
                  id: image.id,
                  preview:
                    image.preview,
                  url:
                    image.url,
                  publicId:
                    image.publicId,
                })
              ),
          };

          /*
           * Don't create unnecessary storage
           * when the editor is completely empty.
           */
          const hasProgress =
            title.trim() ||
            content.trim() ||
            category.trim() ||
            coverImage ||
            storyImages.length > 0;

          if (hasProgress) {
            window.localStorage.setItem(
              ADMIN_PROGRESS_KEY,
              JSON.stringify(
                progress
              )
            );
          } else {
            window.localStorage.removeItem(
              ADMIN_PROGRESS_KEY
            );
          }
        } catch (error) {
          console.error(
            "Save admin story progress error:",
            error
          );
        }
      }, 500);

    return () =>
      window.clearTimeout(
        timeout
      );
  }, [
    isAdminWriteStory,
    editStoryId,
    isPublishedEdit,
    loadingStory,
    title,
    content,
    category,
    coverImage,
    storyImages,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Load existing draft, pending story, or published story
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!editStoryId) {
      if (!isAdminWriteStory) {
        setLoadingStory(false);
      }

      return;
    }

    const storyId =
      editStoryId;

    let cancelled = false;

    async function loadStory() {
      try {
        setLoadingStory(true);

        const endpoint =
          isPublishedEdit
            ? `/api/story-edits/${encodeURIComponent(
                storyId
              )}`
            : `/api/drafts/${encodeURIComponent(
                storyId
              )}`;

        const response =
          await fetch(
            endpoint,
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

        const story =
          data.story ??
          data.draft;

        if (!story) {
          throw new Error(
            "Story not found."
          );
        }

        if (cancelled) {
          return;
        }

        setTitle(
          story.title ?? ""
        );

        setContent(
          story.content ?? ""
        );

        setCategory(
          typeof story.category ===
            "string"
            ? story.category
            : story.category?.name ??
                ""
        );

        if (
          story.coverImage
        ) {
          setCoverImage({
            id:
              `existing-cover-${story.id ?? storyId}`,

            file: new File(
              [],
              "existing-cover-image"
            ),

            preview:
              story.coverImage,

            url:
              story.coverImage,

            publicId:
              story.coverImagePublicId ??
              undefined,

            uploading: false,
          });
        } else {
          setCoverImage(null);
        }

        const existingImages =
          Array.isArray(
            story.images
          )
            ? story.images
            : [];

        setStoryImages(
          existingImages.map(
            (image: {
              id?: string;
              imageUrl?: string;
              url?: string;
              publicId?: string | null;
              caption?: string | null;
            }) => ({
              id:
                image.id ??
                `img-${Math.random()}`,

              file: new File(
                [],
                "existing-story-image"
              ),

              preview:
                image.imageUrl ??
                image.url ??
                "",

              url:
                image.imageUrl ??
                image.url ??
                "",

              publicId:
                image.publicId ??
                undefined,

              uploading: false,
            })
          )
        );
      } catch (error) {
        console.error(
          "Load story for editing error:",
          error
        );

        if (!cancelled) {
          setTitle("");
          setContent("");
          setCategory("");
          setCoverImage(null);
          setStoryImages([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingStory(false);
        }
      }
    }

    loadStory();

    return () => {
      cancelled = true;
    };
  }, [
    editStoryId,
    isPublishedEdit,
    isAdminWriteStory,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Update cover upload
  |--------------------------------------------------------------------------
  */

  function updateCoverUpload(
    url: string,
    publicId: string
  ) {
    setCoverImage(
      (current) => {
        if (!current) {
          return {
            id:
              `new-cover-${Date.now()}`,
            file: new File(
              [],
              "cover-image"
            ),
            preview: url,
            url,
            publicId,
            uploading: false,
          };
        }

        return {
          ...current,
          url,
          publicId,
          preview: url,
          uploading: false,
          error: undefined,
        };
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Update story image uploads
  |--------------------------------------------------------------------------
  */

  function updateStoryImageUploads(
    images: {
      url: string;
      publicId: string;
    }[]
  ) {
    setStoryImages(
      (current) =>
        current.map(
          (image, index) => {
            const uploaded =
              images[index];

            if (!uploaded) {
              return image;
            }

            return {
              ...image,

              url:
                uploaded.url,

              publicId:
                uploaded.publicId,

              preview:
                uploaded.url,

              uploading: false,

              error: undefined,
            };
          }
        )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Reset form
  |--------------------------------------------------------------------------
  */

  function resetForm() {
    setTitle("");
    setContent("");
    setCategory("");
    setCoverImage(null);
    setStoryImages([]);
    setLoadingStory(false);

    if (
      isAdminWriteStory
    ) {
      try {
        window.localStorage.removeItem(
          ADMIN_PROGRESS_KEY
        );
      } catch (error) {
        console.error(
          "Clear admin story progress error:",
          error
        );
      }
    }
  }

  return (
    <StoryFormContext.Provider
      value={{
        title,
        setTitle,

        content,
        setContent,

        category,
        setCategory,

        coverImage,
        setCoverImage,

        storyImages,
        setStoryImages,

        updateCoverUpload,
        updateStoryImageUploads,

        resetForm,

        isEditMode:
          Boolean(editStoryId),

        isPublishedEdit,

        loadingStory,
      }}
    >
      {children}
    </StoryFormContext.Provider>
  );
}

export function useStoryForm() {
  const context =
    useContext(
      StoryFormContext
    );

  if (!context) {
    throw new Error(
      "useStoryForm must be used inside StoryFormProvider"
    );
  }

  return context;
}
