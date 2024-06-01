import { prepareEthAddress } from './eth.js'
import { kv } from '@vercel/kv'
import { Env, FrameContext } from 'frog'

export type KvContext = Env | FrameContext

const namespace = process.env.KV_NAMESPACE || 'default'

/**
 * Put data to MainToDelegated KV
 * @param key Key
 * @param value Value
 */
export async function kvPutMainToDelegated(key: string, value: string): Promise<void> {
  await kv.set(`mtd_${namespace}_${key}`, value)
}

/**
 * Delete data from MainToDelegated KV
 * @param key Key
 */
export async function kvDeleteMainToDelegated(key: string): Promise<void> {
  await kv.del(`mtd_${namespace}_${key}`)
}

/**
 * Get data from MainToDelegated KV
 * @param key Key
 */
export async function kvGetMainToDelegated(key: string): Promise<string | null> {
  return kv.get(`mtd_${namespace}_${key}`)
}

/**
 * Put data to DelegatedToPk KV
 * @param key Key
 * @param value Value
 */
export async function kvPutDelegatedToPk(key: string, value: string): Promise<void> {
  await kv.set(`dpk_${namespace}_${key}`, value)
}

/**
 * Delete data from DelegatedToPk KV
 * @param key Key
 */
export async function kvDeleteDelegatedToPk(key: string): Promise<void> {
  await kv.del(`dpk_${namespace}_${key}`)
}

/**
 * Get data from DelegatedToPk KV
 * @param key Key
 */
export async function kvGetDelegatedToPk(key: string): Promise<string | null> {
  return kv.get(`dpk_${namespace}_${key}`)
}

/**
 * Put mnemonic to DelegatedToPk KV tied to user delegated address
 * @param userDelegatedAddress User delegated address
 * @param mnemonic Mnemonic
 */
export async function kvPutMnemonic(userDelegatedAddress: string, mnemonic: string): Promise<void> {
  await kvPutDelegatedToPk(prepareEthAddress(userDelegatedAddress), mnemonic)
}

/**
 * Get mnemonic from DelegatedToPk KV tied to user delegated address
 * @param userDelegatedAddress User delegated address
 */
export async function kvGetMnemonic(userDelegatedAddress: string): Promise<string | null> {
  return kvGetDelegatedToPk(prepareEthAddress(userDelegatedAddress))
}

/**
 * Put proof to MainToDelegated KV tied to user delegated address
 * @param userDelegatedAddress User delegated address
 * @param proof Proof
 */
export async function kvPutProof(userDelegatedAddress: string, proof: string): Promise<void> {
  await kvPutDelegatedToPk(`${prepareEthAddress(userDelegatedAddress)}_proof`, proof)
}

/**
 * Get proof from MainToDelegated KV tied to user delegated address
 * @param userDelegatedAddress User delegated address
 */
export async function kvGetProof(userDelegatedAddress: string): Promise<string | null> {
  return kvGetDelegatedToPk(`${prepareEthAddress(userDelegatedAddress)}_proof`)
}

/**
 * Delete proof from MainToDelegated KV tied to user delegated address
 * @param userDelegatedAddress User delegated address
 */
export async function kvDeleteProof(userDelegatedAddress: string): Promise<void> {
  await kvDeleteDelegatedToPk(`${prepareEthAddress(userDelegatedAddress)}_proof`)
}

/**
 * Get actual delegated address by main address
 * @param userMainAddress User main address
 */
export async function kvGetDelegatedAddress(userMainAddress: string): Promise<string | null> {
  return kvGetMainToDelegated(prepareEthAddress(userMainAddress))
}

/**
 * Put the link between main and delegated addresses.
 *
 * Use it on the webhook side to connect the user's main address with the delegated address.
 * @param userMainAddress User main address
 * @param userDelegatedAddress User delegated address
 */
export async function kvPutDelegatedAddress(userMainAddress: string, userDelegatedAddress: string): Promise<void> {
  await kvPutMainToDelegated(
    prepareEthAddress(userMainAddress),
    userDelegatedAddress ? prepareEthAddress(userDelegatedAddress) : userDelegatedAddress,
  )
}
