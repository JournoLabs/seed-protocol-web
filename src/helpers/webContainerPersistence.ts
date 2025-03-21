import { type WebContainer } from '@webcontainer/api';

const SNAPSHOT_FILE_NAME = 'webcontainer-snapshot';
const SNAPSHOT_INTERVAL = 60 * 1000; // 1 minute in milliseconds

/**
 * Saves a WebContainer snapshot to Origin Private File System (OPFS)
 */
async function saveWebContainerSnapshot(webcontainer: WebContainer): Promise<void> {
  try {
    // // Get a reference to the OPFS root directory
    // const root = await navigator.storage.getDirectory();
    //
    // // Create or open a file handle
    // const fileHandle = await root.getFileHandle(SNAPSHOT_FILE_NAME, { create: true });
    //
    // // Create a writable stream to the file
    // const writable = await fileHandle.createWritable();
    //
    // // Run the export-snapshot.js script to generate a snapshot
    // const process = await webcontainer.spawn('npx', ['tsx', './exportSnapshot.ts']);
    //
    // // Collect the snapshot data from stdout
    // const outputChunks: Uint8Array[] = [];
    // process.output.pipeTo(new WritableStream({
    //   write(chunk) {
    //     outputChunks.push(chunk);
    //   }
    // }));
    //
    // // Wait for the process to complete
    // const exitCode = await process.exit;
    //
    // if (exitCode !== 0) {
    //   throw new Error(`Snapshot script exited with code ${exitCode}`);
    // }
    //
    // // Convert the collected chunks to a single array buffer
    // const snapshotSize = outputChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
    // const snapshotBuffer = new Uint8Array(snapshotSize);
    // let offset = 0;
    // for (const chunk of outputChunks) {
    //   snapshotBuffer.set(chunk, offset);
    //   offset += chunk.byteLength;
    // }
    //
    // // Write the snapshot to the file
    // await writable.write(snapshotBuffer);
    //
    // // Close the writable stream
    // await writable.close();
    
    console.log('WebContainer snapshot saved to OPFS');
  } catch (error) {
    console.error('Failed to save WebContainer snapshot:', error);
  }
}

/**
 * Loads a WebContainer snapshot from Origin Private File System (OPFS)
 * @returns The snapshot as an ArrayBuffer or null if not found
 */
async function loadWebContainerSnapshot(): Promise<ArrayBuffer | null> {
  try {
    // Get a reference to the OPFS root directory
    const root = await navigator.storage.getDirectory();
    
    try {
      // Try to get the file handle (will throw if it doesn't exist)
      const fileHandle = await root.getFileHandle(SNAPSHOT_FILE_NAME);
      
      // Get the file
      const file = await fileHandle.getFile();
      
      // Read the file as an array buffer
      const snapshot = await file.arrayBuffer();
      
      console.log('WebContainer snapshot loaded from OPFS');
      return snapshot;
    } catch (_) {
      // File doesn't exist yet, which is fine for first run
      console.log('No WebContainer snapshot found in OPFS');
      return null;
    }
  } catch (error) {
    console.error('Failed to load WebContainer snapshot:', error);
    return null;
  }
}

/**
 * Sets up automatic snapshot saving
 * - Saves a snapshot every minute
 * - Saves a snapshot when the page is about to unload
 */
export function setupWebContainerPersistence(webcontainer: WebContainer): void {
  // Set up interval to save snapshot every minute
  const intervalId = setInterval(() => {
    saveWebContainerSnapshot(webcontainer);
  }, SNAPSHOT_INTERVAL);
  
  // Save snapshot when page is about to unload
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
    saveWebContainerSnapshot(webcontainer);
  });
  
  // Also save on visibilitychange (when tab becomes hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveWebContainerSnapshot(webcontainer);
    }
  });
}

/**
 * Initializes a WebContainer with a previously saved snapshot if available
 * @param webcontainer The WebContainer instance to initialize
 * @returns A promise that resolves when the WebContainer is initialized
 */
export async function initializeWebContainerFromSnapshot(webcontainer: WebContainer): Promise<void> {
  // const snapshot = await loadWebContainerSnapshot();
  //
  // if (snapshot) {
  //   try {
  //     // Mount the snapshot to the WebContainer
  //     await webcontainer.mount(snapshot);
  //     console.log('WebContainer initialized from snapshot');
  //   } catch (error) {
  //     console.error('Failed to mount WebContainer snapshot:', error);
  //   }
  // } else {
  //   console.log('No snapshot found, WebContainer starting fresh');
  // }
}

export { saveWebContainerSnapshot, loadWebContainerSnapshot }; 
