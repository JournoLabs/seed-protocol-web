import * as config from '../schema'
import { client as seedClient } from '@seedprotocol/sdk'


(async () => {
  const addresses = import.meta.env.VITE_PERSONAL_WALLET_ADDRESSES.split(',')
  await seedClient.init({ config, addresses })
  console.log('seedClient', seedClient)
})();

export const getClient = () => seedClient
