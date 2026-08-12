"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { uploadImage } from "@/lib/uploadImage";


type Profile = {
  id: string;
  displayName: string;
  email: string;
  profileImage: string | null;
  bio: string | null;
  country: string | null;
  state: string | null;
};


export default function ProfilePage() {

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const messageRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const [profile, setProfile] =
    useState<Profile | null>(null);


  const [displayName, setDisplayName] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [state, setState] =
    useState("");

  const [profileImage, setProfileImage] =
    useState<string | null>(null);


  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [hasChanges, setHasChanges] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | SCROLL TO MESSAGE
  |--------------------------------------------------------------------------
  */

  function scrollToMessage() {
  requestAnimationFrame(() => {
    if (!messageRef.current) {
      return;
    }

    const headerOffset = 80;

    const elementPosition =
      messageRef.current.getBoundingClientRect().top +
      window.scrollY;

    window.scrollTo({
      top: Math.max(
        0,
        elementPosition - headerOffset
      ),
      behavior: "smooth",
    });
  });
  }

  /*
  |--------------------------------------------------------------------------
  | MARK FORM AS CHANGED
  |--------------------------------------------------------------------------
  */

  function handleFieldChange() {

    setHasChanges(true);

    setMessage("");

    setErrorMessage("");

  }


  /*
  |--------------------------------------------------------------------------
  | LOAD PROFILE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function loadProfile() {

      try {

        const response =
          await fetch(
            "/api/profile"
          );


        const data =
          await response.json();


        if (!response.ok) {
          throw new Error(
            data.message ??
              "Failed to load profile."
          );
        }


        const loadedProfile =
          data.profile as Profile;


        setProfile(
          loadedProfile
        );

        setDisplayName(
          loadedProfile.displayName ??
            ""
        );

        setBio(
          loadedProfile.bio ??
            ""
        );

        setCountry(
          loadedProfile.country ??
            ""
        );

        setState(
          loadedProfile.state ??
            ""
        );

        setProfileImage(
          loadedProfile.profileImage
        );

        setHasChanges(false);


      } catch (error) {

        console.error(
          "Failed to load profile:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load profile."
        );

      } finally {

        setLoading(false);

      }

    }


    loadProfile();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | CHANGE PROFILE PICTURE
  |--------------------------------------------------------------------------
  */

  async function handleProfilePicture(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    setMessage("");

    setErrorMessage("");

    setUploadingImage(true);


    try {

      const uploaded =
        await uploadImage(
          file,
          "parenting-blog/profile-images"
        );


      setProfileImage(
        uploaded.url
      );


      /*
      |--------------------------------------------------------------------------
      | Save the new image immediately
      |--------------------------------------------------------------------------
      */

      const response =
        await fetch(
          "/api/profile",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              displayName:
                displayName.trim(),

              bio:
                bio.trim(),

              country:
                country.trim(),

              state:
                state.trim(),

              profileImage:
                uploaded.url,
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ??
            "Failed to save profile picture."
        );
      }


      if (data.profile) {

        setProfile(
          data.profile
        );

      }


      /*
      |--------------------------------------------------------------------------
      | Image was saved successfully.
      | There are no unsaved changes now.
      |--------------------------------------------------------------------------
      */

      setHasChanges(false);

      setMessage(
        "Profile picture updated successfully."
      );

      scrollToMessage();


    } catch (error) {

      console.error(
        "Profile picture upload error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to upload profile picture."
      );

    } finally {

      setUploadingImage(false);

      /*
      |--------------------------------------------------------------------------
      | Allow selecting the same file again
      |--------------------------------------------------------------------------
      */

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    }

  }


  /*
  |--------------------------------------------------------------------------
  | SAVE PROFILE
  |--------------------------------------------------------------------------
  */

  async function saveChanges() {

    if (
      saving ||
      !hasChanges
    ) {
      return;
    }


    setMessage("");

    setErrorMessage("");


    if (!displayName.trim()) {

      setErrorMessage(
        "Please enter your display name."
      );

      scrollToMessage();

      return;
    }


    setSaving(true);


    try {

      const response =
        await fetch(
          "/api/profile",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              displayName:
                displayName.trim(),

              bio:
                bio.trim(),

              country:
                country.trim(),

              state:
                state.trim(),

              profileImage:
                profileImage,

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


      if (data.profile) {

        const updatedProfile =
          data.profile as Profile;


        setProfile(
          updatedProfile
        );

        setDisplayName(
          updatedProfile.displayName ??
            ""
        );

        setBio(
          updatedProfile.bio ??
            ""
        );

        setCountry(
          updatedProfile.country ??
            ""
        );

        setState(
          updatedProfile.state ??
            ""
        );

        setProfileImage(
          updatedProfile.profileImage
        );

      }


      /*
      |--------------------------------------------------------------------------
      | SAVE SUCCESSFUL
      |--------------------------------------------------------------------------
      */

      setHasChanges(false);

      setMessage(
        "Profile updated successfully."
      );

      scrollToMessage();


    } catch (error) {

      console.error(
        "Save profile error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save changes."
      );

      scrollToMessage();

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
      <div className="space-y-8">

        <section>

          <h1 className="text-3xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Update your personal information and public profile.
          </p>

        </section>


        <section className="rounded-2xl bg-white p-8 text-center shadow-sm">

          <p className="text-sm text-gray-600">
            Loading your profile...
          </p>

        </section>

      </div>
    );

  }


  /*
  |--------------------------------------------------------------------------
  | PROFILE PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-8">

      {/* Header */}

      <section>

        <h1 className="text-3xl font-bold text-gray-900">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Update your personal information and public profile.
        </p>

      </section>


      {/* Messages */}

      <div ref={messageRef}>

        {message && (

          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>

        )}


        {errorMessage && (

          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>

        )}

      </div>


      {/* Profile Card */}

      <section className="rounded-2xl bg-white p-8 shadow-sm">

        <div className="flex flex-col items-center gap-4">

          {profileImage ? (

            <img
              src={profileImage}
              alt="Profile picture"
              className="h-28 w-28 rounded-full object-cover ring-4 ring-blue-50"
            />

          ) : (

            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-5xl">
              👤
            </div>

          )}


          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePicture}
            className="hidden"
          />


          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={
              uploadingImage ||
              saving
            }
            className="rounded-lg border border-blue-600 px-5 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploadingImage
              ? "Uploading..."
              : "Change Profile Picture"}
          </button>


          {profile?.email && (

            <p className="text-sm text-gray-500">
              {profile.email}
            </p>

          )}

        </div>

      </section>


      {/* Form */}

      <section className="rounded-2xl bg-white p-8 shadow-sm">

        <div className="space-y-6">

          {/* Display Name */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Display Name
            </label>

            <input
              type="text"
              value={displayName}
              onChange={(e) => {

                setDisplayName(
                  e.target.value
                );

                handleFieldChange();

              }}
              placeholder="Enter your display name"
              maxLength={100}
              className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

          </div>


          {/* Bio */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Bio
            </label>

            <textarea
              rows={5}
              value={bio}
              onChange={(e) => {

                setBio(
                  e.target.value
                );

                handleFieldChange();

              }}
              placeholder="Tell the community about yourself..."
              className="w-full rounded-xl border border-gray-300 p-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

          </div>


          {/* Country + State */}

          <div className="grid gap-6 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Country
              </label>

              <input
                type="text"
                value={country}
                onChange={(e) => {

                  setCountry(
                    e.target.value
                  );

                  handleFieldChange();

                }}
                placeholder="Country"
                className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                State / Province
              </label>

              <input
                type="text"
                value={state}
                onChange={(e) => {

                  setState(
                    e.target.value
                  );

                  handleFieldChange();

                }}
                placeholder="State or Province"
                className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>

          </div>


          {/* Save */}

          <div className="flex justify-end">

            <button
              type="button"
              onClick={saveChanges}
              disabled={
                saving ||
                uploadingImage ||
                !hasChanges
              }
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>

      </section>

    </div>
  );
          }
