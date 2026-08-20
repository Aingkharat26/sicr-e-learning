import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();

const LIB_NAME = "sic-ng";
const SOURCE_BRANCH = "source/22";
const RELEASE_BRANCH = "release/22";

const LIB_PACKAGE_JSON = path.join(
  ROOT_DIR,
  "projects",
  LIB_NAME,
  "package.json"
);

const DIST_DIR = path.join(ROOT_DIR, "dist", LIB_NAME);

// folder สำหรับ checkout branch release/22 แยกจาก source
const RELEASE_WORKTREE_DIR = path.resolve(
  ROOT_DIR,
  "..",
  `${LIB_NAME}-release-22`
);

function run(command, options = {}) {
  console.log(`\n> ${command}`);

  execSync(command, {
    stdio: "inherit",
    cwd: options.cwd ?? ROOT_DIR,
    shell: true
  });
}

function output(command, options = {}) {
  try {
    return execSync(command, {
      cwd: options.cwd ?? ROOT_DIR,
      shell: true,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"]
    }).trim();
  } catch {
    return "";
  }
}

function ensureRootProject() {
  const angularJson = path.join(ROOT_DIR, "angular.json");

  if (!fs.existsSync(angularJson)) {
    throw new Error(
      `Please run this script from Angular workspace root. angular.json not found: ${ROOT_DIR}`
    );
  }

  if (!fs.existsSync(LIB_PACKAGE_JSON)) {
    throw new Error(`Library package.json not found: ${LIB_PACKAGE_JSON}`);
  }
}

function getLibVersion() {
  const pkg = JSON.parse(fs.readFileSync(LIB_PACKAGE_JSON, "utf8"));

  if (!pkg.version) {
    throw new Error(`version not found in ${LIB_PACKAGE_JSON}`);
  }

  return pkg.version;
}

function getRemoteUrl() {
  const remoteUrl = output("git remote get-url origin");

  if (!remoteUrl) {
    throw new Error("Git remote origin not found.");
  }

  return remoteUrl;
}

function branchExistsRemote(branchName) {
  const result = output(`git ls-remote --heads origin ${branchName}`);
  return result.length > 0;
}

function tagExists(tagName) {
  const localTag = output(`git tag --list ${tagName}`);
  const remoteTag = output(`git ls-remote --tags origin refs/tags/${tagName}`);

  return localTag.length > 0 || remoteTag.length > 0;
}

function commitIfChanged(message, cwd) {
  const status = output("git status --porcelain", { cwd });

  if (!status) {
    console.log("\nNo changes to commit.");
    return false;
  }

  run("git add .", { cwd });
  run(`git commit -m "${message}"`, { cwd });

  return true;
}

function prepareReleaseWorktree() {
  const remoteReleaseExists = branchExistsRemote(RELEASE_BRANCH);

  if (!fs.existsSync(RELEASE_WORKTREE_DIR)) {
    if (remoteReleaseExists) {
      run(`git worktree add "${RELEASE_WORKTREE_DIR}" ${RELEASE_BRANCH}`);
    } else {
      run(`git worktree add -b ${RELEASE_BRANCH} "${RELEASE_WORKTREE_DIR}"`);
    }

    return;
  }

  const gitDir = path.join(RELEASE_WORKTREE_DIR, ".git");

  if (!fs.existsSync(gitDir)) {
    throw new Error(
      `Release folder exists but is not a git worktree: ${RELEASE_WORKTREE_DIR}`
    );
  }

  run(`git checkout ${RELEASE_BRANCH}`, {
    cwd: RELEASE_WORKTREE_DIR
  });

  if (remoteReleaseExists) {
    run(`git pull origin ${RELEASE_BRANCH}`, {
      cwd: RELEASE_WORKTREE_DIR
    });
  }
}

function cleanReleaseWorktree() {
  if (!fs.existsSync(RELEASE_WORKTREE_DIR)) {
    throw new Error(`Release worktree not found: ${RELEASE_WORKTREE_DIR}`);
  }

  // ลบไฟล์ทั้งหมดที่ Git track อยู่ใน branch release/22
  run("git rm -r --ignore-unmatch .", {
    cwd: RELEASE_WORKTREE_DIR
  });

  // ลบไฟล์ที่ Git ไม่ได้ track ด้วย เช่น cache, temp, ไฟล์เก่าค้าง
  run("git clean -fdx", {
    cwd: RELEASE_WORKTREE_DIR
  });
}

function copyDistToRelease() {
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error(`Build output not found: ${DIST_DIR}`);
  }

  fs.cpSync(DIST_DIR, RELEASE_WORKTREE_DIR, {
    recursive: true,
    force: true
  });
}

function main() {
  ensureRootProject();

  const version = getLibVersion();
  const tagName = `v${version}`;

  console.log(`\nRelease version: ${tagName}`);
  console.log(`Source branch: ${SOURCE_BRANCH}`);
  console.log(`Release branch: ${RELEASE_BRANCH}`);
  console.log(`Release worktree: ${RELEASE_WORKTREE_DIR}`);

  getRemoteUrl();

  // 1) checkout source/22
  run(`git checkout ${SOURCE_BRANCH}`);

  // 2) pull source/22
  run(`git pull origin ${SOURCE_BRANCH}`);

  // 3) check tag ซ้ำ
  if (tagExists(tagName)) {
    throw new Error(
      `Tag ${tagName} already exists. Please update version in ${LIB_PACKAGE_JSON}`
    );
  }

  // 4) clean dist
  fs.rmSync(DIST_DIR, {
    recursive: true,
    force: true
  });

  // 5) build
  run("npm run build");
  run("npm run postbuild");

  // 6) ถ้า build ผ่าน ค่อย commit source
  commitIfChanged(`update source for ${tagName}`, ROOT_DIR);

  // 7) push source/22
  run(`git push origin ${SOURCE_BRANCH}`);

  // 8) fetch remote ล่าสุด
  run("git fetch origin");

  // 9) เตรียม release worktree
  prepareReleaseWorktree();

  // 10) ลบไฟล์เก่าใน release/22 ทั้งหมดก่อน
  cleanReleaseWorktree();

  // 11) copy dist/sic-ng ไปทับ release/22
  copyDistToRelease();

  // 12) commit release
  const hasReleaseCommit = commitIfChanged(
    `release ${tagName}`,
    RELEASE_WORKTREE_DIR
  );

  if (!hasReleaseCommit) {
    throw new Error(
      "No release changes found. Build output may be same as previous release."
    );
  }

  // 13) tag บน release/22
  run(`git tag ${tagName}`, {
    cwd: RELEASE_WORKTREE_DIR
  });

  // 14) push release/22
  run(`git push origin ${RELEASE_BRANCH}`, {
    cwd: RELEASE_WORKTREE_DIR
  });

  // 15) push tag
  run(`git push origin ${tagName}`, {
    cwd: RELEASE_WORKTREE_DIR
  });

  // 16) กลับ source branch
  run(`git checkout ${SOURCE_BRANCH}`);

  console.log(`\n✅ Release completed: ${tagName}`);
  console.log("\nInstall command:");
  console.log(
    `npm install git+https://github.com/softinter-chiangrai/sic-ng.git#${tagName}`
  );
}

main();