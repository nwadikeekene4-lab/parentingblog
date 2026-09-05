"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import StoryEditor from "../../write-story/components/StoryEditor";
import CategorySelector from "../../write-story/components/CategorySelector";
import CoverImageUpload from "../../write-story/components/CoverImageUpload";
import StoryImages from "../../write-story/components/StoryImages";
import StoryActions from "../../write-story/components/StoryActions";

import {
  StoryFormProvider,
  useStoryForm,
} from "../../write-story/components/StoryFormContext";

function LoadDraft() {
  const params = useParams();

  const draftId = params.id as string;

  const {
    setTitle,
    setContent,
    setCategory,
    setCoverImage,
    setStoryImages,
  } = useStoryForm();

  useEffect(() => {
    async function fetchDraft() {
      try {
        let response = await fetch(
          `/api/drafts/${draftId}`
        );

        let data = await response.json();

        // If draft endpoint returns 404, try published-stories endpoint
        if (!response.ok && response.status === 404) {
          response = await fetch(
            `/api/published-stories/${draftId}`
          );

          data = await response.json();
        }

        if (!response.ok) {
          throw new Error(
            data.message ??
              "Failed to load story."
          );
        }

        const draft = data.draft;

        setTitle(draft.title);

        setContent(draft.content);

        setCategory(
          draft.category?.name ?? ""
        );

        if (draft.coverImage) {
          setCoverImage({
            id: crypto.randomUUID(),

            file: new File(
              [],
              "existing-cover"
            ),

            preview:
              draft.coverImage,

            url:
              draft.coverImage,

            publicId:
              draft.coverImagePublicId,

            uploading: false,
          });
        }

        setStoryImages(
          draft.images.map(
            (
              image: {
                imageUrl: string;
                publicId: string;
              }
            ) => ({
              id:
                crypto.randomUUID(),

              file: new File(
                [],
                "existing-image"
              ),

              preview:
                image.imageUrl,

              url:
                image.imageUrl,

              publicId:
                image.publicId,

              uploading: false,
            })
          )
        );
      } catch (error) {
        console.error(
          "Load draft/published story error:",
          error
        );
      }
    }

    fetchDraft();
  }, [
    draftId,
    setTitle,
    setContent,
    setCategory,
    setCoverImage,
    setStoryImages,
  ]);

  return null;
  }
function DraftEditorContent() {

  return (

    <>

      <LoadDraft />

      <div className="space-y-8">

        {/* Page Header */}

        <section className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white shadow-lg">

          <h1 className="text-3xl font-bold">
            Edit Draft
          </h1>

          <p className="mt-3 max-w-2xl text-amber-100">
            Continue editing your draft. Save your changes at any time
            or publish the story when you are ready.
          </p>

        </section>

        {/* Story Details */}

        <StoryEditor />

        {/* Category */}

        <CategorySelector />

        {/* Cover Image */}

        <CoverImageUpload />

        {/* Story Images */}

        <StoryImages />

        {/* Actions */}

        <StoryActions />

      </div>

    </>

  );

            }
export default function DraftEditorPage() {

  return (

    <StoryFormProvider>

      <DraftEditorContent />

    </StoryFormProvider>

  );

         }
