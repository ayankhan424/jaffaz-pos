import { spawn } from "node:child_process";
import process from "node:process";

const vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1"], {
  stdio: "inherit",
  env: process.env,
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (!vite.killed) vite.kill(signal);
    process.exit(0);
  });
}

vite.on("exit", (code) => {
  process.exitCode = code ?? 0;
});
