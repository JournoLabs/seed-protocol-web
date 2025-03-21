import React, { Fragment, } from 'react';
import { Form, Field } from 'react-final-form';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { XMarkIcon, PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../state/db';
import { writeAppState } from '../../helpers/appState';
import debug from 'debug'
import { WebContainerService } from '../../services/webcontainer'

const logger = debug('seedWeb:components:Model:DialogCreate')

// Type definitions
type PropertyType = 'Text' | 'Number' | 'Boolean' | 'Date' | 'Relation' | 'RelationList' | 'List' | 'Image';

interface Property {
  name: string;
  type: PropertyType;
  targetModel?: string; // Optional target model for relations
}

interface ModelFormValues {
  modelName: string;
  properties: Property[];
}

// Available property types
const PROPERTY_TYPES: PropertyType[] = [
  'Text',
  'Number',
  'Boolean',
  'Date',
  'Relation',
  'RelationList',
  'List',
  'Image'
];

const availableModels = ['Post', 'User', 'Product', 'Identity']; // Example models

const DialogCreate: React.FC = () => {

  const db = getDb()

  const isOpen = useLiveQuery(
    () => db.appState.filter(a => a.key === 'isDialogCreateOpen').first().then(a => a?.value),
    [],
    false
  )

  const isSavingModel = useLiveQuery(
    () => db.appState.filter(a => a.key === 'isSavingModel').first().then(a => a?.value),
    [],
    false
  )

  console.log('isOpen', isOpen)

  const closeModal = async () => {
    await writeAppState('isDialogCreateOpen', false)
  }

  const initialValues: ModelFormValues = {
    modelName: '',
    properties: [{ name: '', type: 'Text' }]
  };

  const onSubmit = async (values: ModelFormValues) => {
    logger('Form values:', values);
    await writeAppState('isSavingModel', true)

    const webcontainer = WebContainerService.getWebContainer()

    await webcontainer!.fs.writeFile('./schemaJson.json', JSON.stringify(values, null, 2))
    
    await WebContainerService.runCommand('npx tsx ./jsonToSchema.ts',)
    // Close modal after submit
    closeModal();
    await writeAppState('isSavingModel', false)
  };

  const validate = async (values: ModelFormValues): Promise<Record<string, string | Record<string, string>[]>> => {
    const errors: Record<string, string | Record<string, string>[]> = {};

    if (!values.modelName) {
      errors.modelName = 'Model name is required';
    }

    if (values.properties) {
      const propertyErrors = values.properties.map(property => {
        const propError: Record<string, string> = {};
        if (!property.name) {
          propError.name = 'Property name is required';
        }
        return propError;
      });

      if (propertyErrors.some(error => Object.keys(error).length > 0)) {
        errors.properties = propertyErrors;
      }
    }

    if (Object.keys(errors).length > 0) {
      await writeAppState('isSavingModel', false)
    }

    return errors;
  };

  // Generate TypeScript model code
  const generateModelCode = (values: ModelFormValues): string => {
    const { modelName, properties } = values;

    return `import { Model, ${[...new Set(properties.map(p => p.type))].join(', ')} } from '@seedprotocol/sdk'

@Model
class ${modelName} {
${properties.map(prop => {
  if (prop.type === 'Relation' || prop.type === 'RelationList') {
    const relationType = prop.type === 'Relation' ? prop.targetModel : `${prop.targetModel}[]`;
    return `  @${prop.type}() ${prop.name}!: ${relationType}`;
  }
  return `  @${prop.type}() ${prop.name}!: ${getTypeForProperty(prop)}`;
}).join('\n')}
}

export { ${modelName} }`;
  };

  // Helper to determine TypeScript type based on property type
  const getTypeForProperty = (property: Property): string => {
    switch (property.type) {
      case 'Text':
        return 'string';
      case 'Number':
        return 'number';
      case 'Boolean':
        return 'boolean';
      case 'Date':
        return 'Date';
      case 'List':
        return 'string[]';
      case 'Relation':
        return 'string';
      case 'Image':
        return 'string';
      default:
        return 'any';
    }
  };

  return (
    <>
      <Transition appear show={!!isOpen} as={'div'}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <TransitionChild
            as={'div'}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={'div'}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center">
                    <DialogTitle
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Create Model Definition
                    </DialogTitle>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={closeModal}
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <Form
                    onSubmit={onSubmit}
                    initialValues={initialValues}
                    validate={validate}
                    mutators={{
                      ...arrayMutators
                    }}
                    keepDirtyOnReinitialize={true}
                    render={({
                      handleSubmit,
                      submitting,
                      pristine,
                      values
                    }) => (
                      <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                        <div>
                          <label htmlFor="modelName" className="block text-sm font-medium text-gray-700">
                            Model Name
                          </label>
                          <Field name="modelName">
                            {({ input, meta }) => (
                              <div>
                                <input
                                  {...input}
                                  type="text"
                                  className="mt-1 block w-full rounded-md sm:text-sm"
                                  placeholder="e.g. Post, User, Product"
                                />
                                {meta.error && meta.touched && (
                                  <p className="mt-1 text-sm text-red-600">{meta.error}</p>
                                )}
                              </div>
                            )}
                          </Field>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Properties
                          </label>
                          
                          <FieldArray name="properties">
                            {({ fields }) => (
                              <div className="space-y-3">
                                {fields.map((name, index) => (
                                  <div key={name} className="flex items-start space-x-2">
                                    <div className="flex-grow">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <Field name={`${name}.name`}>
                                            {({ input, meta }) => (
                                              <div>
                                                <input
                                                  {...input}
                                                  type="text"
                                                  placeholder="Property name"
                                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500  sm:text-sm"
                                                />
                                                {meta.error && meta.touched && (
                                                  <p className="mt-1 text-sm text-red-600">{meta.error}</p>
                                                )}
                                              </div>
                                            )}
                                          </Field>
                                        </div>
                                        <div>
                                          <Field name={`${name}.type`} component="select" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 sm:text-sm">
                                            {PROPERTY_TYPES.map(type => (
                                              <option key={type} value={type}>
                                                {type}
                                              </option>
                                            ))}
                                          </Field>

                                          {(fields.value[index].type === 'Relation' || fields.value[index].type === 'RelationList') && (
                                            <Field name={`${name}.targetModel`} component="select" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 sm:text-sm mt-2">
                                              <option value="">Select target model</option>
                                              {availableModels.map(model => (
                                                <option key={model} value={model}>
                                                  {model}
                                                </option>
                                              ))}
                                            </Field>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => fields.remove(index)}
                                      className="inline-flex items-center p-1.5 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    >
                                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                  </div>
                                ))}
                                
                                <button
                                  type="button"
                                  onClick={() => fields.push({ name: '', type: 'Text' })}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                >
                                  <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                                  Add Property
                                </button>
                              </div>
                            )}
                          </FieldArray>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                          <Disclosure defaultOpen={false} as={'div'}>
                            {({ open }) => (
                              <>
                                <DisclosureButton 
                                  as="button"
                                  className="flex w-full justify-between items-center text-sm font-medium text-gray-700 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75"
                                >
                                  <h4>Preview</h4>
                                  {open ? (
                                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                  ) : (
                                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                  )}
                                </DisclosureButton>
                                <DisclosurePanel className="mt-2">
                                  <pre className="p-3 bg-gray-50 rounded-md text-xs overflow-auto">
                                    {generateModelCode(values)}
                                  </pre>
                                </DisclosurePanel>
                              </>
                            )}
                          </Disclosure>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2  focus:ring-offset-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submitting || pristine || isSavingModel}
                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2  focus:ring-offset-2 disabled:bg-blue-300"
                          >
                            {isSavingModel ? 'Saving...' : 'Save Model'}
                          </button>
                        </div>
                      </form>
                    )}
                  />
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default DialogCreate;
