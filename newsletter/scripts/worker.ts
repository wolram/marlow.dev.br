import { processDueCampaigns } from "../lib/campaigns";

async function run() {
  const processed = await processDueCampaigns();
  console.log(`[worker] processed campaigns: ${processed}`);
}

async function loop() {
  while (true) {
    await run();
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
}

loop().catch((error) => {
  console.error(error);
  process.exit(1);
});
