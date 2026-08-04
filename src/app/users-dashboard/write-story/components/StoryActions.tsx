"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useStoryForm } from "./StoryFormContext";
import { uploadImage } from "@/lib/uploadImage";

export default function StoryActions() {
  const router = useRouter();

  const {
    title,
    content,
    category,
    coverImage,
    storyImages,
    updateCoverUpload,
    updateStoryImageUploads,
    resetForm,
  } = useStoryForm();


  const [savingDraft, setSavingDraft] =
    useState(false);

  const [publishing, setPublishing] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [statusMessage, setStatusMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [uploadCount, setUploadCount] =
    useState(0);


  async function submitStory(
    status: "draft" | "published"
  ) {

    if (savingDraft || publishing) {
      return;
    }


    setErrorMessage("");


    if (!title.trim()) {
      setErrorMessage(
        "Please enter a story title."
      );
      return;
    }


    if (!content.trim()) {
      setErrorMessage(
        "Please write your story."
      );
      return;
    }


    if (!category.trim()) {
      setErrorMessage(
        "Please select a category."
      );
      return;
    }


    if (
      status === "published" &&
      !coverImage
    ) {
      setErrorMessage(
        "Please upload a cover image before publishing."
      );
      return;
    }


    if (status === "draft") {

      setSavingDraft(true);

    } else {

      setPublishing(true);

      setProgress(5);

      setStatusMessage(
        "Preparing your story..."
      );

    }


    try {

      setProgress(15);

      setUploadCount(0);

      setStatusMessage(
        "Uploading cover and story images..."
      );
      const coverUploadPromise =
  coverImage?.url
    ? Promise.resolve({
        url: coverImage.url,
        publicId: coverImage.publicId,
      })
    : coverImage
    ? uploadImage(
        coverImage.file,
        "parenting-blog/cover-images"
      )
    : Promise.resolve(null);



const storyImagesUploadPromise =
  Promise.all(
    storyImages.map(
      async (image, index) => {

        if (image.url) {
          return {
            url: image.url,
            publicId: image.publicId,
          };
        }


        const uploaded =
          await uploadImage(
            image.file,
            "parenting-blog/story-images"
          );


        setUploadCount(
          index + 1
        );


        setProgress(
          20 +
          Math.round(
            ((index + 1) /
              storyImages.length) *
              40
          )
        );


        setStatusMessage(
          `Uploading story images (${index + 1}/${storyImages.length})...`
        );


        return uploaded;

      }
    )
  );



const [
  uploadedCover,
  uploadedStoryImages,
] = await Promise.all([
  coverUploadPromise,
  storyImagesUploadPromise,
]);
      if (
  uploadedCover &&
  uploadedCover.publicId
) {

  updateCoverUpload(
    uploadedCover.url,
    uploadedCover.publicId
  );

}


updateStoryImageUploads(
  uploadedStoryImages.filter(
    (image) =>
      image.publicId
  ) as {
    url: string;
    publicId: string;
  }[]
);


setProgress(70);

setStatusMessage(
  "Images uploaded successfully..."
);


setProgress(75);

setStatusMessage(
  "Saving your story..."
);


const response = await fetch(
  "/api/stories",
  {
    method: "POST",

    headers: {
      "Content-Type":
        "application/json",
    },

    body: JSON.stringify({

      title: title.trim(),

      content: content.trim(),

      category: category.trim(),

      status,

      coverImageUrl:
        uploadedCover?.url ?? null,

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
      "Failed to save story."
  );
      }
      if (status === "published") {

  setProgress(100);

  setStatusMessage(
    "Story submitted successfully!"
  );


  await new Promise((resolve) =>
    setTimeout(resolve, 700)
  );

}


resetForm();


if (status === "published") {

  router.replace(
    "/users-dashboard/pending-review?submitted=true"
  );

} else {

  router.replace(
    "/users-dashboard/drafts"
  );

}
