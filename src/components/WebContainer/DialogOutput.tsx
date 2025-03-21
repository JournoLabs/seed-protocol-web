import { useRef, useEffect } from 'react';
import { useWebContainerOutput } from '../../helpers/useWebContainerOutput';
import { writeAppState } from '../../helpers/appState';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../state/db';
import '@xterm/xterm/css/xterm.css';
import { Terminal, TerminalRef } from './Terminal';
import { WebContainerService }         from '../../services/webcontainer'
import debug from 'debug'

const logger = debug('seedWeb:components:WebContainer:DialogOutput');

interface OutputDialogProps {
  className?: string;
}

export const DialogOutput: React.FC<OutputDialogProps> = ({ 
  className = '' 
}) => {

  const terminalComponentRef = useRef<TerminalRef | null>(null);

  const db = getDb()

  const isVisible = useLiveQuery(
    () => db.appState.filter(a => a.key === 'isDialogOutputVisible').first().then(a => a?.value),
    [],
    false
  )

  useEffect(() => {
    if (isVisible && terminalComponentRef.current) {
      logger('[DialogOutput] calling fit and reloadStyles', isVisible, terminalComponentRef.current);
      terminalComponentRef.current.fit();
      terminalComponentRef.current.reloadStyles();
    }
  }, [isVisible, terminalComponentRef.current]);

  const handleToggleClick = async () => {
    await writeAppState('isDialogOutputVisible', !isVisible);
  }

  const handleCloseClick = async () => {
    await writeAppState('isDialogOutputVisible', false);
  }

  const handleClearClick = () => {
    // if (terminal) {
    //   terminal.clear();
    //   // Print a clear message to show the terminal is still active
    //   terminal.write('\x1b[1;34mTerminal cleared.\x1b[0m\r\n');
    // }
  }

  const handleSaveSnapshotClick = async () => {
    await WebContainerService.saveContainer()
  }

  return (
    <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 1000 }}>
      {/* Floating toggle button with indicator dot for new output */}
      <button
        onClick={handleToggleClick}
        className="bottom-4 right-4 z-50 flex items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all relative"
        aria-label="Toggle output console"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
        
        {/* Output indicator dot */}
        {/* {isOutputAvailable && !isVisible && (
          <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
        )} */}
      </button>

      {/* Output dialog */}
      {!!isVisible && (
        <div className={`fixed bottom-16 right-4 w-full max-w-2xl bg-gray-900 text-white border border-gray-700 rounded-md shadow-2xl overflow-hidden z-40 flex flex-col ${className}`}>
          <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
            <h3 className="text-sm font-medium text-white">Terminal</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveSnapshotClick}
                className="p-1 rounded hover:bg-gray-700 text-xs"
                aria-label="Save snapshot"
              >
                Save Snapshot
              </button>
              <button
                onClick={handleClearClick}
                className="p-1 rounded hover:bg-gray-700 text-xs"
                aria-label="Clear logs"
              >
                Clear
              </button>
              <button
                onClick={handleCloseClick}
                className="p-1 rounded hover:bg-gray-700"
                aria-label="Close output console"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <Terminal
            className={'h-full overflow-hidden'}
            onTerminalReady={(terminal) => {
              WebContainerService.attachTerminal(terminal)
            }}
            onTerminalResize={(cols, rows) => {
              WebContainerService.onTerminalResize(cols, rows)
            }}
            ref={(ref) => {
              logger('[DialogOutput] setting terminalComponentRef.current to', ref);
              terminalComponentRef.current = ref;
            }}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
};

export default DialogOutput; 
