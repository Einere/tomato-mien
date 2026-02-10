import { app, BrowserWindow, Menu, shell, dialog } from "electron";
import pkg from "electron-updater";
import path from "path";
import { fileURLToPath } from "url";

const { autoUpdater } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

function createWindow() {
  // 메인 윈도우 생성
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../assets/icon.png"), // 아이콘 경로 (선택사항)
    titleBarStyle: "default",
    show: false, // 준비될 때까지 숨김
  });

  // 개발 모드에서는 Vite 개발 서버, 프로덕션에서는 빌드된 파일
  if (isDev) {
    // 간단하게 5173 포트로 직접 연결
    mainWindow.loadURL("http://localhost:5173");
    console.log("Vite 서버에 연결 시도: http://localhost:5173");

    // 개발 도구 열기
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // 윈도우가 준비되면 표시
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // 외부 링크는 기본 브라우저에서 열기
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // 윈도우가 닫힐 때
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// 앱이 준비되면 윈도우 생성
app.whenReady().then(() => {
  createWindow();

  // macOS에서 독 아이콘 클릭 시 윈도우 재생성
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 메뉴 설정
  createMenu();

  // 자동 업데이트 설정 (프로덕션에서만)
  if (!isDev) {
    setupAutoUpdater();
  }
});

// 모든 윈도우가 닫혔을 때 앱 종료 (macOS 제외)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 메뉴 생성
function createMenu() {
  const template = [
    {
      label: "파일",
      submenu: [
        {
          label: "새 규칙",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow.webContents.send("menu-new-rule", "menu-new-rule");
          },
        },
        { type: "separator" },
        {
          label: "종료",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "편집",
      submenu: [
        { role: "undo", label: "실행 취소" },
        { role: "redo", label: "다시 실행" },
        { type: "separator" },
        { role: "cut", label: "잘라내기" },
        { role: "copy", label: "복사" },
        { role: "paste", label: "붙여넣기" },
      ],
    },
    {
      label: "보기",
      submenu: [
        { role: "reload", label: "새로고침" },
        { role: "forceReload", label: "강제 새로고침" },
        { role: "toggleDevTools", label: "개발자 도구" },
        { type: "separator" },
        { role: "resetZoom", label: "실제 크기" },
        { role: "zoomIn", label: "확대" },
        { role: "zoomOut", label: "축소" },
        { type: "separator" },
        { role: "togglefullscreen", label: "전체 화면" },
      ],
    },
    {
      label: "알람",
      submenu: [
        {
          label: "모든 알람 활성화",
          click: () => {
            mainWindow.webContents.send(
              "menu-enable-all-alarms",
              "menu-enable-all-alarms",
            );
          },
        },
        {
          label: "모든 알람 비활성화",
          click: () => {
            mainWindow.webContents.send(
              "menu-disable-all-alarms",
              "menu-disable-all-alarms",
            );
          },
        },
      ],
    },
    {
      label: "도움말",
      submenu: [
        {
          label: "Tomato Mien 정보",
          click: () => {
            mainWindow.webContents.send("menu-about", "menu-about");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 자동 업데이트 설정
function setupAutoUpdater() {
  // 업데이트 확인 주기 (1시간마다)
  autoUpdater.checkForUpdatesAndNotify();

  // 업데이트 사용 가능할 때
  autoUpdater.on("update-available", () => {
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "업데이트 사용 가능",
        message: "새로운 버전이 사용 가능합니다. 지금 다운로드하시겠습니까?",
        buttons: ["다운로드", "나중에"],
      })
      .then(result => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  });

  // 업데이트 다운로드 완료
  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "업데이트 준비 완료",
        message:
          "업데이트가 다운로드되었습니다. 앱을 재시작하여 업데이트를 적용하시겠습니까?",
        buttons: ["지금 재시작", "나중에"],
      })
      .then(result => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  // 업데이트 오류
  autoUpdater.on("error", error => {
    console.error("업데이트 오류:", error);
  });
}

// 보안: 새 윈도우 생성 방지
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
