"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type StoryFormContextType = {
  title: string;
  setTitle: (value: string) => void;

  content: string;
  setContent: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;

  coverImage: File | null;
  setCoverImage: (file: File | null) => void;

  storyImages: File[];
  setStoryImages: (files: File[]) => void;

  tags: string[];
  setTags: (tags: string[]) => void;
};

const StoryFormContext =
  createContext<StoryFormContextType | null>(null);

export function StoryFormProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [category, setCategory] =
    useState("");

  const [coverImage, setCoverImage] =
    useState<File | null>(null);

  const [storyImages, setStoryImages] =
    useState<File[]>([]);

  const [tags, setTags] =
    useState<string[]>([]);

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
