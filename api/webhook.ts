import dappykit from '@dappykit/sdk'
import {
  kvDeleteDelegatedToPk,
  kvDeleteMainToDelegated,
  kvGetMnemonic,
  kvPutDelegatedAddress,
  kvPutProof,
} from './utils/kv.js'
import { VercelRequest, VercelResponse } from '@vercel/node'

const { SDK, Config } = dappykit
const { ViemUtils } = dappykit
const { privateKeyToAccount } = ViemUtils

export interface ICallbackResult {
  success: boolean
  requestId: number
  userMainAddress: string
  userDelegatedAddress: string
  applicationAddress: string
  proof: string
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'POST') {
    // dummy mnemonic
    const dappyKit = new SDK(
      Config.optimismMainnetConfig,
      'focus drama print win destroy venue term alter cheese retreat office cannon',
    )
    const appPk = process.env.APP_PK as `0x${string}`
    const authServiceAddress = process.env.AUTH_SERVICE_ADDRESS || '0x5c15F64324206854eFEFabcee15f79e9F4bec590'

    if (!appPk || !authServiceAddress) {
      const error = 'Environment variables are not set properly.'
      console.error(error) // eslint-disable-line no-console
      response.status(500).json({ error })

      return
    }

    const appAddress = privateKeyToAccount(appPk).address

    try {
      const body = request.body as ICallbackResult
      await dappyKit.farcasterClient.checkCallbackData(body, appAddress, authServiceAddress)

      if (!body?.success) {
        console.log('Callback is not success. Deleting stored data.') // eslint-disable-line no-console
        await kvDeleteMainToDelegated(body.userMainAddress)
        await kvDeleteDelegatedToPk(body.userDelegatedAddress)
        response.status(200).json({ result: true })

        return
      }

      // if mnemonic is already stored than we can create a connection between main and delegated addresses
      if (await kvGetMnemonic(body.userDelegatedAddress)) {
        await kvPutDelegatedAddress(body.userMainAddress, body.userDelegatedAddress)
        await kvPutProof(body.userDelegatedAddress, body.proof)
      }

      response.status(200).json({ result: true })
    } catch (e) {
      const error = (e as Error).message
      console.error('Error', error) // eslint-disable-line no-console
      response.status(400).json({ error })
    }
  } else {
    response.setHeader('Allow', ['POST'])
    response.writeHead(302, { Location: 'https://dappykit.org/?source=frog-vercel-webhook' })
    response.end()
  }
}
