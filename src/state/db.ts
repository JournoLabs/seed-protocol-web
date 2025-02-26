import Dexie, { Table, }              from 'dexie'
import { AppStateKey,  }    from '../helpers/constants'
import { writeAppState, }             from '../helpers/appState'
import { useLiveQuery, }              from 'dexie-react-hooks'



export interface BaseRecord {
  createdAt?: number
  updatedAt?: number
}

export interface AppState extends BaseRecord {
  id?: string
  key: string
  value: string | boolean | number | string[] | Record<string, unknown> | Record<string, unknown>[]
}

export class SeedProtocolWebDb extends Dexie {
  appState!: Table<AppState>

  constructor () {
    super('SeedProtocolWeb',)
    this.version(1,).stores({
      appState                : '++id, key, value, createdAt, updatedAt', // Primary key and indexed props
    },)
  }
}

export const db = new SeedProtocolWebDb()

export const getDb = (): SeedProtocolWebDb => {
  return db
}



export const dbInit = async (): Promise<SeedProtocolWebDb> => {
  if (typeof window === 'undefined') {
    return db
  }
  console.log('called dbInit',)
  await db.open()

  await writeAppState(AppStateKey.DbReady, false,)

  await db.transaction('rw', [ db.appState, ], async () => {
    await writeAppState('addresses', [],)
  },)

  await writeAppState(AppStateKey.DbReady, true,)

  return db
}

export const useIsDbReady = () => {
  const isDbReady = useLiveQuery(
    () => db.appState.where(
      { key : AppStateKey.DbReady, },
    ).first().then(
      (appState,) => appState && appState.value ? appState.value as boolean : false,
    ),
  )

  return isDbReady
}
