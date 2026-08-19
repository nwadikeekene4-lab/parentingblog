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
    useRef<HTMLInputElement | null>(null);

  const messageRef =
    useRef<HTMLDivElement | null>(null);

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

      const headerOffset = 90;

      const elementPosition =
        messageRef.current.getBoundingClientRect()
          .top + window.scrollY;

      window.scrollTo({
        top: Math.max(
          0,
          elementPosition -
            headerOffset
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
        const response = await fetch(
          "/api/profile",
          {
            cache: "no-store",
          }
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
          loadedProfile.bio ?? ""
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

              bio: bio.trim(),

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
      /*
      |--------------------------------------------------------------------------
      | Upload image independently
      |--------------------------------------------------------------------------
      */

      const uploaded =
        await uploadImage(
          file,
          "parenting-blog/profile-images"
        );

      /*
      |--------------------------------------------------------------------------
      | Update ONLY the profile image.
      | Do not send or modify display name,
      | bio, country, or state.
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

      /*
      |--------------------------------------------------------------------------
      | Update only the image locally.
      |--------------------------------------------------------------------------
      */

      setProfileImage(
        uploaded.url
      );

      setProfile((current) =>
        current
          ? {
              ...current,
              profileImage:
                uploaded.url,
            }
          : current
      );

      window.dispatchEvent(
        new Event("profileUpdated")
      );

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

      scrollToMessage();
    } finally {
      setUploadingImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
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

              bio: bio.trim(),

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
          updatedProfile.bio ?? ""
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

      window.dispatchEvent(
        new Event("profileUpdated")
      );

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
      <div className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-8">
        <section>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Update your personal information
            and public profile.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>

          <p className="text-sm font-medium text-gray-700">
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
    <div className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-8">
      {/* PAGE HEADER */}

      <section>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
          Update your personal information
          and public profile.
        </p>
      </section>

      {/* MESSAGES */}

      <div
        ref={messageRef}
        className="scroll-mt-24"
      >
        {message && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm font-semibold text-green-800"
          >
            <span className="mt-0.5">
              ✓
            </span>

            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-800"
          >
            <span className="mt-0.5">
              !
            </span>

            <span>
              {errorMessage}
            </span>
          </div>
        )}
      </div>

      {/* PROFILE SUMMARY CARD */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white px-5 py-5 sm:px-8">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">
            Profile Picture
          </h2>

          <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm">
            Choose a clear image that represents
            you in the community.
          </p>
        </div>

        <div className="px-5 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col items-center text-center">
            {/* PROFILE IMAGE */}

            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile picture"
                  className="h-28 w-28 rounded-full object-cover shadow-md ring-4 ring-blue-50 sm:h-32 sm:w-32"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-5xl shadow-sm ring-4 ring-blue-50 sm:h-32 sm:w-32">
                  👤
                </div>
              )}

              
            </div>

            {/* NAME */}

            <p className="mt-5 text-xl font-extrabold text-gray-950 sm:text-2xl">
              {displayName ||
                "Your Name"}
            </p>

            {/* EMAIL */}

            {profile?.email && (
              <p className="mt-1 break-all px-4 text-sm font-medium text-gray-600">
                {profile.email}
              </p>
            )}

            {/* FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={
                handleProfilePicture
              }
              className="hidden"
            />

            {/* BUTTON */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={
                uploadingImage ||
                saving
              }
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-600 bg-white px-5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingImage
                ? "Uploading..."
                : "Change Profile Picture"}
            </button>
          </div>
        </div>
      </section>

      {/* FORM CARD */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-5 sm:px-8">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">
            Personal Information
          </h2>

          <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm">
            Keep your profile information
            accurate and up to date.
          </p>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
          {/* DISPLAY NAME */}

          <div>
            <label
              htmlFor="displayName"
              className="mb-2 block text-sm font-bold text-gray-900"
            >
              Display Name
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <input
              id="displayName"
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
              autoComplete="name"
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-[15px] font-medium text-gray-950 shadow-sm outline-none placeholder:text-gray-500 transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              This is the name other community
              members will see.
            </p>
          </div>

          {/* BIO */}

          <div>
            <label
              htmlFor="bio"
              className="mb-2 block text-sm font-bold text-gray-900"
            >
              Bio
              <span className="ml-2 text-xs font-medium text-gray-500">
                Optional
              </span>
            </label>

            <textarea
              id="bio"
              rows={5}
              value={bio}
              onChange={(e) => {
                setBio(
                  e.target.value
                );

                handleFieldChange();
              }}
              placeholder="Tell the community about yourself..."
              className="min-h-32 w-full resize-y rounded-xl border border-gray-300 bg-white p-4 text-[15px] font-medium leading-6 text-gray-950 shadow-sm outline-none placeholder:text-gray-500 transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* COUNTRY + STATE */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="country"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                Country
                <span className="ml-2 text-xs font-medium text-gray-500">
                  Optional
                </span>
              </label>

              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => {
                  setCountry(
                    e.target.value
                  );

                  handleFieldChange();
                }}
                placeholder="Enter your country"
                autoComplete="country-name"
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-[15px] font-medium text-gray-950 shadow-sm outline-none placeholder:text-gray-500 transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="mb-2 block text-sm font-bold text-gray-900"
              >
                State / Province
                <span className="ml-2 text-xs font-medium text-gray-500">
                  Optional
                </span>
              </label>

              <input
                id="state"
                type="text"
                value={state}
                onChange={(e) => {
                  setState(
                    e.target.value
                  );

                  handleFieldChange();
                }}
                placeholder="Enter your state or province"
                autoComplete="address-level1"
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-[15px] font-medium text-gray-950 shadow-sm outline-none placeholder:text-gray-500 transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* SAVE AREA */}

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-gray-500">
              Changes are saved when you select
              <span className="font-semibold text-gray-700">
                {" "}
                Save Changes
              </span>
              .
            </p>

            <button
              type="button"
              onClick={saveChanges}
              disabled={
                saving ||
                uploadingImage ||
                !hasChanges
              }
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none sm:w-auto"
            >
              {saving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
                </div>
      </section>

      {/* PROFILE INFORMATION NOTE */}

      <section className="rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-5 sm:px-8">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700">
            i
          </div>

          <div>
            <h3 className="text-sm font-bold text-blue-950">
              About your profile
            </h3>

            <p className="mt-1 text-xs leading-5 text-blue-800 sm:text-sm">
              Your display name and profile picture
              may be visible to other members when
              you participate in the community.
              Your email address is kept private.
            </p>
          </div>
        </div>
      </section>

      {/* UNSAVED CHANGES INDICATOR */}

      {hasChanges && (
        <div className="sticky bottom-4 z-20">
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-lg">
                •
              </span>

              <div>
                <p className="text-sm font-bold text-amber-900">
                  You have unsaved changes
                </p>

                <p className="mt-0.5 text-xs text-amber-800">
                  Save your changes before leaving
                  this page.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={saveChanges}
              disabled={
                saving ||
                uploadingImage
              }
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-amber-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
                    </div>
        </div>
      

      {/* BOTTOM SPACING */}

      <div className="h-2 sm:h-4" />
    </div>
  );
          
