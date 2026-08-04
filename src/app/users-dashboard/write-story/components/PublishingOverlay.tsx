"use client";

type PublishingOverlayProps = {
  open: boolean;
  progress: number;
  message: string;
};

export default function PublishingOverlay({
  open,
  progress,
  message,
}: PublishingOverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">

      <div className="w-[92%] max-w-lg rounded-3xl bg-white p-8 shadow-2xl">

        <div className="mx-auto flex h-16 w-16 items-center justify-center">

          <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

        </div>

        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Publishing Story
        </h2>

        <p className="mt-2 text-center text-gray-500">
          Please don't close this page while your story is being uploaded.
        </p>

        <div className="mt-8">

          <div className="h-3 overflow-hidden rounded-full bg-gray-200">

            <div
              className="h-full rounded-full rounded-r-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <div className="mt-3 flex justify-between text-sm">

            <span className="font-medium text-blue-700">
              {message}
            </span>

            <span className="font-semibold text-gray-700">
              {progress}%
            </span>

          </div>

        </div>

      </div>

    </div>
  );
          }
