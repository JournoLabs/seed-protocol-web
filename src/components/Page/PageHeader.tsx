import {
  ChevronDownIcon,
} from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { FC } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions: { label: string; icon: React.ReactNode; href: string }[];
}


const PageHeader: FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="lg:flex lg:items-center lg:justify-between">
    <div className="min-w-0 flex-1">
      <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        {title}
      </h2>
      {/* <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <BriefcaseIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400" />
          Full-time
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <MapPinIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400" />
          Remote
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <CurrencyDollarIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400" />
          $120k &ndash; $140k
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <CalendarIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400" />
          Closing on January 9, 2020
        </div>
      </div> */}
    </div>
    <div className="mt-5 flex flex-wrap gap-2 lg:ml-4 lg:mt-0">
      {actions.map(({label, icon, href}) => (
        <span 
          key={label}
          className="hidden sm:block"
        >
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"

          >
            {icon}
            {label}
          </button>
        </span>
      ))}

      {/* Dropdown */}
      <Menu as="div" className="relative ml-3 sm:hidden">
        <MenuButton className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400">
          More
          <ChevronDownIcon aria-hidden="true" className="-mr-1 ml-1.5 size-5 text-gray-400" />
        </MenuButton>

        <MenuItems
          transition
          className="absolute right-0 z-10 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          {actions.map((action) => (
            <MenuItem key={action.label}>
              <a
                href={action.href}
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
              >
                {action.label}
              </a>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  </div>
  )
};

export default PageHeader;
