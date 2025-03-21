import { FC } from "react";
import { PropertyAttribute } from "../../types/modelProperties";

const ModelPropertyAttributeItem: FC<{ attribute: PropertyAttribute }> = ({ attribute }) => {
  if (!attribute.value) {
    return null
  };
  
  const Icon = attribute.icon;
  
  return (
    <div className="flex items-center text-sm text-gray-600 mt-1">
      <Icon className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
      <span className="font-medium mr-1">{attribute.name}:</span>
      <span className="font-mono">{attribute.value}</span>
    </div>
  );
};

export default ModelPropertyAttributeItem;