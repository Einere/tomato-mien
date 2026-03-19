#!/usr/bin/env node
/**
 * OG 이미지 스크린샷 생성기
 * Chrome CDP를 직접 사용하여 og-image.html → og-image.png 캡처
 * 의존성 없음 (Node.js 18+ 내장 fetch/WebSocket 사용)
 *
 * 사용법: node scripts/screenshot-og.js
 */

const { spawn } = require("child_process");
const { writeFileSync } = require("fs");
const { resolve } = require("path");

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HTML = resolve(__dirname, "../assets/og-image.html");
const OUT = resolve(__dirname, "../assets/og-image.png");
const PORT = 9229;
const WIDTH = 1200;
const HEIGHT = 630;

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

async function main() {
  console.log("Starting Chrome...");
  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=2",
      `--window-size=${WIDTH},${HEIGHT}`,
      `file://${HTML}`,
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

    // 정확한 뷰포트 설정
    await send("Emulation.setDeviceMetricsOverride", {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 2, // 2x for retina quality
      mobile: false,
    });

    // 페이지 로드 대기
    await send("Page.enable");
    await new Promise((r) => setTimeout(r, 1500));

    // 정확한 클립 영역으로 스크린샷
    const { data } = await send("Page.captureScreenshot", {
      format: "png",
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 2 },
      captureBeyondViewport: false,
    });

    writeFileSync(OUT, Buffer.from(data, "base64"));
    console.log(`Saved: ${OUT}`);

    close();
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
