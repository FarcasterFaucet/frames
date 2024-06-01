import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import dappykit from '@dappykit/sdk'
import { serveStatic } from 'frog/serve-static'
import { configureApp } from './utils/frame.js'
import { BORDER_FAIL, BORDER_SIMPLE, BORDER_SUCCESS, Box, Heading, Text, vars, VStack } from './utils/style.js'
import { handle } from 'frog/vercel'
import quizData from '../quiz.json' assert { type: 'json' }
import { Quiz } from './quiz/index.js'
import { kvGetDelegatedAddress, kvPutMnemonic } from './utils/kv.js'
import { dappySaveData } from './utils/dappykit.js'

const { ViemUtils, Utils } = dappykit
const { generateMnemonic, privateKeyToAccount, english, mnemonicToAccount } = ViemUtils
const { accountToSigner } = Utils.Signer

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  ui: { vars },
})

app.frame('/', async c => {
  const { appTitle } = await configureApp(app, c, 'appAuthUrl')

  const intents = [<Button action="/next">⭐ Start</Button>]

  return c.res({
    title: appTitle,
    image: (
      <Box grow alignVertical="center" backgroundColor="white" padding="32" border={BORDER_SIMPLE}>
        <VStack gap="4">
          <Heading color="h1Text" align="center" size="64">
            Quiz time!
          </Heading>

          <Text align="center" size="18">
            {quizData.shortDescription}
          </Text>
        </VStack>
      </Box>
    ),
    intents,
  })
})

app.frame('/next', async c => {
  const { appTitle, appShareUrl } = await configureApp(app, c)
  const buttonData = JSON.parse(c.buttonValue || '{}')
  const questionIndex = buttonData.qi ? Number(buttonData.qi) : 0
  const points = buttonData.p ? Number(buttonData.p) : 0
  const quiz = new Quiz(quizData, questionIndex, points)
  const isLastQuestion = questionIndex >= quiz.questions.length - 1
  const action = isLastQuestion ? '/result' : '/next'
  const message = encodeURIComponent(`🚀 Check out the Quiz!`)
  const buttonUrl = `https://warpcast.com/~/compose?text=${message}&embeds[]=${appShareUrl}`

  const answers = quiz.questions[questionIndex].answers.map((item, index) => ({
    text: item,
    index,
  }))
  const shuffled = answers.sort(() => Math.random() - 0.5)
  const intents = await Promise.all([
    ...shuffled.map(async item => {
      const newPoints = quiz.check(item.index).points
      const value = JSON.stringify({ qi: questionIndex + 1, p: newPoints })

      return (
        <Button value={value} action={action}>
          {item.text}
        </Button>
      )
    }),
    <Button.Link href={buttonUrl}>🔗 Share</Button.Link>,
  ])

  return c.res({
    title: appTitle,
    image: (
      <Box grow alignVertical="center" backgroundColor="white" padding="32" border={BORDER_SIMPLE}>
        <VStack gap="4">
          <Heading color="h1Text" align="center" size="64">
            {quiz.questions[questionIndex].question}
          </Heading>
          <Text align="center" size="18">
            Question: {questionIndex + 1}/{quiz.questions.length}
          </Text>
        </VStack>
      </Box>
    ),
    intents,
  })
})

app.frame('/result', async c => {
  const { appTitle, userMainAddress } = await configureApp(app, c)
  const buttonData = JSON.parse(c.buttonValue || '{}')
  const quiz = new Quiz(quizData)
  const points = buttonData.p ? Number(buttonData.p) : 0
  const pointsText = `${points.toString()} of ${quiz.questions.length}`
  const isWin = points === quiz.questions.length
  const resultText = isWin ? "That's right! Well done!" : 'You can do better!'
  const userDelegatedAddress = await kvGetDelegatedAddress(userMainAddress)
  const intents = [<Button action="/">🔁 Again</Button>]

  if (!isWin) {
    // if user authorized navigate to answers, if not direct to authorize
    intents.push(<Button action={userDelegatedAddress ? '/answers' : '/authorize'}>🙋 Answers</Button>)
  }

  intents.push(<Button.Link href="https://hack.dappykit.org/?source=quiz-template">🔴 Win Tokens</Button.Link>)

  return c.res({
    title: appTitle,
    image: (
      <Box
        grow
        alignVertical="center"
        backgroundColor="white"
        padding="32"
        border={isWin ? BORDER_SUCCESS : BORDER_FAIL}
      >
        <VStack gap="4">
          <Heading color="h1Text" align="center" size="48">
            {resultText}
          </Heading>
          <Text align="center" size="24">
            Correct answers: {pointsText}
          </Text>
        </VStack>
      </Box>
    ),
    intents,
  })
})

/**
 * Checks that user already authorized the app and shows him the button to show the answers.
 *
 * Cases when executed:
 * 1. User clicks to show answers the first time. Should create Auth Request.
 * 2. User already sends Auth Request and is waiting for the answer.
 */
app.frame('/authorize', async c => {
  const { appTitle, userMainAddress, appAuthUrl, appPk, dappyKit, messageBytes, appAddress } = await configureApp(
    app,
    c,
  )
  const userDelegatedAddress = await kvGetDelegatedAddress(userMainAddress)
  const isCheckStatus = c.buttonValue === 'check-status'
  let intents = []
  let text = ''
  let errorText = ''
  let response

  if (userDelegatedAddress) {
    text = '✅ The application is authorized! You can view the answers.'
    intents = [<Button action={'/answers'}>🙋 Answers</Button>]
    try {
      await dappySaveData(dappyKit, appAddress, userMainAddress, 'I was here!')
    } catch (e) {
      /* ignore */
    }
  } else {
    if (isCheckStatus) {
      text = `⏳ Waiting...`
      intents = [
        <Button value="check-status" action="/authorize">
          🔁 Check Status
        </Button>,
        <Button.Reset>🏠 Home</Button.Reset>,
      ]
    } else {
      try {
        const appSigner = accountToSigner(privateKeyToAccount(appPk))
        const userDelegatedMnemonic = generateMnemonic(english)
        const userDelegatedWallet = mnemonicToAccount(userDelegatedMnemonic)
        response = await dappyKit.farcasterClient.createAuthRequest(
          messageBytes,
          userDelegatedWallet.address,
          appSigner,
        )

        if (response.status !== 'ok') {
          throw new Error(`Invalid auth response status. ${JSON.stringify(response)}`)
        }

        await kvPutMnemonic(userDelegatedWallet.address, userDelegatedMnemonic)
      } catch (e) {
        const error = (e as Error).message
        console.log('Auth request error', error) // eslint-disable-line no-console
        errorText = `Error: ${error}`
      }

      text = `⚠️To view the answers, click "Authorize" and enter the number ${response?.answer}.`
      intents = [
        <Button.Link href={appAuthUrl}>🐙 Authorize</Button.Link>,
        <Button value="check-status" action="/authorize">
          🔁 Check Status
        </Button>,
      ]
    }
  }

  return c.res({
    title: appTitle,
    image: (
      <Box grow alignVertical="center" backgroundColor="white" padding="32" border={BORDER_SIMPLE}>
        <VStack gap="4">
          <Heading color="h1Text" align="center" size="48">
            {errorText && 'Error'}
            {!errorText && text}
          </Heading>

          <Text align="center" size="18">
            {errorText && `Error: ${errorText}`}
          </Text>
        </VStack>
      </Box>
    ),
    intents,
  })
})

app.frame('/answers', async c => {
  const { appTitle } = await configureApp(app, c)
  const questionIndex = c.buttonValue ? Number(c.buttonValue) : 0
  const quiz = new Quiz(quizData, questionIndex)
  const isLastQuestion = questionIndex >= quiz.questions.length - 1
  const intents = []

  if (isLastQuestion) {
    intents.push(<Button action="/">🏠 Home</Button>)
  } else {
    intents.push(
      <Button value={(questionIndex + 1).toString()} action="/answers">
        👉 Next
      </Button>,
    )
  }

  return c.res({
    title: appTitle,
    image: (
      <Box grow alignVertical="center" backgroundColor="white" padding="32" border={BORDER_SIMPLE}>
        <VStack gap="4">
          <Heading color="h1Text" align="center" size="64">
            {quiz.questions[questionIndex].question}
          </Heading>

          <Text align="center" size="32">
            Answer: {quiz.questions[questionIndex].answers[quiz.questions[questionIndex].correctAnswerIndex]}
          </Text>
          <Text align="center" size="18">
            ID: {questionIndex + 1}/{quiz.questions.length}
          </Text>
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
