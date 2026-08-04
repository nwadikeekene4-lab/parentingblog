"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import StoryEditor from "./components/StoryEditor";
import CategorySelector from "./components/CategorySelector";
import CoverImageUpload from "./components/CoverImageUpload";
import StoryImages from "./components/StoryImages";
import StoryActions from "./components/StoryActions";

import {
  StoryFormProvider,
  useStoryForm,
} from "./components/StoryFormContext";



function LoadDraft() {

  const searchParams =
    useSearchParams();

  const draftId =
    searchParams.get("draftId");


  const {
    setTitle,
    setContent,
    setCategory,
    setCoverImage,
    setStoryImages,
  } = useStoryForm();



  useEffect(() => {

    if (!draftId) {
      return;
    }


    async function fetchDraft() {

      try {

        const response =
          await fetch(
            `/api/drafts/${draftId}`
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ??
            "Failed to load draft."
          );

        }


        const draft =
          data.draft;



        setTitle(
          draft.title
        );


        setContent(
          draft.content
        );


        setCategory(
          draft.category?.name ?? ""
        );



        if (draft.coverImage) {

          setCoverImage({

            id:
              crypto.randomUUID(),

            file:
              new File(
                [],
                "existing-cover"
              ),

            preview:
              draft.coverImage,

            url:
              draft.coverImage,

            publicId:
              draft.coverImagePublicId,

            uploading:
              false,

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

              file:
                new File(
                  [],
                  "existing-image"
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
          "Load draft error:",
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




function WriteStoryContent() {

  return (

    <>

      <LoadDraft />


      <div className="space-y-8">


        {/* Page Header */}

        <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">

          <h1 className="text-3xl font-bold">
            Write a Story
          </h1>


          <p className="mt-3 max-w-2xl text-blue-100">
            Every parenting journey is unique. Share your
            experience to educate, inspire and support
            parents around the world.
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



        {/* Publish Actions */}

        <StoryActions />


      </div>

    </>

  );

}




export default function WriteStoryPage() {

  return (

    <StoryFormProvider>

      <WriteStoryContent />

    </StoryFormProvider>

  );

    }
