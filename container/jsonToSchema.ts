#!/usr/bin/env node

import { PropertyConfig, SchemaConfig } from './types'
import * as nunjucks                         from 'nunjucks'
import {writeFileSync, readFileSync} from 'node:fs'
import {join, basename, dirname} from 'path'
import { ILoader } from 'nunjucks'


/**
 * Determines if a file is TypeScript or JSON based on extension
 * @param filePath Path to the file
 * @returns File type ('ts', 'json', or 'unknown')
 */
function detectFileType(filePath: string): 'ts' | 'json' | 'unknown' {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.ts' || ext === '.tsx') return 'ts';
  if (ext === '.json') return 'json';
  return 'unknown';
}

/**
 * Analyzes JSON schema to determine which import items are needed
 * @param jsonSchema The parsed JSON schema
 * @returns Array of needed import items
 */
function determineRequiredImports(jsonSchema: SchemaConfig): string[] {
  const requiredImports = new Set<string>();

  // Model is always required
  requiredImports.add('Model');

  // Check each model's properties for field types
  for (const model of Object.values(jsonSchema.models)) {
    for (const property of Object.values(model.properties)) {
      const propertyType = property.propertyType;
      requiredImports.add(propertyType);

      // Check for List fields with relations
      if (propertyType === 'List' && property.items && property.items.relation) {
        requiredImports.add('List');
      }
    }
  }

  return Array.from(requiredImports);
}

/**
 * Creates an array of model names from the schema
 * @param jsonSchema The parsed JSON schema
 * @returns Array of model names
 */
function extractModelNames(jsonSchema: SchemaConfig): string[] {
  return Object.keys(jsonSchema.models);
}

/**
 * JSON to TypeScript conversion
 */
function jsonToTypeScript(jsonContent: string, outputPath: string, templatePath?: string): void {
  try {
    const jsonSchema = JSON.parse(jsonContent) as SchemaConfig;
    const env = setupNunjucks();

    // Determine required imports
    const importItems = determineRequiredImports(jsonSchema);

    // Extract model names
    const modelNames = extractModelNames(jsonSchema);

    // Add importItems and modelNames to the context
    const context = {
      ...jsonSchema,
      importItems,
      modelNames
    };

    let template: string;
    if (templatePath) {
      template = fs.readFileSync(templatePath, 'utf8');
    } else {
      template = DEFAULT_SCHEMA_TEMPLATE;
    }

    const renderedSchema = env.renderString(template, context);
    fs.writeFileSync(outputPath, renderedSchema);
    console.log(`TypeScript schema generated at: ${outputPath}`);
  } catch (error) {
    console.error('Error converting JSON to TypeScript:', error);
    throw error;
  }
}


const propertyDecorator = (property: PropertyConfig, propertyName: string) => {
    const propertyType = property.propertyType;

  if (propertyType === 'Text') {
    if (property.storage && property.path && property.extension) {
      return `@Text('${property.storage}', '${property.path}', '${property.extension}') ${propertyName}!: string`;
    } else {
      return `@Text() ${propertyName}!: string`;
    }
  } else if (propertyType === 'Image') {
    return `@Image() ${propertyName}!: string`;
  } else if (propertyType === 'List') {
    const relationItem = property.items?.relation;
    if (relationItem) {
      return `@List('${relationItem}') ${propertyName}!: string[]`;
    }
  } else if (propertyType === 'Date') {
    return `@Date() ${propertyName}!: Date`;
  } else if (propertyType === 'Number') {
    return `@Number() ${propertyName}!: number`;
  } else if (propertyType === 'Boolean') {
    return `@Boolean() ${propertyName}!: boolean`;
  }

  return `// Unknown field type: ${propertyType}`;
}

/**
 * Generates TypeScript schema file from JSON Schema configuration using Nunjucks
 * @param jsonSchema The JSON Schema configuration
 * @param outputPath The path to write the output TypeScript file
 */
const generateSchemaFromJson = (jsonSchema: SchemaConfig, outputPath: string): void => {
  
  const templatePath = join(dirname(outputPath), 'jsonToSchemaTemplate.njk')

  const TemplateLoader: ILoader = {
    getSource: (name: string) => {
      let templateFilePath
      if (name.includes(templatePath)) {
        templateFilePath = name
      } else {
        templateFilePath = join(templatePath, basename(name))
      }
      const src = readFileSync(templateFilePath, 'utf-8')
  
      return {
        path: name,
        src,
        noCache: false,
      }
    },
  }
  
  const env = new nunjucks.Environment(TemplateLoader, {autoescape: false})
  
  // Custom filter to format field decorators
  env.addFilter('propertyDecorator', propertyDecorator);

  // Determine required imports
  const importItems = determineRequiredImports(jsonSchema);

  // Extract model names
  const modelNames = extractModelNames(jsonSchema);

  // Add importItems and modelNames to the context
  const context = {
    ...jsonSchema,
    importItems,
    modelNames
  };

  // Render the template with the schema data
  const renderedSchema = env.render(templatePath, context);

  // Write to file
  writeFileSync(outputPath, renderedSchema,);
  console.log(`Schema file generated at: ${outputPath}`);
}

/**
 * Helper function to convert the schema from JSON string
 */
export const convertJsonSchemaToTypeScript = (inputPath: string, outputPath: string): void => {

  if (!inputPath) {
    throw new Error('Input path is required')
  }

  try {
    const jsonSchemaString = readFileSync(inputPath, 'utf8');
    const jsonSchema = JSON.parse(jsonSchemaString) as SchemaConfig;
    generateSchemaFromJson(jsonSchema, outputPath);
  } catch (error) {
    console.error('Error converting schema:', error);
  }
}


const calledFrom = basename(process.argv[1])

if (calledFrom === 'jsonToSchema.ts') {
  try {
    const args = process.argv.slice(2);
    const workingDir = process.cwd();
    let inputPath = join(workingDir, 'schemaJson.json');
    let outputPath = join(workingDir, 'schema.ts');

    if (args.length === 2) {
      inputPath = args[0];
      outputPath = args[1];
    }

    if (args.length === 1) {
      inputPath = args[0];
    }

    console.log('inputPath', inputPath);
    console.log('outputPath', outputPath);

    convertJsonSchemaToTypeScript(inputPath, outputPath);
  } catch ( err ) {
    console.error(err)
  }
}
