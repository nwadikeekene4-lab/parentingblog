"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

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

  tags: string[];
  setTags: (tags: string[]) => void;

  resetForm: () => void;
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
  const [title, setTitle] = useState("");

  const [content, setContent] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [coverImage, setCoverImage] =
    useState<UploadedImage | null>(null);

  const [storyImages, setStoryImages] =
    useState<UploadedImage[]>([]);

  const [tags, setTags] =
    useState<string[]>([]);

  function resetForm() {
    setTitle("");
    setContent("");
    setCategory("");
    setCoverImage(null);
    setStoryImages([]);
    setTags([]);
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

        tags,
        setTags,

        resetForm,
      }}
    >
      {children}
    </StoryFormContext.Provider>
  );
}

export function useStoryForm() {
  const context =
    useContext(StoryFormContext);

  if (!context) {
    throw new Error(
      "useStoryForm must be used inside StoryFormProvider"
    );
  }

  return context;
}
