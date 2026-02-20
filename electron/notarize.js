import { notarize } from "@electron/notarize";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { build } = require("../package.json");

export default async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== "darwin") {
    return;
  }

  // MAS 빌드는 Apple이 심사 과정에서 자체 서명하므로 별도 공증 불필요
  const buildOptions = context.packager.platformSpecificBuildOptions;
  if (buildOptions?.provisioningProfile) {
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
