import { getCurrentPeriodPayout, getNextPeriodStart } from "../lib/faucet.js";
import Time from "./Time.js";

const decimals = 18; //TODO: Get decimals from token contract

export default async function Claim() {
  const payout = await getCurrentPeriodPayout();
  const nextPeriodStart = await getNextPeriodStart();

  // Calculate time left to claim
  const currentTimeInSeconds = BigInt(Date.now()) / 1000n;
  const claimBefore = nextPeriodStart - currentTimeInSeconds - 1n;

  // Format payout
  const formattedPayout = (BigInt(payout) / BigInt(10 ** decimals)).toString();

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      You can now claim! {formattedPayout} tokens
      <div style={{ display: "flex", columnGap: "20px" }}>
        <span> Claim in the next </span>
        <Time seconds={Number(claimBefore)} />
      </div>
    </div>
  );
}
