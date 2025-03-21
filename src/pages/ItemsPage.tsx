import PageContainer from '../components/Page/PageContainer'
import { useParams } from 'react-router-dom'


const actions: { label: string; icon: React.ReactNode; href: string }[] = [
  // {
  //   label: 'Create',
  //   icon: <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 size-5" />,
  //   href: '#',
  // },
  // {
  //   label: 'Publish',
  //   icon: <CheckIcon />, 
  //   href: '#',
  // },
  // {
  //   label: 'View',
  //   icon: <LinkIcon />,
  //   href: '#',
  // },
]

const ItemsPage = () => {
  const { section } = useParams()

  return (
    <PageContainer
      title={'Items'}
      description={''}
      actions={actions}
      firstLevelNav={section}
    >
      {({selectedIndex, setSelectedIndex}) => (
            <></>
        )
      }
      
    </PageContainer>
  )
}

export default ItemsPage
