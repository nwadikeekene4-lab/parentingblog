"use client";

import { useState } from "react";

export default function StoryActions() {
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function saveDraft() {
    setSavingDraft(true);

    // Backend integration later
    await new Promise((resolve) =>
      setTimeout(resolve, 1500)
    );

    alert("Draft saved successfully!");

    setSavingDraft(false);
  }

  async function publishStory() {
    const confirmed = window.confirm(
      "Are you sure you want to publish this story?"
    );

    if (!confirmed) return;

    setPublishing(true);

    // Backend integration later
    await new Promise((resolve) =>
      setTimeout(resolve, 2000)
    );

    alert("Story published successfully!");

    setPublishing(false);
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="flex flex-col gap-4 md:flex-row md:justify-end">

        <button
          type="button"
          className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Preview Story
        </button>

        <button
          type="button"
          onClick={saveDraft}
          disabled={savingDraft}
          className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-white transition hover:bg-yellow-600 disabled:opacity-60"
        >
          {savingDraft ? "Saving..." : "Save Draft"}
        </button>

        <button
          type="button"
          onClick={publishStory}
          disabled={publishing}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {publishing ? "Publishing..." : "Publish Story"}
        </button>

      </div>

    </section>
  );
}
