import { notarize } from "@electron/notarize";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { build } = require("../package.json");

export default async function notarizing(context) {
  const { electronPlatformName, appOutDir, targets } = context;

  if (electronPlatformName !== "darwin") {
    return;
  }

  // MAS / MAS dev 빌드는 Apple 심사 또는 로컬 Sandbox 테스트 대상이므로 별도 공증이 필요 없다.
  const buildOptions = context.packager.platformSpecificBuildOptions;
  const targetNames = targets.map(target => target.name);
  const isMasBuild =
    process.env.MAS_BUILD === "true" ||
    buildOptions?.type === "development" ||
    targetNames.some(target => target === "mas" || target === "mas-dev") ||
    appOutDir.includes("/mas-") ||
    appOutDir.includes("mas-dev");

  if (isMasBuild) {
    console.log("MAS build detected, skipping notarization.");
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log(`Notarizing ${appName}...`);

  await notarize({
    appBundleId: build.appId,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });

  console.log("Notarization complete.");
}
