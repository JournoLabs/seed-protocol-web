import { models } from '../../schema'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Fragment, memo, } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import PageContainer from '../components/Page/PageContainer'



const TabContent = memo(({ modelName }: { modelName: string }) => {
  return <></>
})

const actions = [
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

const ModelsPage = () => {

  return (
    <PageContainer
      title={'Models'}
      actions={actions}
      firstLevelNav={'Models'}
    >
      {({selectedIndex, setSelectedIndex}) => (
            <TabGroup
              as={'div'}
              className={'w-full mt-8'}
              selectedIndex={selectedIndex}
              onChange={setSelectedIndex}
            >
            <TabList
              as={'div'}
              className={'flex flex-row items-center gap-x-4 mb-5 mt-5'}
            >
              {Object.entries(models).map(([modelName]) => {
                return (
                  <Tab
                    key={`${modelName}Tab`}
                    as={Fragment}
                  >
                    {({ hover, selected }) => (
                      <button
                        className={`${selected ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'} rounded-md px-3 py-2 font-medium`}
                      >
                        {modelName}
                      </button>
                    )}
                  </Tab>
                )
              })}
            </TabList>
      <TabPanels>
        {Object.entries(models).map(([modelName]) => {
          return (
            <TabPanel
              key={`${modelName}TabPanel`}
              className={'pt-6'}
            >
              <TabContent modelName={modelName} />
            </TabPanel>
          )
        })}
      </TabPanels>
    </TabGroup>
        )
      }
      
    </PageContainer>
  )
}

export default ModelsPage
