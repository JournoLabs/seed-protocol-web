import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SerializeAddon } from '@xterm/addon-serialize';
import { Terminal as XTerm } from '@xterm/xterm';
import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react';
import type { Theme } from '../../state/theme';
import { getTerminalTheme } from './theme';
import debug from 'debug';
import { WebContainerService } from '../../services/webcontainer';

const logger = debug('seedWeb:components:WebContainer:Terminal');


export interface TerminalRef {
  reloadStyles: () => void;
  fit: () => void;
}

export interface TerminalProps {
  className?: string;
  theme: Theme;
  readonly?: boolean;
  onTerminalReady?: (terminal: XTerm) => void;
  onTerminalResize?: (cols: number, rows: number) => void;
}

export const Terminal = memo(
  forwardRef<TerminalRef, TerminalProps>(({ className, theme, readonly, onTerminalReady, onTerminalResize }, ref) => {
    const terminalElementRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<XTerm | null | undefined>(null);
    const fitAddonRef = useRef<FitAddon>();
    const serializeAddonRef = useRef<SerializeAddon>();

    useEffect(() => {
      const element = terminalElementRef.current!;

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      const serializeAddon = new SerializeAddon();
      
      fitAddonRef.current = fitAddon;
      serializeAddonRef.current = serializeAddon;

      let terminal = WebContainerService.getService().getSnapshot().context.terminal;
      
      if (terminal && fitAddonRef.current) {
        logger('Terminal already exists, fitting');
        fitAddonRef.current.fit()
      }
      
      if (!terminal) {
        terminal = new XTerm({
          cursorBlink: true,
          convertEol: true,
          disableStdin: readonly,
          theme: getTerminalTheme(readonly ? { cursor: '#00000000' } : {}),
          fontSize: 12,
          fontFamily: 'Menlo, courier-new, courier, monospace',
        });
      }
      
      if (!terminal) {
        throw new Error('Terminal not found');
      }

      terminalRef.current = terminal;

      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);
      terminal.loadAddon(serializeAddon);
      terminal.open(element);

      const resizeObserver = new ResizeObserver(() => {
        logger('Resize observer triggered');
        // fitAddonRef.current?.fit();
        onTerminalResize?.(terminal.cols, terminal.rows);
      });

      resizeObserver.observe(element);

      logger('Attach terminal', serializeAddon.serialize());

      onTerminalReady?.(terminal);

      return () => {
        logger('Detach terminal');
        resizeObserver.disconnect();
        terminalRef.current?.dispose();
        terminalRef.current = null;
      };
    }, []);

    useEffect(() => {
      const terminal = WebContainerService.getTerminal();

      if (!terminal) {
        return;
      }

      // we render a transparent cursor in case the terminal is readonly
      terminal.options.theme = getTerminalTheme(readonly ? { cursor: '#00000000' } : {});

      terminal.options.disableStdin = readonly;
    }, [theme, readonly]);

    useImperativeHandle(ref, () => {
      return {
        reloadStyles: () => {
          const terminal = WebContainerService.getTerminal();
          if (!terminal) {
            return;
          }
          terminal.options.theme = getTerminalTheme(readonly ? { cursor: '#00000000' } : {});
        },
        fit: () => {
          fitAddonRef.current?.fit();
          if (!onTerminalResize) {
            logger('No onTerminalResize callback, skipping fit');
            return
          }
          const terminal = WebContainerService.getTerminal();
          if (!terminal) {
            logger('No terminal, skipping onTerminalResize call');
            return;
          }
          logger('Resize terminal', terminal.cols, terminal.rows);
          onTerminalResize?.(terminal.cols, terminal.rows);
        }
      };
    }, [onTerminalResize, readonly]);

    return <div className={className} ref={terminalElementRef} />;
  }),
);
