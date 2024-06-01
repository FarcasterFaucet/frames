import { getCurrentPeriodPayout } from "../lib/faucet.js";

const decimals = 18; //TODO: Get decimals from token contract

export default async function Claim() {
  const payout = await getCurrentPeriodPayout();

  const formattedPayout = (BigInt(payout) / BigInt(10 ** decimals)).toString();

  return (
    <div style={{ display: "flex" }}>
      You can now claim! {formattedPayout} tokens
    </div>
  );
}
