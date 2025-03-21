import { FC } from "react";
import { PropertyType } from "../../types/modelProperties";

const PropertyTypeBadge: FC<{ type: PropertyType }> = ({ type }) => {
  const getColorClass = () => {
    switch (type) {
      case 'Text':
        return 'bg-blue-100 text-blue-800';
      case 'Relation':
        return 'bg-purple-100 text-purple-800';
      case 'List':
        return 'bg-amber-100 text-amber-800';
      case 'Image':
        return 'bg-green-100 text-green-800';
      case 'Json':
        return 'bg-yellow-100 text-yellow-800';
      case 'Html':
        return 'bg-red-100 text-red-800';
      case 'Number':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getColorClass()}`}>
      {type}
    </span>
  );
};

export default PropertyTypeBadge;