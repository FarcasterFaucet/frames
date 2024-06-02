import { createPublicClient, getContract, http } from 'viem'
import { optimism } from 'viem/chains'
import { FAUCET_CONTRACT_ADDRESS } from './constants.js'
import { faucetABI } from './abis.js'

const publicClient = createPublicClient({
  chain: optimism,
  transport: http(),
})

const contract = getContract({
  address: FAUCET_CONTRACT_ADDRESS,
  abi: faucetABI,
  client: publicClient,
})

export async function getUserStatus(fid: number) {
  const [currentPeriod, [registeredClaimPeriod, latestClaimPeriod]] = await Promise.all([
    contract.read.getCurrentPeriod(),
    contract.read.claimers([BigInt(fid)]),
  ])

  const registeredNextPeriod = registeredClaimPeriod === currentPeriod + 1n

  return {
    canClaim: latestClaimPeriod < currentPeriod && registeredClaimPeriod === currentPeriod,
    registeredNextPeriod: registeredNextPeriod,
  }
}

export async function getNextPeriodStart() {
  const [firstPeriodStart, periodLength, currentPeriod] = await Promise.all([
    contract.read.firstPeriodStart(),
    contract.read.periodLength(),
    contract.read.getCurrentPeriod(),
  ])

  return firstPeriodStart + periodLength * (currentPeriod + 1n)
}

export async function getCurrentPeriodPayout() {
  const currentPeriod = await contract.read.getCurrentPeriod()

  return contract.read.getPeriodIndividualPayout([currentPeriod])
}
