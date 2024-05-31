import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'

import { registerUser } from './lib/farcaster.js'

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' }),
})

app.frame('/', (c) => {
  const { status } = c
  return c.res({
    action: '/finish',
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
          Faucet
      </div>
    ),
    intents: [
      <Button.Transaction target="register">Register</Button.Transaction>
    ],
  })
})

app.frame('/finish', (c) => {
  const { transactionId } = c
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Transaction ID: {transactionId}
      </div>
    )
  })
})

 
app.transaction('register', (c) => {
  if (!c.frameData?.fid) {
    return //throw error

  }
  return registerUser(c.contract, c.frameData?.fid)
})

app.use('/*', serveStatic({ root: './public' }))
devtools(app, { serveStatic })

if (typeof Bun !== 'undefined') {
  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  })
  console.log('Server is running on port 3000')
}
