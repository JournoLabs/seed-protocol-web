#!/usr/bin/env node
import { snapshot } from '@webcontainer/snapshot'
import * as fs from 'fs'
import * as path from 'path'

const createSnapshots = async (): Promise<void> => {
  console.log('Creating snapshots...')

  const dotSeedPath = path.join(process.cwd(), '.seed')
  const containerPath = path.join(process.cwd(), 'container')

  console.log('dotSeedPath', dotSeedPath)

  const dotSeedDir = await snapshot(dotSeedPath)

  const containerDir = await snapshot(containerPath)

  const appFilesPath = path.join(process.cwd(), 'public',)

  const dotSeedTargetPath = path.join(appFilesPath, 'seed-folder-snapshot')
  const containerTargetPath = path.join(appFilesPath, 'container-folder-snapshot')
  if (fs.existsSync(dotSeedTargetPath)) {
    fs.rmSync(dotSeedTargetPath)
  }

  fs.writeFileSync(dotSeedTargetPath, dotSeedDir,)

  if (fs.existsSync(containerTargetPath)) {
    fs.rmSync(containerTargetPath)
  }

  fs.writeFileSync(containerTargetPath, containerDir,)

  console.log('Snapshots created')

}

const calledFrom = path.basename(process.argv[1])

if (calledFrom === 'seed-cli.ts') {
  try {
    createSnapshots()
      .then(() => {
        console.log('Snapshot creation complete')
      }).catch(
      (e) => {
        console.error(e)
      },
    )
  } catch ( err ) {
    console.error(err)
  }
}
