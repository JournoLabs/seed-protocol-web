import { getDb } from "../state/db"

export const writeAppState = async ( key, value,) => {
  const db = getDb()

  try {
    await db.transaction('rw', [ db.appState, ], async () => {
      const allExisting = await db.appState
        .where({ key, },)
        .reverse()
        .sortBy('updatedAt',)

      if (allExisting.length > 1) {
        await db.appState.bulkDelete(allExisting.slice(1,).map((item,) => item.id,),)
      }
      let existing

      if (allExisting.length > 0) {
        existing = allExisting[0]
      }

      if (existing) {
        await db.appState.update(existing, {
          value,
          updatedAt : new Date(),
        },)
      } else {
        await db.appState.add({
          key,
          value,
          updatedAt : new Date().getTime(),
          createdAt : new Date().getTime(),
        },)
      }

    },)

  } catch ( err ) {
    console.error('Error writing app state:', err)
  }


}