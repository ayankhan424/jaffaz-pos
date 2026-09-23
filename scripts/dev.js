import { spawn } from "node:child_process";
import process from "node:process";

const processes = [
  spawn(process.execPath, ["server/index.js"], { stdio: "inherit", env: process.env }),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1"], { stdio: "inherit", env: process.env }),
];

function stop() {
  for (const child of processes) if (!child.killed) child.kill();
}

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { stop(); process.exit(0); });
for (const child of processes) child.on("exit", (code) => {
  if (code !== null && code !== 0) process.exitCode = code;
  stop();
});
