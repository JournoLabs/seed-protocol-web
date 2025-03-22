import PageContainer from '../components/Page/PageContainer'
import ModelPropertyList from '../components/ModelProperty/ModelPropertyList'
import { useParams, } from 'react-router-dom'
import { useModels } from '@seedprotocol/sdk'
const ModelPage = () => {
  const { section, modelName } = useParams()

  const {models} = useModels()

  if (!modelName) {
    // Get the first model name from the models object
    const firstModelName = Object.keys(models)[0]
    // return <Navigate to={`/Models/${firstModelName}`} replace />
  }

  return (
    <PageContainer
      title={modelName}
      description={''}
      actions={[]}
      firstLevelNav={section}
    >
      {() => (
        <div>
          <div className="sm:flex sm:items-center mb-8">
            <div className="sm:flex-auto">
              <h2 className="text-base! font-semibold text-gray-900">Properties</h2>
              <p className="mt-2 text-sm text-gray-700">
                A list of all the properties for the model.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Add property
              </button>
            </div>
          </div>
  
          <ModelPropertyList modelName={modelName} />
        </div>
      )}
    </PageContainer>
  )
}

export default ModelPage
