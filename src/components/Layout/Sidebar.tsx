import { Cog6ToothIcon, } from "@heroicons/react/20/solid"
import { classNames } from "../../helpers"
import { FC } from "react"
import { PlusIcon, PuzzlePieceIcon, Squares2X2Icon, } from "@heroicons/react/24/outline"
import * as ts from 'typescript'
import { writeAppState } from "../../helpers/appState"


const navigation = [
  { name: 'Models', href: '/Models', icon: PuzzlePieceIcon, hasCreateButton: true },
  { name: 'Items', href: '/Items', icon: Squares2X2Icon, hasCreateButton: false },
]

const schemas = [
  { id: 1, name: '/app-files/schema.ts', href: '#', initial: 'A', current: false },
]

function parseTypeScriptFile(fileContent: string) {
  const sourceFile = ts.createSourceFile('temp.ts', fileContent, ts.ScriptTarget.Latest, true);

  // Traverse the AST to find models and properties
  function visit(node: ts.Node) {
      if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
          console.log('Model:', node.name.text);
          node.members.forEach((member) => {
              if (ts.isPropertySignature(member) && member.name) {
                  console.log('Property:', (member.name as ts.Identifier).text);
              }
          });
      }
      ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        // Parse the TypeScript file content into models
        console.log('File content:', content);
        parseTypeScriptFile(content)
      }
    };
    reader.readAsText(file);
  }
};

const handleCreateButtonClick = async (name: string) => {
  if (name === 'Models') {
    await writeAppState('isDialogCreateOpen', true)
  }
};

const Sidebar: FC = () => {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
      <div className="flex h-16 shrink-0 items-center">
        <img
          alt="Seed Protocol"
          src={'/branches.svg'}
          className="h-8 w-auto"
        />
      </div>
      <nav className="flex flex-1 flex-col h-full">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 flex-1 space-y-1">
              {navigation.map((item) => (
                <li 
                  key={item.name}
                  className={'flex flex-row items-center w-full'}
                >
                  <a
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                      'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                    )}
                  >
                    <item.icon aria-hidden="true" className="size-6 shrink-0" />
                    <span className="sr-only">{item.name}</span>
                  </a>
                  {item.hasCreateButton && (
                    <button
                      className="ml-auto text-gray-500 hover:text-gray-700"
                      onClick={() => handleCreateButtonClick(item.name)}
                    >
                      <PlusIcon className="size-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </li>
          {/* <li>
            <div className="text-xs/6 font-semibold text-gray-400">Your schemas</div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {schemas.map((schema) => (
                <li key={schema.name}>
                  <a
                    href={schema.href}
                    className={classNames(
                      schema.current
                        ? 'bg-gray-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                      'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                    )}
                  >
                    <span
                      className={classNames(
                        schema.current
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600',
                        'flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium',
                      )}
                    >
                      {schema.initial}
                    </span>
                    <span className="truncate">{schema.name}</span>
                  </a>
                </li>
              ))}
              <li>
                <button
                  className="text-gray-700 hover:bg-gray-50 hover:text-indigo-600 group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  Upload
                </button>
                <input
                  type="file"
                  id="fileInput"
                  accept=".ts"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e)}
                />
              </li>
            </ul>
          </li> */}
          <li className="-mx-6 mt-auto">
            <a
              href="#"
              className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Cog6ToothIcon className="size-6" />
              <span className="sr-only">Settings</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar