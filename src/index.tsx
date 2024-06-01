import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { getUserStatus, registerUser } from "./lib/faucet.js";

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' }),
});

app.frame("/", (c) => {
  // Fetch if user is registered

  return c.res({
    action: "/checkClaim",
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 120 }}>
        Faucet
      </div>
    ),
    intents: [<Button>Check claimability!</Button>],
  });
});

app.frame("/checkClaim", async (c) => {
  // Fetch if user is registered
  const { fid } = c.frameData || {};
  if (!fid) {
    return c.error({ message: "No fid" }); // TODO: update message error
  }

  const { canClaim, registered } = await getUserStatus(fid);

  return c.res({
    action: canClaim ? "/claimed" : "/registered",
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 120 }}>
        {canClaim
          ? "You can now claim!"
          : registered
          ? "You can claim on..."
          : "Register for next period"}
      </div>
    ),
    intents: [
      (canClaim || !registered) && (
        <Button.Transaction target="claimAndOrRegister">
          {canClaim ? "Claim!" : "Register!"}
        </Button.Transaction>
      ),
    ],
  });
});

app.frame("/registered", async (c) => {
  const { transactionId } = c;
  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 120 }}>
        Registered successfuly! {transactionId}
      </div>
    ),
    intents: [<Button.Reset>Done!</Button.Reset>],
  });
});

app.transaction("claimAndOrRegister", (c) => {
  if (!c.frameData?.fid) {
    return; //throw error
  }
  return registerUser(c.contract, c.frameData.fid);
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
