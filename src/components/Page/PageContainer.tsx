import { FC, useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { models } from '../../../schema'
import PageHeader from "./PageHeader"

const modelNames = Object.keys(models)

interface PageContainerRenderProps {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

type PageContainerProps = {
  title: string
  description: string
  actions: { label: string; icon: React.ReactNode; href: string }[]
  firstLevelNav: string | undefined
  children: (props: PageContainerRenderProps) => React.ReactNode
}

const PageContainer: FC<PageContainerProps> = ({children, title, description, actions, firstLevelNav}) => {

  const { modelName, seedId, section } = useParams()
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
    if (!seedId && location.pathname !== `/${section}/${currentTab}`) {
      navigate(`/${section}/${currentTab}`, { preventScrollReset: true })
    }
  }, [selectedIndex, navigate, location, section])

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={actions}
      />
      <div className="py-10">
        {typeof children === 'function' ? children({selectedIndex, setSelectedIndex}) : null}
      </div>
    </>
  )
}

export default PageContainer