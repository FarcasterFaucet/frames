import { createPublicClient, getContract, http } from "viem";
import faucetABI from '../abi/faucetABI.json'

const OP_CHAIN_ID = 10
const FAUCET_CONTRACT_ADDRESS = '0x'


export function registerUser(contract: any, fid: number) {
    return contract({
        abi: faucetABI,
        chainId: OP_CHAIN_ID,
        functionName: 'register',
        args: [fid],
        to: FAUCET_CONTRACT_ADDRESS, 
      })
}