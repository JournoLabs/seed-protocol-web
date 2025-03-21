import { models } from '../../../schema'
import { classNames } from '../../helpers';
import debug from 'debug';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';

const logger = debug('seedWeb:components:SecondarySidebar')

const SecondarySidebar = () => {

  const { section, } = useParams();

  const navItems = Object.entries(models).map(([modelName,]) => {
    const ModelClass = models[modelName as keyof typeof models]

    return {
      name: modelName,
      href: `/models/${modelName}`,
      count: Object.keys(ModelClass.schema).length,
    }
  })


  return (
    <nav aria-label="Sidebar" className="flex flex-1 flex-col">
      <div className="flex items-center justify-between -mx-2">
        <h2 className="text-xs/6 font-semibold text-gray-400">{section}</h2>
        {
          section === 'Models' && (
            <button
              type="button"
              className="rounded-md p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-500"
              title="Create new model"
            >
              <PlusIcon className="size-5" aria-hidden="true" />
              <span className="sr-only">Create new model</span>
            </button>
          )
        }
      </div>
      <ul role="list" className="-mx-2 mt-2 space-y-1">
        {navItems.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              className={classNames(
                // item.current ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                'group flex gap-x-3 rounded-md p-2 pl-3 text-sm/6 font-semibold',
              )}
            >
              {item.name}
              {item.count ? (
                <span
                  aria-hidden="true"
                  className="ml-auto w-9 min-w-max rounded-full bg-white px-2.5 py-0.5 text-center text-xs/5 font-medium whitespace-nowrap text-gray-600 ring-1 ring-gray-200 ring-inset"
                >
                  {item.count}
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default SecondarySidebar;