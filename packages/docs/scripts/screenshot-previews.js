#!/usr/bin/env node
/**
 * App Store 프리뷰 이미지 생성기
 * Chrome CDP를 직접 사용하여 appstore-previews/*.html → screenshots/*.png 캡처
 * 의존성 없음 (Node.js 18+ 내장 fetch/WebSocket 사용)
 *
 * 사용법: node scripts/screenshot-previews.js
 */

const { spawn } = require("child_process");
const { writeFileSync, mkdirSync } = require("fs");
const { resolve } = require("path");

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PREVIEWS_DIR = resolve(__dirname, "../assets/appstore-previews");
const OUT_DIR = resolve(__dirname, "../assets/appstore-previews");
const PORT = 9230;
const WIDTH = 2560;
const HEIGHT = 1600;

const TARGETS = [
  { html: "preview-rules.html", out: "preview-rules.png" },
  { html: "preview-editor.html", out: "preview-editor.png" },
  { html: "preview-pomodoro.html", out: "preview-pomodoro.png" },
  { html: "preview-settings.html", out: "preview-settings.png" },
];

async function waitForChrome(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/json`);
      if (res.ok) return await res.json();
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Chrome did not start in time");
}

async function cdpSession(wsUrl) {
  return new Promise((resolveSession, rejectSession) => {
    const ws = new WebSocket(wsUrl);
    let msgId = 0;
    const pending = new Map();

    ws.addEventListener("open", () => resolveSession({ send, close }));
    ws.addEventListener("error", rejectSession);
    ws.addEventListener("message", ({ data }) => {
      const msg = JSON.parse(data);
      if (pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      }
    });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++msgId;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    function close() {
      ws.close();
    }
  });
}

async function captureTarget(send, { html, out }) {
  const htmlPath = resolve(PREVIEWS_DIR, html);
  const outPath = resolve(OUT_DIR, out);

  // 페이지 이동
  await send("Page.navigate", { url: `file://${htmlPath}` });
  await send("Page.enable");

  // 페이지 로드 대기
  await new Promise((r) => setTimeout(r, 1500));

  // 뷰포트 설정
  await send("Emulation.setDeviceMetricsOverride", {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await new Promise((r) => setTimeout(r, 500));

  // 스크린샷 캡처
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 },
    captureBeyondViewport: false,
  });

  writeFileSync(outPath, Buffer.from(data, "base64"));
  console.log(`✓ ${out}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log("Starting Chrome...");
  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
    { stdio: "ignore" }
  );

  chrome.on("error", (err) => {
    console.error("Chrome error:", err);
    process.exit(1);
  });

  try {
    const targets = await waitForChrome();
    const target = targets.find((t) => t.type === "page") || targets[0];
    const { send, close } = await cdpSession(target.webSocketDebuggerUrl);

    for (const t of TARGETS) {
      await captureTarget(send, t);
    }

    close();
    console.log(`\nDone. Output: ${OUT_DIR}`);
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
