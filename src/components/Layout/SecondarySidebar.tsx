import { classNames } from '../../helpers';
import debug from 'debug';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Link, useParams } from 'react-router-dom';
import { useModels } from '@seedprotocol/sdk';
import { useState, useEffect } from 'react';

const logger = debug('seedWeb:components:SecondarySidebar')

interface NavItem {
  name: string;
  href: string;
  count: number;
}

const SecondarySidebar = () => {

  const [navItems, setNavItems] = useState<NavItem[]>([]);

  const { section, modelName, } = useParams();

  const {models} = useModels();

  useEffect(() => {
    if (!models) {
      return
    }

    setNavItems(Object.entries(models).map(([modelName,]) => {
      const ModelClass = models[modelName as keyof typeof models]
      return {
        name: modelName,
        href: `/Models/${modelName}`,
        count: Object.keys(ModelClass.schema).length,
      }
    }))
    
  }, [models])

  return (
    <nav aria-label="Sidebar" className="flex flex-1 flex-col">
      <div className="flex items-center justify-between -mx-2">
        <h2 className="text-xs/6! font-semibold! text-gray-400! capitalize">{section}</h2>
        {
          section?.toLowerCase() === 'models' && (
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
        {navItems.map((item) => {
          const isCurrent = item.name.toLowerCase() === modelName?.toLowerCase();
          return (
            <li key={item.name}>
              <Link
                to={item.href}
                className={classNames(
                  isCurrent
                    ? 'bg-gray-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                  'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                )}
              >
                <span
                  className={classNames(
                    isCurrent
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600',
                    'flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium',
                  )}
                >
                  {item.name.charAt(0)}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default SecondarySidebar;