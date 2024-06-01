import { createPublicClient, getContract, http } from "viem";
import { optimism } from "viem/chains";
import { FAUCET_CONTRACT_ADDRESS, OP_CHAIN_ID } from "./utils.js";
import faucetABI from "../abi/faucetABI.json";

const publicClient = createPublicClient({
  chain: optimism,
  transport: http(),
});

const contract = getContract({
  address: FAUCET_CONTRACT_ADDRESS,
  abi: faucetABI,
  client: publicClient,
});

export async function getUserStatus(fid: number) {
  const [currentPeriod, claimer] = await Promise.all([
    contract.read.getCurrentPeriod(),
    contract.read.claimer(fid),
  ]);
  return {
    canClaim: claimer.latestClaimPeriod < currentPeriod,
    registered: claimer.registeredClaimPeriod === currentPeriod,
  };
}

export function getPeriodLength(contract: any) {
  return contract.read.periodLength();
}

export function registerUser(contract: any, fid: number) {
  return contract({
    abi: faucetABI,
    chainId: `eip155:${OP_CHAIN_ID}`,
    functionName: "register",
    args: [fid],
    to: FAUCET_CONTRACT_ADDRESS,
  });
}
