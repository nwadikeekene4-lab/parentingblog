// src/app/components/ui/Card.tsx

interface CardProps {
  title: string;
  text: string;
  action: string;
}

export default function Card({ title, text, action }: CardProps) {
  return (
    <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 mb-6 flex-grow">{text}</p>
      <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
        {action}
      </button>
    </div>
  );
}