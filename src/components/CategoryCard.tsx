// src/components/CategoryCard.tsx
interface CategoryData {
  name: string;
  allocated: number;
  actual: number;
  percentage: string;
  color: string;
}

interface CategoryCardProps {
  category: CategoryData;
  darkMode: boolean;
}

const CategoryCard = ({ category, darkMode }: CategoryCardProps) => {
  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex items-center mb-4">
        <div
          className="w-4 h-4 rounded-full mr-3"
          style={{ backgroundColor: category.color }}
        ></div>
        <h3 className="text-lg font-semibold">{category.name}</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Allocated:
          </span>
          <span className="font-medium">
            ${category.allocated.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Spent:
          </span>
          <span className="font-medium">
            ${category.actual.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            % of Income:
          </span>
          <span className="font-medium">{category.percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
