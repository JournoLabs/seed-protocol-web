import { LinkIcon, FolderIcon, DocumentIcon, TagIcon } from '@heroicons/react/24/outline'
import { FC } from 'react';
import { PropertyAttribute, PropertyDetails } from '../../types/modelProperties';
import PropertyTypeBadge from './ModelPropertyTypeBadge';
import { Link } from 'react-router-dom';
import { models } from '../../../schema';


const ModelPropertyListItem: FC<PropertyDetails> = (property) => {

  const modelNames = Object.keys(models)

  const attributes: PropertyAttribute[] = [
    { name: 'Type', value: property.dataType || null, icon: TagIcon },
    { name: 'Storage', value: property.storageType || null, icon: FolderIcon },
    { name: 'Path', value: property.path || null, icon: LinkIcon },
    { name: 'Filename Suffix', value: property.filenameSuffix || null, icon: DocumentIcon }
  ];


  return (
    <div className="border-b border-gray-200 py-2 grid grid-cols-5 gap-4 text-sm hover:bg-gray-50">
      {/* Property Name Column */}
      <div className="flex items-center">
        <span className="font-medium text-gray-900">{property.name}</span>
        {property.required && (
          <span className="ml-1 text-xs text-red-500">*</span>
        )}
      </div>
      
      {/* Type Column with Badge */}
      <div className="flex items-center">
        <PropertyTypeBadge type={property.dataType} />
      </div>
      
      {/* Property Type Column (for Relation/List) */}
      <div className="flex items-center">
        {property.dataType &&
          (property.dataType === 'Relation' || property.dataType === 'List') && (
            <div className="flex items-center">
              <TagIcon className="h-4 w-4 mr-1 flex-shrink-0 text-gray-500" />
              {
                modelNames.includes(property.ref) ? (
                  <Link to={`/Models/${property.ref}`} className="font-mono text-gray-700">{property.ref}</Link>
                ) : (
                  <span className="font-mono text-gray-700">{property.ref}</span>
                )
              }
            </div>
          )
        }
      </div>
      
      {/* Storage Column */}
      <div className="flex items-center">
        {property.storageType && (
          <div className="flex items-center">
            <FolderIcon className="h-4 w-4 mr-1 flex-shrink-0 text-gray-500" />
            <span className="font-mono text-gray-700">{property.storageType}</span>
          </div>
        )}
      </div>
      
      {/* Path/Extension Column */}
      <div className="flex items-center">
        {(property.path || property.filenameSuffix) && (
          <div className="flex items-center">
            {property.path && (
              <>
                <LinkIcon className="h-4 w-4 mr-1 flex-shrink-0 text-gray-500" />
                <span className="font-mono text-gray-700 mr-1">{property.path}</span>
              </>
            )}
            {property.filenameSuffix && (
              <>
                <DocumentIcon className="h-4 w-4 mr-1 flex-shrink-0 text-gray-500" />
                <span className="font-mono text-gray-700">{property.filenameSuffix}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )

  // return (
  //   <Disclosure 
  //     as="div" 
  //     className="border-b border-gray-200 py-3"
  //     defaultOpen={true}
  //   >
  //   {({ open }) => (
  //     <>
  //       <DisclosureButton className="flex w-full items-start justify-between text-left">
  //         <div className="flex items-center">
  //           {open ? (
  //             <ChevronDownIcon className="h-5 w-5 text-gray-500 mr-2" />
  //           ) : (
  //             <ChevronRightIcon className="h-5 w-5 text-gray-500 mr-2" />
  //           )}
  //           <span className="font-medium text-gray-900">{property.name}</span>
  //           <span className="ml-2">
  //             <PropertyTypeBadge type={property.dataType} />
  //           </span>
  //           {property.required && (
  //             <span className="ml-2 text-xs text-red-500">Required</span>
  //           )}
  //         </div>
  //       </DisclosureButton>
  //       <Transition
  //         enter="transition duration-100 ease-out"
  //         enterFrom="transform scale-95 opacity-0"
  //         enterTo="transform scale-100 opacity-100"
  //         leave="transition duration-75 ease-out"
  //         leaveFrom="transform scale-100 opacity-100"
  //         leaveTo="transform scale-95 opacity-0"
  //       >
  //         <DisclosurePanel className="mt-2 pl-7">
  //           {filteredAttributes.length > 0 ? (
  //             <div className="space-y-1">
  //               {filteredAttributes.map((attr, index) => (
  //                 <ModelPropertyAttributeItem key={index} attribute={attr} />
  //               ))}
  //             </div>
  //           ) : (
  //             <p className="text-sm text-gray-500 italic">No additional attributes</p>
  //           )}
  //         </DisclosurePanel>
  //       </Transition>
  //     </>
  //   )}
  // </Disclosure>
  // )
}

export default ModelPropertyListItem;