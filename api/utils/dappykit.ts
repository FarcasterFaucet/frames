import { kvGetDelegatedAddress, kvGetMnemonic, kvGetProof } from './kv.js'
import dappykit from '@dappykit/sdk'
import { IGeneralResponse } from '@dappykit/sdk/dist/src/farcaster-client/index.js'

const { ViemUtils, Utils } = dappykit
const { mnemonicToAccount } = ViemUtils
const { accountToSigner } = Utils.Signer
const { SDK } = dappykit

export async function dappySaveData(
  dappyKit: InstanceType<typeof SDK>,
  appAddress: string,
  userMainAddress: string,
  data: string,
): Promise<IGeneralResponse> {
  const delegatedAddress = await kvGetDelegatedAddress(userMainAddress)

  if (delegatedAddress) {
    const mnemonic = await kvGetMnemonic(delegatedAddress)
    const proof = await kvGetProof(delegatedAddress)

    if (mnemonic && proof) {
      const appSigner = accountToSigner(mnemonicToAccount(mnemonic))

      return dappyKit.farcasterClient.saveUserAppData(userMainAddress, appAddress, data, proof, appSigner)
    } else {
      throw new Error('Mnemonic or proof not found')
    }
  } else {
    throw new Error('Delegated address not found')
  }
}
