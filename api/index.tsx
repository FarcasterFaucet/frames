import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { handle } from 'frog/vercel'

import { BORDER_SIMPLE, BORDER_SUCCESS, Box, Heading, Text, vars, VStack } from './utils/style.js'
import { getCurrentPeriodPayout, getNextPeriodStart, getUserStatus } from './utils/faucet.js'
import { DECIMALS, FAUCET_CONTRACT_ADDRESS, OP_CHAIN_ID } from './utils/constants.js'
import { formatTime } from './utils/time.js'
import { faucetABI } from './utils/abis.js'

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  browserLocation: '/',
  ui: { vars },
})

app.frame('/', c => {
  // const { appTitle } = await configureApp(app, c, 'appAuthUrl')

  const intents = [
    <Button action="/checkClaim">💧 Start</Button>,
    <Button.Link href="https://github.com/FarcasterFaucet/frames">How it works❓</Button.Link>,
  ]

  return c.res({
    image: (
      <Box grow alignVertical="center" backgroundColor="white" padding="32" border={BORDER_SIMPLE}>
        <VStack gap="4">
          <Heading color="h1Text" align="center" size="48">
            F😠😫🤕 Faucet
          </Heading>

          <Text align="center" size="20">
            Join the excitement at ETHPrague 🇨🇿 with F😠😫🤕 the token that looks beyond venture capital distributions
          </Text>
        </VStack>
      </Box>
    ),
    intents,
  })
})

app.frame('/checkClaim', async c => {
  // Fetch if user is registered
  const { fid } = c.frameData || {}
  if (!fid) {
    return c.error({ message: 'No fid' }) // TODO: update message error
  }

  const { canClaim, registeredNextPeriod } = await getUserStatus(fid)

  const payout = await getCurrentPeriodPayout()
  const nextPeriodStart = await getNextPeriodStart()

  // Calculate time left to claim
  const currentTimeInSeconds = BigInt(Date.now()) / 1000n
  const claimBefore = nextPeriodStart - currentTimeInSeconds - 1n

  const claimIn = nextPeriodStart - currentTimeInSeconds

  // Format payout
  const formattedPayout = (BigInt(payout) / BigInt(10 ** DECIMALS)).toString()

  const intents = [
    (canClaim || !registeredNextPeriod) && (
      <Button.Transaction target="/claimAndOrRegister">{canClaim ? 'Claim' : 'Register'}</Button.Transaction>
    ),
    <Button.Reset>🏠 Home</Button.Reset>,
  ]

  return c.res({
    action: canClaim ? '/claimed' : '/registered',
    image: (
      <Box
        grow
        alignVertical="center"
        backgroundColor="white"
        padding="32"
        border={canClaim ? BORDER_SUCCESS : BORDER_SIMPLE}
      >
        {canClaim ? (
          <VStack gap="4">
            <Heading color="h1Text" align="center" size="32">
              You can now claim {formattedPayout} F😠😫🤕 tokens!
            </Heading>
            <Text align="center" size="20">
              Next period in {formatTime(Number(claimBefore))}
            </Text>
          </VStack>
        ) : registeredNextPeriod ? (
          <Heading color="h1Text" align="center" size="32">
            Can claim in {formatTime(Number(claimIn))}
          </Heading>
        ) : (
          <Heading color="h1Text" align="center" size="32">
            Register for next period ⏰
          </Heading>
        )}
      </Box>
    ),
    intents,
  })
})

app.transaction('claimAndOrRegister', (c: any) => {
  if (!c.frameData?.fid) {
    return //throw error
  }

  return c.contract({
    abi: faucetABI,
    chainId: `eip155:${OP_CHAIN_ID}`,
    functionName: 'claimAndOrRegister',
    args: [],
    to: FAUCET_CONTRACT_ADDRESS,
  })
})

app.frame('/registered', async c => {
  const { transactionId } = c

  const intents = [
    <Button.Reset>Done!</Button.Reset>,
    <Button.Link href={`https://optimistic.etherscan.io/tx/${transactionId}`}>View Tx</Button.Link>,
  ]

  return c.res({
    image: (
      <Box grow alignVertical="center" backgroundColor="white" padding="32" border={BORDER_SIMPLE}>
        <VStack gap="4">
          <Heading color="h1Text" align="center" size="32">
            Registered successfuly!
          </Heading>
        </VStack>
      </Box>
    ),
    intents,
  })
})

app.frame('/claimed', async c => {
  const { transactionId } = c
  const intents = [
    <Button.Reset>Done!</Button.Reset>,
    <Button.Link href={`https://optimistic.etherscan.io/tx/${transactionId}`}>View Tx</Button.Link>,
  ]

  return c.res({
    image: (
      <Box grow alignVertical="center" backgroundColor="white" padding="32" border={BORDER_SIMPLE}>
        <VStack gap="4">
          <Heading color="h1Text" align="center" size="32">
            Claimed successfuly!
          </Heading>
        </VStack>
      </Box>
    ),
    intents,
  })
})

// @ts-ignore Vercel info
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'

console.log('isProduction', isProduction) // eslint-disable-line no-console

if (!isProduction) {
  devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })
}

export const GET = handle(app)
export const POST = handle(app)
