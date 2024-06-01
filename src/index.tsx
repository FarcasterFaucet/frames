import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { getUserStatus, registerUser } from "./lib/faucet.js";
import { ClaimTime } from "./components/ClaimTime.js";
import Claim from "./components/Claim.js";

const imageStyles = {
  background: "white",
  display: "flex",
  fontSize: 50,
  height: "100%",
};

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' }),
});

app.frame("/", (c) => {
  // Fetch if user is registered

  return c.res({
    action: "/checkClaim",
    image: <div style={imageStyles}>Faucet</div>,
    intents: [<Button>Check claimability!</Button>],
  });
});

app.frame("/checkClaim", async (c) => {
  // Fetch if user is registered
  const { fid } = c.frameData || {};
  if (!fid) {
    return c.error({ message: "No fid" }); // TODO: update message error
  }

  const { canClaim, registeredNextPeriod } = await getUserStatus(fid);

  return c.res({
    action: canClaim ? "/claimed" : "/registered",
    image: (
      <div style={imageStyles}>
        {canClaim ? (
          <Claim />
        ) : registeredNextPeriod ? (
          <ClaimTime />
        ) : (
          "Register for next period"
        )}
      </div>
    ),
    intents: [
      (canClaim || !registeredNextPeriod) && (
        <Button.Transaction target="/claimAndOrRegister">
          {canClaim ? "Claim!" : "Register!"}
        </Button.Transaction>
      ),
    ],
  });
});

app.transaction("claimAndOrRegister", (c) => {
  if (!c.frameData?.fid) {
    return; //throw error
  }

  return registerUser(c);
});

app.frame("/registered", async (c) => {
  const { transactionId } = c;
  return c.res({
    image: (
      <div style={imageStyles}>Registered successfuly! {transactionId}</div>
    ),
    intents: [<Button.Reset>Done!</Button.Reset>],
  });
});

app.frame("/claimed", async (c) => {
  const { transactionId } = c;
  return c.res({
    image: <div style={imageStyles}>Claimed successfuly! {transactionId}</div>,
    intents: [<Button.Reset>Done!</Button.Reset>],
  });
});

app.use("/*", serveStatic({ root: "./public" }));
devtools(app, { serveStatic });

if (typeof Bun !== "undefined") {
  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  });
  console.log("Server is running on port 3000");
}
