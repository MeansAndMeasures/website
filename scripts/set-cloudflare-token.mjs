#!/usr/bin/env node

import { spawn } from "node:child_process";
import process from "node:process";
import readline from "node:readline";

const DEFAULT_REPO = "MeansAndMeasures/website";
const DEFAULT_ACCOUNT_ID = "dcd87bec1efac6b2926f8e162268b446";

function run(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: options.stdio ?? "pipe",
            env: options.env ?? process.env,
        });

        let stdout = "";
        let stderr = "";

        if (child.stdout) child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
        if (child.stderr) child.stderr.on("data", (chunk) => (stderr += chunk.toString()));

        child.on("error", reject);
        child.on("close", (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
                return;
            }
            reject(new Error(`${command} ${args.join(" ")} failed (${code})\n${stderr || stdout}`));
        });
    });
}

async function promptSecret(prompt) {
    return await new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const stdin = process.stdin;
        const stdout = process.stdout;
        const previous = rl._writeToOutput;

        rl._writeToOutput = (text) => {
            if (rl.stdoutMuted) {
                stdout.write("*");
                return;
            }
            previous.call(rl, text);
        };

        rl.stdoutMuted = true;
        rl.question(prompt, (value) => {
            rl.close();
            stdout.write("\n");
            if (stdin.isTTY) stdin.setRawMode?.(false);
            resolve(value.trim());
        });
    });
}

async function main() {
    const repo = process.argv[2] || process.env.GITHUB_REPOSITORY || DEFAULT_REPO;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;

    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        throw new Error("Run this command in an interactive terminal.");
    }

    console.log(`Repository: ${repo}`);
    console.log(`Cloudflare account: ${accountId}`);
    console.log("Checking GitHub CLI authentication...");
    await run("gh", ["auth", "status", "--hostname", "github.com"], { stdio: "inherit" });

    const token = await promptSecret("Paste new CLOUDFLARE_API_TOKEN: ");
    if (!token) {
        throw new Error("A non-empty token is required.");
    }

    console.log("Validating token with Cloudflare...");
    const authHeaders = { Authorization: "Bearer " + token };
    const verifyResponse = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
        headers: authHeaders,
    });

    if (!verifyResponse.ok) {
        throw new Error(`Cloudflare token verification failed (${verifyResponse.status}).`);
    }

    const verifyBody = await verifyResponse.json();
    if (!verifyBody?.success) {
        throw new Error("Cloudflare token verification returned success=false.");
    }

    const accountResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}`, {
        headers: authHeaders,
    });

    if (!accountResponse.ok) {
        throw new Error(`Token cannot access account ${accountId} (${accountResponse.status}).`);
    }

    const accountBody = await accountResponse.json();
    if (!accountBody?.success) {
        throw new Error(`Token cannot access account ${accountId}.`);
    }

    console.log("Updating repository secret CLOUDFLARE_API_TOKEN...");
    await new Promise((resolve, reject) => {
        const child = spawn("gh", ["secret", "set", "CLOUDFLARE_API_TOKEN", "--repo", repo], {
            stdio: ["pipe", "inherit", "inherit"],
        });
        child.stdin.write(token);
        child.stdin.end();
        child.on("error", reject);
        child.on("close", (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`gh secret set failed (${code}).`));
        });
    });

    console.log("Token updated successfully.");
}

main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
});
