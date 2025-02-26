import React, { useState, useEffect } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FolderOpenIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// Register TypeScript/TSX language for the syntax highlighter
SyntaxHighlighter.registerLanguage('tsx', tsx);

interface FileViewerProps {
  initialPath?: string;
  className?: string;
}

const CodeFileViewer: React.FC<FileViewerProps> = ({ initialPath, className = '' }) => {
  const [filePath, setFilePath] = useState<string>(initialPath || '');
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);

  // Function to get access to the OPFS root directory
  const getOPFSRoot = async () => {
    try {
      // Access the root directory of the origin private file system
      return await navigator.storage.getDirectory();
    } catch (err) {
      setError('Failed to access OPFS: ' + (err instanceof Error ? err.message : String(err)));
      return null;
    }
  };

  // Load available TypeScript files from OPFS
  const loadAvailableFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const root = await getOPFSRoot();
      if (!root) return;
      
      // This is a simplified approach - in a real app, you'd want to recursively scan directories
      const files: string[] = [];
      
      // Use FileSystemDirectoryHandle.entries() to iterate through files and directories
      for await (const [name, handle] of root.entries()) {
        if (handle.kind === 'file' && (name.endsWith('.ts') || name.endsWith('.tsx'))) {
          files.push(name);
        }
      }
      
      setAvailableFiles(files);
    } catch (err) {
      setError('Failed to load file list: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Load file content from OPFS
  const loadFileContent = async (path: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const root = await getOPFSRoot();
      if (!root) return;
      
      // Get file handle
      const fileHandle = await root.getFileHandle(path);
      
      // Get file content
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      setFileContent(content);
      setFilePath(path);
    } catch (err) {
      setError('Failed to load file: ' + (err instanceof Error ? err.message : String(err)));
      setFileContent('');
    } finally {
      setIsLoading(false);
    }
  };

  // Load available files when component mounts
  useEffect(() => {
    loadAvailableFiles();
  }, []);

  // Load initial file if provided
  useEffect(() => {
    if (initialPath) {
      loadFileContent(initialPath);
    }
  }, [initialPath]);

  return (
    <div className={`bg-gray-50 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-700 truncate">
            {filePath || 'Select a TypeScript file'}
          </h2>
        </div>
        
        <div className="relative">
          <select
            value={filePath}
            onChange={(e) => loadFileContent(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select a file</option>
            {availableFiles.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
          <button 
            onClick={loadAvailableFiles}
            className="absolute inset-y-0 right-0 px-2 flex items-center"
            title="Refresh file list"
          >
            <FolderOpenIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="p-1 bg-gray-800 overflow-auto max-h-[70vh]">
        {isLoading ? (
          <div className="flex justify-center items-center p-6 text-gray-400">
            <svg className="animate-spin h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : !fileContent ? (
          <div className="p-4 text-gray-300 text-center">
            Select a TypeScript file to view its contents
          </div>
        ) : (
          <SyntaxHighlighter
            language="tsx"
            style={oneDark}
            customStyle={{ margin: 0, borderRadius: '0.25rem' }}
            showLineNumbers={true}
          >
            {fileContent}
          </SyntaxHighlighter>
        )}
      </div>
      
      <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex justify-between">
        <span className="text-xs text-gray-500">
          {fileContent ? `${fileContent.split('\n').length} lines` : '0 lines'}
        </span>
        <span className="text-xs text-gray-500">TypeScript</span>
      </div>
    </div>
  );
};

export default CodeFileViewer;