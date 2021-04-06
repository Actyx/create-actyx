import execa, { Options } from "execa";
import { spin } from "tiny-spin";
import { reporter } from "./reporter";
import fs from "fs-extra";
import path from "path";
import { clearLine } from "./utils";
import { DEFAULT_STARTER, STARTERS } from "./const";
import { Starter } from "./types";

const clone = async (
  url: string,
  rootPath: string,
  branch?: string
): Promise<void> => {
  const branchProps = branch ? [`-b`, branch] : [];
  const stop = spin(`Loading starter project...`);
  const args = [
    `clone`,
    ...branchProps,
    url,
    rootPath,
    `--recursive`,
    `--depth=1`,
    `--quiet`,
  ].filter((arg) => Boolean(arg));

  try {
    await execa(`git`, args);
    reporter.success(`Loaded starter project`);
  } catch (err) {
    reporter.panic(err.message);
  }

  stop();
  await fs.remove(path.join(rootPath, `.git`));

  await fs.remove(path.join(rootPath, `LICENSE`));
};

const install = async (rootPath: string): Promise<void> => {
  const prevDir = process.cwd();

  reporter.info("Installing dependencies...");

  process.chdir(rootPath);

  const npmConfigUserAgent = process.env.npm_config_user_agent;

  try {
    const options: Options = {
      stderr: `inherit`,
    };

    const config = [`--loglevel`, `error`, `--color`, `always`];

    await execa(`npm`, [`install`, ...config], options);
    await clearLine();

    reporter.success(`Installed dependencies`);
  } catch (e) {
    reporter.panic(e.message);
  } finally {
    process.chdir(prevDir);
  }
};

const ensureFolderDoesntExit = async (absPath: string): Promise<void> => {
  if (await fs.pathExists(absPath)) {
    reporter.panic(`Error: directory ${path.basename(absPath)} already exists`);
  }
};

const initStarter = async (name: string, starter: Starter): Promise<void> => {
  const absPath = path.resolve(starter.outDir);
  console.log(`absPath: ${absPath}`);
  await ensureFolderDoesntExit(absPath);
  await clone(starter.repo, absPath);
  await install(absPath);
  reporter.info(`Type 'cd ${path.basename(absPath)} && npm run start' to run`);
};

export const run = async () => {
  const starter = process.argv.length < 3 ? DEFAULT_STARTER : process.argv[2];

  if (!Object.keys(STARTERS).includes(starter)) {
    reporter.panic(`Error: unknown starter ${starter}`);
  }
  await initStarter(starter, STARTERS[starter]);
};
