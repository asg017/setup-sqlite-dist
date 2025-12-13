import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { getPlatform, getArch } from "./platform.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const VERSIONS: {
  createdAt: string;
  name: string;
  tagName: string;
}[] = JSON.parse(
  readFileSync(join(import.meta.dirname, "..", "version.json"), "utf-8"),
);

const LATEST_VERSION = VERSIONS.slice().sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
)[0];

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  /*
  const kit = github.getOctokit(token);
  const release = await kit.rest.repos.getReleaseByTag({
    owner: "asg017",
    repo: "sqlite-dist",
    tag: "v0.0.1-alpha.19",
  });
  const assets = await kit.rest.repos.listReleaseAssets({
    owner: "asg017",
    repo: "sqlite-dist",
    release_id: release.data.id,
  });
  const asset = assets.data.find(
    (a) => a.name === "sqlite-dist-aarch64-apple-darwin.tar.xz",
  )!;
  */

  const platform = await getPlatform();
  const arch = getArch();
  if (!platform || !arch) {
    throw new Error(
      `Unsupported platform or architecture: platform=${platform} arch=${arch}`,
    );
  }
  let target = null;
  if (platform === "apple-darwin") {
    if (arch === "aarch64") {
      target = "sqlite-dist-aarch64-apple-darwin.tar.xz";
    } else if (arch === "x86_64") {
      target = "sqlite-dist-x86_64-apple-darwin.tar.xz";
    }
  } else if (platform === "pc-windows-msvc") {
    // skip windows support for now, bc uses .zip
  } else if (platform === "unknown-linux-gnu") {
    if (arch === "aarch64") {
      target = "sqlite-dist-aarch64-unknown-linux-gnu.tar.xz";
    } else if (arch === "x86_64") {
      target = "sqlite-dist-x86_64-unknown-linux-gnu.tar.xz";
    }
  }
  if (!target) {
    throw new Error(
      `No prebuilt binaries for platform=${platform} arch=${arch}`,
    );
  }

  const p = await tc.downloadTool(
    `https://github.com/asg017/sqlite-dist/releases/download/${LATEST_VERSION.tagName}/${target}`,
  );
  // This is a .tar.xz archive. Use extractTar with xz flags (J) and
  // strip the top-level directory (equivalent to --strip-components=1).
  // Pass flags as an array so we can include GNU tar long options.
  const p2 = await tc.extractTar(p, "tmp2", ["xJ", "--strip-components=1"]);
  const pcache = await tc.cacheDir(p2, "sqlite-dist", LATEST_VERSION.tagName);
  core.addPath(pcache);
  core.debug(p);
  core.debug(p2);
  core.debug(pcache);
}
