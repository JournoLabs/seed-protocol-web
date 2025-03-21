import { WebContainer, WebContainerProcess } from '@webcontainer/api'
import { TerminalStore }                     from '../state/terminal.ts'
import { ITerminal }                        from './terminal.ts'
import { Terminal as XTerm }                from '@xterm/xterm'


export interface WebContainerContext {
  webcontainer: WebContainer | null | undefined;
  terminalStore: TerminalStore | null | undefined;
  terminal: XTerm | null | undefined;
  shellProcess: WebContainerProcess | null | undefined;
  commandQueue: Map<string, string>;
  runningCommands: Map<string, string>;
  commandResults: Map<string, string>;
  error: Error | null;
}

export type WebContainerEvent =
  | { type: 'INITIALIZE' }
  | { type: 'INITIALIZED'; webcontainer: WebContainer, terminalStore: TerminalStore }
  | { type: 'FAILED'; error: Error }
  | { type: 'ATTACH_TERMINAL'; terminal: ITerminal, shellProcess: WebContainerProcess }
  | { type: 'RUN_COMMAND'; command: string, id: string }
  | { type: 'COMMAND_COMPLETE'; id: string, result: string }
  | { type: 'COMMAND_ERROR'; command: string, id: string, error: Error }
  | { type: 'CLEAR_RESULTS'; id: string }
  | { type: 'RETURN_TO_IDLE' }
  | { type: 'UPDATE_CONTEXT'; updates: Record<string, unknown> }



export type FromCallbackInput<T, P = undefined> = {
  context: T
  event?: P
}
