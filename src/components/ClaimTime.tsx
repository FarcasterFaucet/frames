import { getClaimTime } from "../lib/faucet.js";

export async function ClaimTime() {
  const claimTime = await getClaimTime();
  const currentTimeInSeconds = BigInt(Date.now()) / 1000n;
  const claimIn = claimTime - currentTimeInSeconds;

  return (
    <div style={{ display: "flex" }}>
      can claim in {claimIn.toString()} seconds
    </div>
  );
}
