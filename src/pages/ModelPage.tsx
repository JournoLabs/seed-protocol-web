import PageContainer from '../components/Page/PageContainer'
import ModelPropertyList from '../components/ModelProperty/ModelPropertyList'
import { useParams, redirect } from 'react-router-dom'
import { models } from '../../schema'

const ModelPage = () => {
  const { section, modelName } = useParams()

  if (!modelName) {
    // Get the first model name from the models object
    const firstModelName = Object.keys(models)[0]
    return redirect(`/Models/${firstModelName}`)
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
          <h3>Properties</h3>
          <ModelPropertyList modelName={modelName} />
        </div>
      )}
    </PageContainer>
  )
}

export default ModelPage
