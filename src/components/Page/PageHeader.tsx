import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon, EyeIcon, DocumentDuplicateIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/20/solid';
import { FC } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useParams, Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
}

const PageHeader: FC<PageHeaderProps> = ({ title }) => {
  const { section, modelName } = useParams();

  return (
    <div>
      <div>
        {/* <nav aria-label="Back" className="sm:hidden">
          <Link to="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
            <ChevronLeftIcon aria-hidden="true" className="mr-1 -ml-1 size-5 shrink-0 text-gray-400" />
            Back
          </Link>
        </nav> */}
        {/* <nav aria-label="Breadcrumb" className="hidden sm:flex">
          <ol role="list" className="flex items-center space-x-4">
            <li>
              <div className="flex">
                <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </div>
            </li>
            {section && (
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                  <Link to={`/${section}`} className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                    {section}
                  </Link>
                </div>
              </li>
            )}
            {modelName && (
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                  <Link to={`/${section}/${modelName}`} aria-current="page" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                    {modelName}
                  </Link>
                </div>
              </li>
            )}
          </ol>
        </nav> */}
      </div>
      <div className="mt-2 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {title}
          </h2>
        </div>
        <div className="flex shrink-0 md:mt-0 md:ml-4">
          <Menu as="div" className="relative">
            <MenuButton className="inline-flex items-center rounded-md bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="sr-only">Open menu</span>
              <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
            </MenuButton>
            <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <EyeIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      View Details
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <DocumentDuplicateIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      Duplicate Model
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <ArrowPathIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      Regenerate Schema
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100 text-red-600' : 'text-red-600'
                      } group flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <TrashIcon className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" aria-hidden="true" />
                      Delete Model
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </div>
  )
};

export default PageHeader;
