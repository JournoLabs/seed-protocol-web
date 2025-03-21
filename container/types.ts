interface PropertyConfig {
  type: string;
  propertyType: string;
  storage?: string;
  path?: string;
  extension?: string;
  relation?: string;
  items?: {
    type: string;
    relation: string;
  };
}

interface ModelConfig {
  type: string;
  properties: {
    [key: string]: PropertyConfig;
  };
  required?: string[];
}

interface SchemaConfig {
  title: string;
  description: string;
  models: {
    [key: string]: ModelConfig;
  };
  endpoints: {
    filePaths: string;
    files: string;
  };
  arweaveDomain: string;
}

export {PropertyConfig, ModelConfig, SchemaConfig}

