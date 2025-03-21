import { describe, it, beforeEach, afterAll, } from 'vitest'
import { copyFileSync, existsSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'path'
import { execSync } from 'node:child_process';
import { schemaToJson } from '../../container/schemaToJson';
import stringSimilarity from 'string-similarity-js';


describe('container/schemaToJson.ts', () => {
  const containerDir = join(process.cwd(), 'container');
  const sourceSchemaFilePath = join(process.cwd(), 'schema.ts');
  const testsDir = join(process.cwd(), '__tests__');
  const fixturesDir = join(testsDir, '__fixtures__');
  const mocksDir = join(testsDir, '__mocks__');
  const sourceMockSchemaPath = join(mocksDir, 'schema.ts');
  const jsonOutputFilePath = join(containerDir, 'schemaJson.json');
  const expectedOutputPath = join(fixturesDir, 'schemaToJson.output.expected.json');
  const schemaToJsonFilePath = join(containerDir, 'schemaToJson.ts');

  beforeEach(() => {
    if (existsSync(sourceMockSchemaPath)) {
      copyFileSync(sourceMockSchemaPath, sourceSchemaFilePath,);
    }
  });


  it('should convert a schema to a json file without errors', ({expect}) => {
    execSync(`npx tsx ${schemaToJsonFilePath} ${sourceSchemaFilePath} ${jsonOutputFilePath}`, {stdio: 'inherit'});

    expect(existsSync(jsonOutputFilePath)).toBe(true);

    const output = readFileSync(jsonOutputFilePath, 'utf-8')

    const expectedOutput = readFileSync(expectedOutputPath, 'utf-8')

    const outputNoWhitespace = output.replace(/\s+/g, '');
    const expectedOutputNoWhitespace = expectedOutput.replace(/\s+/g, '');

    const similarity = stringSimilarity(outputNoWhitespace, expectedOutputNoWhitespace);

    expect(similarity).toBeGreaterThanOrEqual(0.98)
  })

  // Running from command line makes it difficult to use the debugger, so we isolate
  // certain function here to test them individually
  it('renders correct output with inputPath and outputPath arguments', async ({expect}) => {
    schemaToJson(sourceSchemaFilePath, jsonOutputFilePath);

    const output = readFileSync(jsonOutputFilePath, 'utf-8')

    const expectedOutput = readFileSync(expectedOutputPath, 'utf-8')

    const outputNoWhitespace = output.replace(/\s+/g, '');
    const expectedOutputNoWhitespace = expectedOutput.replace(/\s+/g, '');

    const similarity = stringSimilarity(outputNoWhitespace, expectedOutputNoWhitespace);

    expect(similarity).toBeGreaterThanOrEqual(0.98)
  })

  afterAll(() => {
    if (existsSync(jsonOutputFilePath)) {
      rmSync(jsonOutputFilePath);
    }
  })
  

  // it('should warn but not fail for files without @seedprotocol/sdk import', ({expect}) => {
  //   const invalidSchema = `
  //     @Model
  //     export class InvalidModel {
  //       @Text('arweave', 'content', '.md')
  //       content: string
  //     }
  //   `

  //   const consoleSpy = vi.spyOn(console, 'warn')
  //   schemaToJson(invalidSchema, testOutputPath)

  //   expect(consoleSpy).toHaveBeenCalledWith(
  //     expect.stringContaining('does not import from @seedprotocol/sdk')
  //   )
  // })

  // it('should handle empty models object', () => {
  //   const emptySchema = `
  //     import { Model } from '@seedprotocol/sdk'

  //     export const endpoints = {
  //       filePaths: 'https://example.com/files',
  //       files: 'https://example.com/content'
  //     }
  //   `

  //   schemaToJson(emptySchema, testOutputPath)

  //   const result = JSON.parse(readFileSync(testOutputPath, 'utf-8'))
  //   expect(result.models).toEqual({})
  // })

  // it('should throw error for invalid TypeScript content', () => {
  //   const invalidTs = `
  //     @Model invalid typescript content
  //     class {
  //   `

  //   expect(() => schemaToJson(invalidTs, testOutputPath)).toThrow()
  // })
}) 
