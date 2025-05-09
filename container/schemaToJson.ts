#!/usr/bin/env node

import * as ts                                       from 'typescript';
import { ModelConfig, PropertyConfig, SchemaConfig } from './types'
import { readFileSync, writeFileSync }               from 'node:fs'
import { basename, join }              from 'path'

/**
 * TypeScript to JSON conversion
 */
export const schemaToJson = (inputPath: string, outputPath: string): void => {

  const tsContentBuffer = readFileSync(inputPath)

  const decoder = new TextDecoder('utf-8')
  const tsContent = decoder.decode(tsContentBuffer)

  try {
    // Create a TypeScript source file
    const sourceFile = ts.createSourceFile(
      'schema.ts',
      tsContent,
      ts.ScriptTarget.Latest,
      true
    );

    // Initialize the result object
    const result: SchemaConfig = {
      title: 'Untitled Schema',
      description: '',
      models: {},
      endpoints: {
        filePaths: '',
        files: '',
      },
      arweaveDomain: ''
    };

    // Find all class declarations (models)
    const models: { [key: string]: ModelConfig } = {};
    const endpointsObj: Record<string, unknown> = {};
    let arweaveDomain: string | undefined = undefined;


    // Find the import statement to ensure we're looking at the right file
    let isValidSchemaFile = false;
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier) &&
          node.moduleSpecifier.text === '@seedprotocol/sdk') {
        isValidSchemaFile = true;
      }
    });

    if (!isValidSchemaFile) {
      console.warn('Warning: The TypeScript file does not import from @seedprotocol/sdk. Results may be incomplete.');
    }

    // Visit each node in the source file
    const visit = (node: ts.Node) => {
      // Find class declarations with @Model decorator
      if (ts.isClassDeclaration(node) && node.modifiers && node.modifiers.length > 0) {
        const modelDecorator = node.modifiers[0].getText()

        if (modelDecorator && modelDecorator === '@Model' && node.name) {
          const modelName = node.name.text;
          const modelSchema: ModelConfig = {
            type: 'object',
            properties: {},
            required: []
          };

          // Process properties in the class
          node.members.forEach(member => {
            if (ts.isPropertyDeclaration(member) && member.modifiers && member.modifiers.length > 0 && member.name) {
              const propName = member.name.getText(sourceFile);
              const decorator = member.modifiers[0]
              const decoratorText = decorator.getText();
              const decoratorArguments = decorator.expression.arguments;

              if (decoratorText) {
                let propertyType: string | undefined
                const match = decoratorText.match(/^@(\w+)\(/);

                if (match && match[1]) {
                  propertyType = match[1];
                }
                if (!propertyType) {
                  console.warn(`Warning: Property ${propName} in model ${modelName} does not have a valid decorator. Skipping...`);
                  return;
                }
                const jsonProperty: PropertyConfig = {
                  type: 'string', // Default type
                  propertyType
                };

                // Handle different field types
                switch (propertyType) {
                  case 'Text':
                    if (decoratorArguments.length >= 3) {
                      jsonProperty.storage = decoratorArguments[0].getText();
                      jsonProperty.path = decoratorArguments[1].getText();
                      jsonProperty.extension = decoratorArguments[2].getText();
                    }
                    break;
                  case 'Image':
                    // No additional properties needed
                    break;
                  case 'Relation':
                    if (decoratorArguments.length >= 1) {
                      jsonProperty.relation = decoratorArguments[0].getText();
                    }
                    break;
                  case 'List':
                    if (decoratorArguments.length >= 1) {
                      jsonProperty.items = {
                        type: 'string',
                        relation: decoratorArguments[0].getText()
                      };
                    }
                    break;
                  case 'Date':
                    jsonProperty.type = 'string'; // or 'date-time' format
                    break;
                  case 'Number':
                    jsonProperty.type = 'number';
                    break;
                  case 'Boolean':
                    jsonProperty.type = 'boolean';
                    break;
                }

                modelSchema.properties[propName] = jsonProperty;
                modelSchema.required?.push(propName);
              }
            }
          });

          models[modelName] = modelSchema;
        }
      }

      // Find endpoints object declaration
      if (ts.isVariableStatement(node)) {
        const declaration = node.declarationList.declarations[0];
        if (declaration && ts.isIdentifier(declaration.name)) {
          const varName = declaration.name.text;

          if (varName === 'endpoints' && declaration.initializer &&
              ts.isObjectLiteralExpression(declaration.initializer)) {
            declaration.initializer.properties.forEach(prop => {
              if (ts.isPropertyAssignment(prop) &&
                  ts.isIdentifier(prop.name) &&
                  ts.isStringLiteral(prop.initializer)) {
                const propName = prop.name.text;
                endpointsObj[propName] = prop.initializer.text;
              }
            });
          } else if (varName === 'arweaveDomain' && declaration.initializer &&
                    ts.isStringLiteral(declaration.initializer)) {
            arweaveDomain = declaration.initializer.text;
          }
        }
      }

      // Continue traversing the AST
      ts.forEachChild(node, visit);
    }

    // Start the traversal
    visit(sourceFile);

    // Assign the collected data to the result
    result.models = models;
    result.endpoints.filePaths = endpointsObj.filePaths as string;
    result.endpoints.files = endpointsObj.files as string;
    if (arweaveDomain) {
      result.arweaveDomain = arweaveDomain;
    }

    writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`JSON Schema saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error converting TypeScript to JSON:', error);
    throw error;
  }
}


const calledFrom = basename(process.argv[1])

if (calledFrom === 'schemaToJson.ts') {
  try {
    const args = process.argv.slice(2);
    const workingDir = process.cwd();
    let inputPath = join(workingDir, 'schema.ts');
    let outputPath = join(workingDir, 'schemaJson.json');

    if (args.length === 2) {
      inputPath = args[0];
      outputPath = args[1];
    }

    if (args.length === 1) {
      inputPath = args[0];
    }

    console.log('inputPath', inputPath);
    console.log('outputPath', outputPath);

    schemaToJson(inputPath, outputPath);
  } catch ( err ) {
    console.error(err)
  }
}
