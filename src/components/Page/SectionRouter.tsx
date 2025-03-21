import { FC } from 'react'
import { useParams } from 'react-router-dom'
import ModelPage from '../../pages/ModelPage'
import ItemPage from '../../pages/ItemPage'

const SectionRouter: FC = () => {
  const { section } = useParams()

  switch (section) {
    case 'Models':
      return <ModelPage />
    case 'Items':
      return <ItemPage />
    default:
      return <ModelPage />
  }
}

export default SectionRouter 