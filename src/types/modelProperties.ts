export type PropertyAttribute = {
  name: string;
  value: string | null;
  icon: React.FC<React.ComponentProps<'svg'>>;
};

export type PropertyType = 'Text' | 'Relation' | 'List' | 'Image' | 'Json' | 'Html' | 'Number' | 'Boolean' | 'Date';

export type PropertyDetails = {
  name: string;
  dataType: PropertyType;
  storageType?: string;
  localStorageDir?: string;
  path?: string;
  filenameSuffix?: string;
  ref?: string;
  refValueType?: string;
  required?: boolean;
};

export type ModelSchema = {
  name: string;
  properties: PropertyDetails[];
};