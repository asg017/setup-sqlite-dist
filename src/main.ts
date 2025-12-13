import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
//import * as github from "@actions/github";

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
  const p = await tc.downloadTool(
    "https://github.com/asg017/sqlite-dist/releases/download/v0.0.1-alpha.19/sqlite-dist-aarch64-apple-darwin.tar.xz",
  );
  const p2 = await tc.extractXar(p, "tmp2");
  const pcache = await tc.cacheDir(p2, "sqlite-dist", "TEST");
  core.addPath(pcache);
  core.debug(p);
  core.debug(p2);
  core.debug(pcache);
}
