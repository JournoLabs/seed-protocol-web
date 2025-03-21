import { WebContainerService } from '../services/webcontainer'
import { useSelector } from '@xstate/react'

export const useWebContainer = () => {

  const service = WebContainerService.getService()

  const status = useSelector(service, (snapshot) => {
    return snapshot.value
  })

  const webcontainer = useSelector(service, (snapshot) => {
    return snapshot.context.webcontainer
  })


  return {
    webcontainer,
    status,
  }
}
