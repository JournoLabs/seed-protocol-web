import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { atom, type WritableAtom } from 'nanostores';
import type { ITerminal } from '../types/terminal';
import { newShellProcess } from '../helpers/shell';
import { coloredText } from '../helpers/terminal';
import { setupWebContainerPersistence, initializeWebContainerFromSnapshot } from '../helpers/webContainerPersistence';

export class TerminalStore {
  #webcontainer: WebContainer | null = null;
  #terminals: Array<{ terminal: ITerminal; process: WebContainerProcess }> = [];

  showTerminal: WritableAtom<boolean> = import.meta.hot?.data.showTerminal ?? atom(false);

  constructor(webcontainer: WebContainer) {
    this.#webcontainer = webcontainer;
    
    // Set up automatic snapshot saving
    setupWebContainerPersistence(webcontainer);

    if (import.meta.hot) {
      import.meta.hot.data.showTerminal = this.showTerminal;
    }
  }

  async attachTerminal(terminal: ITerminal) {
    if (!this.#webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const shellProcess = await newShellProcess(this.#webcontainer, terminal);
      this.#terminals.push({ terminal, process: shellProcess });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      terminal.write(coloredText.red('Failed to spawn shell\n\n') + errorMessage);
      return;
    }
  }

  onTerminalResize(cols: number, rows: number) {
    for (const { process } of this.#terminals) {
      process.resize({ cols, rows });
    }
  }
}
