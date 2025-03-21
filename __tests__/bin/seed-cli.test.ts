import { describe, it, vi, beforeEach, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { snapshot } from '@webcontainer/snapshot';

// Importing the script to test
import '../seed-cli'; // Adjust the relative path according to your project structure


describe('seed-cli Tests', () => {

  beforeEach(() => {

  });

  it('should create snapshots correctly', async () => {

    // Dynamically import the function to create snapshots
    const { createSnapshots } = await import('../seed-cli');

    await createSnapshots();

    // Assert that snapshot was called with correct paths
    expect(mockSnapshot).toHaveBeenCalledWith('/mock/project/.seed');
    expect(mockSnapshot).toHaveBeenCalledWith('/mock/project/container');

    // Verify writeFileSync was called with correct arguments
    const appFilesPath = path.join(processCwd, 'public');
    const dotSeedTargetPath = path.join(appFilesPath, 'seed-folder-snapshot');
    const containerTargetPath = path.join(appFilesPath, 'container-folder-snapshot');

    expect(fs.writeFileSync).toHaveBeenCalledWith(dotSeedTargetPath, 'mockSnapshotData');
    expect(fs.writeFileSync).toHaveBeenCalledWith(containerTargetPath, 'mockSnapshotData');

    // Verify console outputs
    expect(mockConsoleLog).toHaveBeenCalledWith('Creating snapshots...');
    expect(mockConsoleLog).toHaveBeenCalledWith('Snapshots created');
  });

  it('should remove existing snapshots correctly', async () => {
    const mockSnapshot = vi.fn().mockResolvedValue('mockSnapshotData');
    vi.mocked(snapshot).mockImplementation(mockSnapshot);

    fs.existsSync.mockImplementation((p) => true); // Mock existing files
    fs.rmSync.mockImplementation(() => {}); // Mock remove operation
    fs.writeFileSync.mockImplementation(() => {}); // Mock write operation

    const { createSnapshots } = await import('../seed-cli');

    await createSnapshots();

    // Verify rmSync was called to remove existing files
    const appFilesPath = path.join(processCwd, 'public');
    const dotSeedTargetPath = path.join(appFilesPath, 'seed-folder-snapshot');
    const containerTargetPath = path.join(appFilesPath, 'container-folder-snapshot');

    expect(fs.rmSync).toHaveBeenCalledWith(dotSeedTargetPath);
    expect(fs.rmSync).toHaveBeenCalledWith(containerTargetPath);

    // Verify writeFileSync calls after removal
    expect(fs.writeFileSync).toHaveBeenCalledWith(dotSeedTargetPath, 'mockSnapshotData');
    expect(fs.writeFileSync).toHaveBeenCalledWith(containerTargetPath, 'mockSnapshotData');
  });

  it('should handle errors during snapshot creation gracefully', async () => {
    const mockSnapshot = vi.fn().mockRejectedValue(new Error('Snapshot failed'));
    vi.mocked(snapshot).mockImplementation(mockSnapshot);

    const { createSnapshots } = await import('../seed-cli');

    let errorCaught = false;
    try {
      await createSnapshots();
    } catch (e) {
      errorCaught = true;
    }

    expect(errorCaught).toBe(false); // Errors should be caught inside function
    expect(mockConsoleError).toHaveBeenCalledWith(new Error('Snapshot failed'));
  });
});
