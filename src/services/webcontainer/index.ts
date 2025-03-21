import { assign, setup, createActor, enqueueActions } from 'xstate'
import { WebContainer }                                              from '@webcontainer/api';
import { initializeWebContainer }                 from './actors/initialize.ts'
import { WebContainerContext, WebContainerEvent } from '../../types/services.ts'
import { ITerminal }                                 from '../../types/terminal.ts'
import { newShellProcess } from '../../helpers/shell.ts'
import { Terminal as XTerm } from '@xterm/xterm'
import { generateId } from '../../helpers'
import debug          from 'debug'

const logger = debug('seedWeb:services:webcontainer')



// Create the state machine
export const webContainerMachine = setup({
    types: {
      context: {} as WebContainerContext,
      events: {} as WebContainerEvent,
    },
  actors: {
      initializeWebContainer,
  },
  guards: {
      areCommandsRunning: ( {context}) => context.runningCommands.size > 0
  }
}).createMachine({
  id: 'webcontainer',
  initial: 'idle',
  context: {
    webcontainer: null,
    error: null
  },
  on: {
    UPDATE_CONTEXT: {
      actions: assign(( {context, event} ) => {
        return {
          ...context,
          ...event.updates
        }
      }),
    },
    ATTACH_TERMINAL: assign({
      terminal: ( { event} ) => {
        event.terminal
        logger('Attach terminal', event.terminal)
        return event.terminal
      },
      shellProcess: ( { event} ) => {
        logger('Attach shell process', event.shellProcess)
        return event.shellProcess
      }
    })
  },
  states: {

    idle: {
      on: {
        INITIALIZE: 'initializing'
      }
    },

    initializing: {
      on: {

        // When initialization is successful
        INITIALIZED: {
          target: 'operational',
          actions: assign({
            webcontainer: ({event}) => event.webcontainer
          })
        },

        // When initialization fails
        FAILED: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.error
          })
        },

        // Queue commands if received during initialization
        RUN_COMMAND: {
          actions: assign({
            commandQueue: ({ context, event }) => {
              const newQueue = new Map(context.commandQueue);
              newQueue.set(event.id, event.command);
              return newQueue;
            }
          })
        }

      },
      invoke: {
        src: 'initializeWebContainer',
        input: ({context}) => ({ context })
      }
    },

    operational: {
      initial: 'idle',
      // Always accept RUN_COMMAND events in the operational state
      on: {
        RUN_COMMAND: {
          actions: enqueueActions(( {enqueue, check,} ) => {
            enqueue.assign({
              runningCommands: ( {context, event} ) => {
                const newRunning = new Map(context.runningCommands);
                newRunning.set(event.id, event.command);
                return newRunning;
              }
            })

          })
        },
        CLEAR_RESULTS: {
          actions: assign({
            commandResults: () => new Map()
          })
        },
        RETURN_TO_IDLE: 'idle'
      },
      states: {
        idle: {
          on: {
            RUN_COMMAND: 'runningCommands'
          }
        },
        runningCommands: {
          // This state activates when commands are running
          on: {
            COMMAND_COMPLETE: {
              actions: enqueueActions(( {enqueue, check,} ) => {
                enqueue.assign({
                  commandResults: ( {context, event} ) => {
                    const newResults = new Map(context.commandResults);
                    newResults.set(event.id, event.result);
                    return newResults;
                  },
                  // Remove from running commands
                  runningCommands: ( {context, event} ) => {
                    const newRunning = new Map(context.runningCommands);
                    newRunning.delete(event.id);
                    return newRunning;
                  }
                })

                if ( !check('areCommandsRunning') ) {
                  enqueue.emit({type: 'RETURN_TO_IDLE'});
                }
              })
            },
            COMMAND_ERROR: {
              actions: enqueueActions(( {enqueue, check,} ) => {
                enqueue.assign({
                  commandResults: ( {context, event} ) => {
                    const newResults = new Map(context.commandResults);
                    newResults.set(event.id, JSON.stringify(event.error));
                    return newResults;
                  },
                  // Remove from running commands
                  runningCommands: ( {context, event} ) => {
                    const newRunning = new Map(context.runningCommands);
                    newRunning.delete(event.id);
                    return newRunning;
                  }
                })

                if ( !check('areCommandsRunning') ) {
                  enqueue.emit({type: 'RETURN_TO_IDLE'});
                }
              })
            }
          }
        }
      }
    },

    error: {
      // Error state when initialization fails
      on: {
        // Allow retry from error state
        INITIALIZE: 'initializing'
      }
    }
  }
});

const service = createActor(webContainerMachine, {
  input: {
    context: {
      webcontainer: null,
      terminalStore: null,
      commandQueue: new Map(),
      runningCommands: new Map(),
      commandResults: new Map(),
      error: null
    }
  }
}).start()


export const WebContainerService = {

  start: () => {
    service.send({type: 'INITIALIZE'});
    return service;
  },

  getService: () => {
    return service
  },

  getWebContainer: (): WebContainer | undefined | null => {
    return service.getSnapshot().context.webcontainer
  },

  attachTerminal: async (terminal: ITerminal) => {
    const {webcontainer, shellProcess,} = service.getSnapshot().context
    if (!webcontainer) {
      logger('WebContainer not initialized',);
      return
    }
    if (shellProcess) {
      logger('Shell process already attached, updating terminal',);
      service.send({type: 'UPDATE_CONTEXT', updates: {
        terminal,
      }})
      return
    }
    const newProcess = await newShellProcess(webcontainer, terminal);
    service.send({type: 'UPDATE_CONTEXT', updates: {
      terminal,
      shellProcess: newProcess
    }})
  },

  getTerminal: (): XTerm | undefined | null => {
    return service.getSnapshot().context.terminal
  },

  onTerminalResize: (cols: number, rows: number) => {
    const process = service.getSnapshot().context.shellProcess
    if (!process) {
      logger('[onTerminalResize] No shell process attached');
      return
    }
    logger('[onTerminalResize] Resizing shell process', cols, rows);
    process.resize({ cols, rows });
    service.send({type: 'UPDATE_CONTEXT', updates: {shellProcess: process}})
  },

  runCommand: (command: string): Promise<void> => {
    const eventId = generateId();

    return new Promise((resolve) => {

      service.send({type: 'RUN_COMMAND', id: eventId, command})
      const subscription = service.subscribe((snapshot) => {
        if (snapshot.context.runningCommands && snapshot.context.runningCommands.has(eventId)) {
          resolve();
          subscription.unsubscribe();
        }
      })

    })
  },

  saveContainer: (): Promise<void> => {

  }
}

