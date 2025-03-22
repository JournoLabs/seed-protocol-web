import { FC } from 'react'
import { useParams, } from 'react-router-dom'
import ModelPage from '../../pages/ModelPage'
import ItemPage from '../../pages/ItemPage'

const SectionRouter: FC = () => {
  const { section } = useParams()

  switch (section?.toLowerCase()) {
    case 'models':
      return <ModelPage />
    case 'items':
      return <ItemPage />
    default:
      return <></>
  }
}

export default SectionRouter 