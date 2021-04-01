import execa, { Options } from "execa"
import { spin } from "tiny-spin"
import { reporter } from "./reporter"
import fs from "fs-extra"
import path from "path"
import { clearLine } from "./utils"
import { DEFAULT_STARTER } from './const'

const clone = async (
  url: string,
  rootPath: string,
  branch?: string
): Promise<void> => {
  const branchProps = branch ? [`-b`, branch] : []
  const stop = spin(`Cloning quickstart repository`)
  const args = [
    `clone`,
    ...branchProps,
    url,
    rootPath,
    `--recursive`,
    `--depth=1`,
    `--quiet`,
  ].filter(arg => Boolean(arg))

  try {
    await execa(`git`, args)

    reporter.success(`Loaded quickstart project`)
  } catch (err) {
    reporter.panic(err.message)
  }

  stop()
  await fs.remove(path.join(rootPath, `.git`))

  await fs.remove(path.join(rootPath, `LICENSE`))
}

const install = async (
  rootPath: string,
): Promise<void> => {
  const prevDir = process.cwd()

  reporter.info("Installing dependencies...")

  process.chdir(rootPath)

  const npmConfigUserAgent = process.env.npm_config_user_agent

  try {

    const options: Options  = {
      stderr: `inherit`,
    }

    const config = [`--loglevel`, `error`, `--color`, `always`]

    await execa(`npm`, [`install`, ...config], options)
    await clearLine()

    reporter.success(`Installed dependencies`)
    reporter.info(`Type 'cd actyx-quickstart && npm run start' to run`)

  } catch (e) {
    reporter.panic(e.message)
  } finally {
    process.chdir(prevDir)
  }
}

const ensureFolderDoesntExit = async (absPath: string): Promise<void> => {
  if (await fs.pathExists(absPath)) {
    reporter.panic(`Error: directory ${path.basename(absPath)} already exists`)
  }
}

const initStarter = async (
  starter: string,
  rootPath: string,
): Promise<void> => {
  const absPath = path.resolve(rootPath)
  await ensureFolderDoesntExit(absPath)
  await clone(starter, absPath)
  await install(absPath)
}

export const run = async () => {
  await initStarter(DEFAULT_STARTER, 'actyx-quickstart')
}