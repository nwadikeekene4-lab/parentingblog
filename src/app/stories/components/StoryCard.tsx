type StoryCardProps = {
  title: string;
  description: string;
};

export default function StoryCard({ title, description }: StoryCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <h3 className="text-xl font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-gray-600">
        {description}
      </p>

    </div>
  );
}
