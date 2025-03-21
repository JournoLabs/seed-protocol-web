import { WebContainer }                              from '@webcontainer/api'
import { EventObject, fromCallback }                                 from 'xstate'
import { FromCallbackInput, WebContainerContext, WebContainerEvent } from '../../../types/services.ts'
import { TerminalStore } from '../../../state/terminal.ts'
import debug from 'debug'

const logger = debug('seedWeb:services:webcontainer:actions:initialize')

export const initializeWebContainer = fromCallback<
  EventObject,
  FromCallbackInput<WebContainerContext, WebContainerEvent>
>(({ sendBack, }) => {

  let webcontainer: WebContainer | undefined
  let terminalStore: TerminalStore | undefined
  let error: Error | null = null

  const _initialize = async () => {
    try {
      const seedFolderResponse = await fetch('/seed-folder-snapshot')
      const seedFolderBuffer = await seedFolderResponse.arrayBuffer()
      const containerFolderResponse = await fetch('/container-folder-snapshot')
      const containerFolderBuffer = await containerFolderResponse.arrayBuffer()
      webcontainer = await WebContainer.boot()
      await webcontainer.mount(seedFolderBuffer)
      await webcontainer.mount(containerFolderBuffer)
      const files = await webcontainer.fs.readdir('/')
      logger('files after mount', files)

      await webcontainer.spawn('npm', ['install'])


      terminalStore = new TerminalStore(webcontainer)

      return true
    } catch ( initialzationError ) {
      error = initialzationError
      return false
    }
  }

  _initialize().then((didSucceed) => {
    if (didSucceed && webcontainer) {
      logger('webcontainer initialized')
      sendBack({ type: 'INITIALIZED', webcontainer, terminalStore, })
    }

    if (!didSucceed) {
      sendBack({ type: 'FAILED', error })
    }
  })

})
