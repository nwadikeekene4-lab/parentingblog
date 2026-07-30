type DashboardStatsCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red";
};

const colorClasses = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  yellow: "bg-yellow-100 text-yellow-600",
  red: "bg-red-100 text-red-600",
};

export default function DashboardStatsCard({
  title,
  value,
  icon,
  color = "blue",
}: DashboardStatsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </h3>

        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            colorClasses[color]
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
          }
