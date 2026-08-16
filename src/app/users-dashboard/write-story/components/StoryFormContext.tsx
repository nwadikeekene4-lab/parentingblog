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
  loadingStory: boolean;
};


const StoryFormContext =
  createContext<StoryFormContextType | null>(
    null
  );


export function StoryFormProvider({
  children,
}: {
  children: ReactNode;
}) {

  const searchParams =
    useSearchParams();

  const params = useParams();

  /*
  |--------------------------------------------------------------------------
  | Get story ID
  |--------------------------------------------------------------------------
  |
  | Edit page:
  | /users-dashboard/edit-story/[id]
  |
  | The previous version only checked:
  | ?edit=...
  |
  | That meant the edit page did not load the existing story correctly.
  |
  */

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


  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [coverImage, setCoverImage] =
    useState<UploadedImage | null>(null);

  const [storyImages, setStoryImages] =
    useState<UploadedImage[]>([]);

  const [loadingStory, setLoadingStory] =
    useState(
      Boolean(editStoryId)
    );


  /*
  |--------------------------------------------------------------------------
  | Load existing story
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!editStoryId) {

      setLoadingStory(false);

      return;

    }


    let cancelled = false;


    async function loadStory() {

      try {

        setLoadingStory(true);


        const response =
          await fetch(
            `/api/drafts/${editStoryId}`,
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
          data.draft;


        if (!story) {

          throw new Error(
            "Story not found."
          );

        }


        if (cancelled) {
          return;
        }


        /*
        |--------------------------------------------------------------------------
        | Story details
        |--------------------------------------------------------------------------
        */

        setTitle(
          story.title ?? ""
        );

        setContent(
          story.content ?? ""
        );

        setCategory(
          story.category?.name ?? ""
        );


        /*
        |--------------------------------------------------------------------------
        | Existing cover image
        |--------------------------------------------------------------------------
        */

        if (story.coverImage) {

          setCoverImage({

            id:
              `existing-cover-${story.id}`,

            /*
            | This is only a placeholder File.
            | Because url exists, StoryActions will NOT
            | upload this image again.
            */

            file:
              new File(
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

            uploading:
              false,

          });

        } else {

          setCoverImage(null);

        }


        /*
        |--------------------------------------------------------------------------
        | Existing story images
        |--------------------------------------------------------------------------
        */

        const existingImages =
          Array.isArray(
            story.images
          )
            ? story.images
            : [];


        setStoryImages(

          existingImages.map(
            (
              image: {
                id: string;
                imageUrl: string;
                publicId?: string;
                caption?: string | null;
              }
            ) => ({

              id:
                image.id,

              file:
                new File(
                  [],
                  "existing-story-image"
                ),

              preview:
                image.imageUrl,

              url:
                image.imageUrl,

              publicId:
                image.publicId,

              uploading:
                false,

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

  }, [editStoryId]);


  /*
  |--------------------------------------------------------------------------
  | Update cover upload
  |--------------------------------------------------------------------------
  */

  function updateCoverUpload(
    url: string,
    publicId: string
  ) {

    setCoverImage((current) => {

      if (!current) {
        return current;
      }

      return {
        ...current,
        url,
        publicId,
        preview: url,
        uploading: false,
      };

    });

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

    setStoryImages((current) =>

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

            uploading:
              false,
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
