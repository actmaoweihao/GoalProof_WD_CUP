import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const artifactPath = resolve("artifacts/contracts/GoalProof.sol/GoalProof.json");
const targetPath = resolve("frontend/src/abi/GoalProof.json");
const artifact = JSON.parse(await readFile(artifactPath, "utf8")) as { abi: unknown[] };
await mkdir(dirname(targetPath), { recursive: true });
await writeFile(targetPath, `${JSON.stringify(artifact.abi, null, 2)}\n`, "utf8");
console.log(`Exported ${artifact.abi.length} ABI entries to ${targetPath}`);
