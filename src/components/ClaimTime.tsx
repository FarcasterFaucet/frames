import { getNextPeriodStart } from "../lib/faucet";
import Claim from "./Claim";
import Time from "./Time";

const ClaimTime = async () => {
  const nextPeriodStart = await getNextPeriodStart();
  const currentTimeInSeconds = BigInt(Date.now()) / 1000n;
  const claimIn = nextPeriodStart - currentTimeInSeconds;

  return (
    <div style={{ display: "flex" }}>
      <div style={{ marginRight: "12px" }}>can claim in </div>
      <Time seconds={Number(claimIn)} />
    </div>
  );
};

export default ClaimTime;
