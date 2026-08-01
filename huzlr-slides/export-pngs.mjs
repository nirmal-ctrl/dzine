import sharp from "../Somae-webapp/node_modules/sharp/lib/index.js";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const dir = new URL(".", import.meta.url).pathname;
const svgs = readdirSync(dir)
  .filter((file) => /^\d\d-.+\.svg$/.test(file))
  .sort();

for (const svg of svgs) {
  const input = join(dir, svg);
  const output = join(dir, svg.replace(/\.svg$/, ".png"));
  await sharp(input, { density: 144 }).resize(1920, 1080).png().toFile(output);
  console.log(output);
}
