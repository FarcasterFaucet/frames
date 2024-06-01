// @ts-ignore DappyKit interface
import { ISigner } from '@dappykit/sdk/dist/src/service/delegated-fs/interfaces'
import dappykit from '@dappykit/sdk'
import { KvContext } from './kv.js'

const { ViemUtils, Utils } = dappykit
const { privateKeyToAccount } = ViemUtils
const { accountToSigner } = Utils.Signer

/**
 * Logs the click data.
 * @param signer Signer
 * @param clickData Click data
 */
async function clickLog(signer: ISigner, clickData: string): Promise<unknown> {
  const signature = await signer.signMessage(clickData)

  return (
    await fetch('https://api.clickcaster.xyz/v1/click/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clickData, signature }),
    })
  ).json()
}

/**
 * Logs the click data.
 * @param c KvContext
 * @param appPrivateKey Application private key
 */
export async function clickcasterLog(c: KvContext, appPrivateKey: `0x${string}`) {
  try {
    const signer = accountToSigner(privateKeyToAccount(appPrivateKey))
    // @ts-ignore Req exists
    const data = await c.req.json()
    const {
      trustedData: { messageBytes },
    } = data
    await clickLog(signer, messageBytes)
  } catch (e) {}
}
