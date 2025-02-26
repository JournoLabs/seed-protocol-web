import { FC, PropsWithChildren, useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { models } from '../../../schema'
import PageHeader from "./PageHeader"

const modelNames = Object.keys(models)

type PageContainerProps = PropsWithChildren & {
  title: string
  description: string
  actions: { label: string; icon: React.ReactNode; href: string }[]
  firstLevelNav: string | undefined
}

const PageContainer: FC<PageContainerProps> = ({children, title, description, actions, firstLevelNav}) => {

  const { modelName, seedId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize the active index based on the URL parameter or default to the first tab
  const initialIndex = modelName ? modelNames.indexOf(modelName) : 0
  const [selectedIndex, setSelectedIndex] = useState(
    initialIndex !== -1 ? initialIndex : 0,
  )

  // Update the tab when the URL parameter changes
  useEffect(() => {
    if (modelName && modelNames.includes(modelName)) {
      setSelectedIndex(modelNames.indexOf(modelName))
    }
  }, [modelName])

  // Update the URL when the tab changes
  useEffect(() => {
    const currentTab = modelNames[selectedIndex]
    if (!seedId && location.pathname !== `/${firstLevelNav}/${currentTab}`) {
      navigate(`/${firstLevelNav}/${currentTab}`, { preventScrollReset: true })
    }
  }, [selectedIndex, navigate, location])

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={actions}
      />
      {typeof children === 'function' ? children({selectedIndex, setSelectedIndex}) : null}
    </>
  )
}

export default PageContainer