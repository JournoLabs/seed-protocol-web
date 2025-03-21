import { describe, it, beforeEach, afterAll }              from 'vitest';
import { existsSync, copyFileSync, rmSync, readFileSync, } from 'node:fs';
import { join }                                            from 'node:path';
import { execSync }                                        from 'node:child_process';
import {convertJsonSchemaToTypeScript}                     from '../../container/jsonToSchema'
import { stringSimilarity } from 'string-similarity-js'


describe('container/jsonToSchema.ts', () => {
  const containerDir = join(process.cwd(), 'container');
  const sourceJsonFilePath = join(containerDir, 'schemaJson.json');
  const fixturesDir = join(process.cwd(), '__tests__', '__fixtures__');
  const fixtureJsonPath = join(fixturesDir, 'schemaJson.json');
  const jsonToSchemaFilePath = join(containerDir, 'jsonToSchema.ts');
  const schemaOutputFilePath = join(containerDir, 'schema.ts');
  const expectedOutputPath = join(fixturesDir, 'jsonToSchema.output.expected.ts');

  beforeEach(() => {
    if (existsSync(sourceJsonFilePath)) {
      rmSync(sourceJsonFilePath);
    }
    if (existsSync(fixtureJsonPath)) {
      copyFileSync(fixtureJsonPath, sourceJsonFilePath,);
    }
  });

  it('runs correctly from the command line with no arguments', ({expect}) => {
    execSync(`npx tsx ${jsonToSchemaFilePath}`, {stdio: 'inherit'});

    expect(existsSync(schemaOutputFilePath)).toBe(true);

    const output = readFileSync(schemaOutputFilePath, 'utf8');

    const expectedOutput = readFileSync(expectedOutputPath, 'utf8');

    const outputNoWhitespace = output.replace(/\s+/g, '');
    const expectedOutputNoWhitespace = expectedOutput.replace(/\s+/g, '');

    const similarity = stringSimilarity(outputNoWhitespace, expectedOutputNoWhitespace);

    expect(similarity).toBeGreaterThanOrEqual(0.98)
  });

  // Running from command line makes it difficult to use the debugger, so we isolate
  // certain function here to test them individually
  it('renders correct output with inputPath and outputPath arguments', async ({expect}) => {
    const inputPath = join(fixturesDir, 'schemaJson.json');
    const outputPath = join(containerDir, 'schema.ts');

    convertJsonSchemaToTypeScript(inputPath, outputPath);

    const output = readFileSync(schemaOutputFilePath, 'utf8');

    const expectedOutput = readFileSync(expectedOutputPath, 'utf8');

    expect(output).toEqual(expectedOutput);
  })

  afterAll(() => {
    if (existsSync(sourceJsonFilePath)) {
      rmSync(sourceJsonFilePath);
    }
    if (existsSync(schemaOutputFilePath)) {
      rmSync(schemaOutputFilePath);
    }
  })

});
