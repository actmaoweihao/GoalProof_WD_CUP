import { network } from "hardhat";

const seconds = Number(process.env.ADVANCE_SECONDS || 400);
if (!Number.isSafeInteger(seconds) || seconds <= 0) throw new Error("ADVANCE_SECONDS must be positive.");
const { networkHelpers } = await network.create();
const timestamp = await networkHelpers.time.increase(seconds);
console.log(`Advanced local chain by ${seconds} seconds. New timestamp: ${timestamp}`);
