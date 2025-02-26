import React, { Fragment, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';

// Type definitions
type PropertyType = 'Text' | 'Number' | 'Boolean' | 'Date' | 'Relation' | 'List' | 'ImageSrc';

interface Property {
  name: string;
  type: PropertyType;
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
  'List',
  'ImageSrc'
];

const DialogCreate: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const initialValues: ModelFormValues = {
    modelName: '',
    properties: [{ name: '', type: 'Text' }]
  };

  const onSubmit = (values: ModelFormValues) => {
    console.log('Form values:', values);
    
    // Generate TypeScript code based on form values
    const generatedCode = generateModelCode(values);
    console.log('Generated code:', generatedCode);
    
    // Close modal after submit
    closeModal();
  };

  const validate = (values: ModelFormValues) => {
    const errors: any = {};

    if (!values.modelName) {
      errors.modelName = 'Model name is required';
    }

    if (values.properties) {
      const propertyErrors = values.properties.map(property => {
        const propError: any = {};
        if (!property.name) {
          propError.name = 'Property name is required';
        }
        return propError;
      });

      if (propertyErrors.some(error => Object.keys(error).length > 0)) {
        errors.properties = propertyErrors;
      }
    }

    return errors;
  };

  // Generate TypeScript model code
  const generateModelCode = (values: ModelFormValues): string => {
    const { modelName, properties } = values;

    return `import { Model, ${[...new Set(properties.map(p => p.type))].join(', ')} } from '@seedprotocol/sdk'

@Model
class ${modelName} {
${properties.map(prop => `  @${prop.type}() ${prop.name}!: ${getTypeForProperty(prop)}`).join('\n')}
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
      case 'ImageSrc':
        return 'string';
      default:
        return 'any';
    }
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <TransitionChild
            as={Fragment}
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
                as={Fragment}
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
                    render={({
                      handleSubmit,
                      form,
                      submitting,
                      pristine,
                      values,
                      errors
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
                          <h4 className="text-sm font-medium text-gray-700">Preview</h4>
                          <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs overflow-auto">
                            {generateModelCode(values)}
                          </pre>
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
                            disabled={submitting || pristine}
                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2  focus:ring-offset-2 disabled:bg-blue-300"
                          >
                            Save Model
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