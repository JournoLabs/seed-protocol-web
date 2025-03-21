import { useState, useEffect, useCallback, useMemo } from 'react';
import { eventEmitter } from './events';
import debug from 'debug'

const logger = debug('seedWeb:helpers:useWebContainerOutput')

interface OutputData {
  content?: string;
  process?: string;
  timestamp?: number;
}

interface UseWebContainerOutputReturn {
  outputLogs: string[];
  clearLogs: () => void;
  writableStream: WritableStream<unknown>;
  isOutputAvailable: boolean;
  subscribe: (callback: OutputSubscriber) => { unsubscribe: () => void };
}

type OutputSubscriber = (text: string) => void;

// Set up a global store for our output logs
let outputLogs: string[] = [];
let outputSubscribers: OutputSubscriber[] = [];
let isOutputAvailable = false;

// Helper function to pipe a process's output streams to a WritableStream
export const pipeProcessToStream = async (
  process: { stdout: ReadableStream<Uint8Array>; stderr: ReadableStream<Uint8Array> },
  outputStream: WritableStream<unknown>
) => {
  const stdoutReader = process.stdout.getReader();
  const stderrReader = process.stderr.getReader();
  const writer = outputStream.getWriter();

  // Function to read from a reader and write to our output stream
  const readAndWrite = async (reader: ReadableStreamDefaultReader<Uint8Array>, isStderr = false) => {
    let done: boolean | undefined, value: Uint8Array | undefined;
    try {
      while (({ done, value } = await reader.read()), !done) {
        if (value) {
          await writer.write({ 
            [isStderr ? 'stderr' : 'stdout']: value 
          });
        }
      }
    } catch (error) {
      console.error(`Error reading from ${isStderr ? 'stderr' : 'stdout'}:`, error);
    } finally {
      reader.releaseLock();
    }
  };

  // Start reading from both streams
  await Promise.all([
    readAndWrite(stdoutReader),
    readAndWrite(stderrReader, true)
  ]);

  writer.releaseLock();
};

/**
 * A hook that provides a writable stream for WebContainer process output
 * and manages the collection of output logs.
 */
export const useWebContainerOutput = (): UseWebContainerOutputReturn => {
  const [logs, setLogs] = useState<string[]>(outputLogs);
  const [outputFlag, setOutputFlag] = useState<boolean>(isOutputAvailable);

  // Create a writable stream for process output
  const writableStream = useMemo(() => {
    return new WritableStream({
      write(chunk) {
        const textDecoder = new TextDecoder();
        let text = '';
        
        if (chunk && typeof chunk === 'object') {
          if ('stdout' in chunk && chunk.stdout) {
            text = typeof chunk.stdout === 'string' 
              ? chunk.stdout 
              : textDecoder.decode(chunk.stdout as BufferSource);
          } else if ('stderr' in chunk && chunk.stderr) {
            // We might want to color stderr differently
            text = typeof chunk.stderr === 'string'
              ? chunk.stderr
              : textDecoder.decode(chunk.stderr as BufferSource);
          }
        } else if (typeof chunk === 'string') {
          text = chunk;
        }
        
        if (text) {
          outputLogs.push(text);
          isOutputAvailable = true;
          
          // Notify subscribers
          outputSubscribers.forEach(subscriber => subscriber(text));
          
          // Update component state
          setLogs([...outputLogs]);
          setOutputFlag(true);
        }
      }
    });
  }, []);

  // Set up listeners for process output events
  useEffect(() => {
    const handleOutput = (data: string | OutputData) => {
      
      if (typeof data === 'string') {
        // Handle the case where data is just a string
        const newLog = data;
        outputLogs.push(newLog);
        isOutputAvailable = true;
        
        // Update state
        setLogs([...outputLogs]);
        setOutputFlag(true);
        
        // Notify subscribers
        outputSubscribers.forEach(subscriber => subscriber(newLog));
      } else if (data && typeof data === 'object') {
        // Handle the case where data is an object with process/content fields
        const newLog = data.content || JSON.stringify(data);
        outputLogs.push(newLog);
        isOutputAvailable = true;
        
        // Update state
        setLogs([...outputLogs]);
        setOutputFlag(true);

        
        // Notify subscribers
        outputSubscribers.forEach((subscriber) => subscriber(newLog));
      }
    };

    // Listen to output from any process
    eventEmitter.on('process-output', handleOutput);
    
    // Custom handler for general output that might not be a process
    eventEmitter.on('output', handleOutput);

    return () => {
      eventEmitter.off('process-output', handleOutput);
      eventEmitter.off('output', handleOutput);
    };
  }, []);

  // Function to clear logs
  const clearLogs = useCallback(() => {
    outputLogs = [];
    isOutputAvailable = false;
    setLogs([]);
    setOutputFlag(false);
  }, []);

  // Function to subscribe to log updates
  const subscribe = useCallback((callback: OutputSubscriber) => {
    outputSubscribers.push(callback);

    
    // Send existing logs to the new subscriber
    outputLogs.forEach((log) => {
      callback(log)
    });
    
    return {
      unsubscribe: () => {
        outputSubscribers = outputSubscribers.filter((sub) => sub !== callback);
      }
    };
  }, []);

  return {
    outputLogs: logs,
    isOutputAvailable: outputFlag,
    clearLogs,
    writableStream,
    subscribe,
  };
};

export default useWebContainerOutput; 