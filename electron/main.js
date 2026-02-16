import {
  app,
  BrowserWindow,
  Menu,
  shell,
  dialog,
  ipcMain,
  Notification,
  protocol,
  net,
} from "electron";
import pkg from "electron-updater";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const { autoUpdater } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === "development";
const isMAS = process.mas === true;

// file:// 프로토콜의 IndexedDB 제한을 우회하기 위해 커스텀 프로토콜 등록
// app.whenReady() 이전에 호출해야 함
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

let mainWindow;

function createWindow() {
  // 메인 윈도우 생성
  mainWindow = new BrowserWindow({
    width: 576,
    height: 800,
    minWidth: 576,
    maxWidth: 576,
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
    mainWindow.loadURL("app://app/index.html");
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
  // 프로덕션: 커스텀 프로토콜 핸들러 등록 (file:// 대신 app:// 사용)
  if (!isDev) {
    protocol.handle("app", request => {
      const { pathname } = new URL(request.url);
      const filePath = path.join(
        __dirname,
        "..",
        "dist",
        decodeURIComponent(pathname),
      );
      return net.fetch(pathToFileURL(filePath).href);
    });
  }

  createWindow();

  // macOS에서 독 아이콘 클릭 시 윈도우 재생성
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 메뉴 설정
  createMenu();

  // 알림 IPC 설정
  setupNotificationIPC();

  // 자동 업데이트 설정 (프로덕션 + 비MAS에서만)
  if (!isDev && !isMAS) {
    setupAutoUpdater();
  }
});

// 모든 윈도우가 닫혔을 때 앱 종료 (macOS 제외)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 알림 IPC 설정
function setupNotificationIPC() {
  ipcMain.handle("show-notification", (_event, title, options = {}) => {
    try {
      if (!Notification.isSupported()) {
        return { success: false, error: "Notification not supported" };
      }

      const notificationOptions = {
        title,
        body: options.body,
        silent: options.silent,
      };

      if (options.icon) {
        notificationOptions.icon = isDev
          ? path.join(__dirname, "../public", options.icon)
          : path.join(__dirname, "../dist", options.icon);
      }

      const notification = new Notification(notificationOptions);
      notification.show();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("request-notification-permission", () => {
    return Notification.isSupported();
  });
}

// 메뉴 생성
function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Rule",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow.webContents.send("menu-new-rule", "menu-new-rule");
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo", label: "Undo" },
        { role: "redo", label: "Redo" },
        { type: "separator" },
        { role: "cut", label: "Cut" },
        { role: "copy", label: "Copy" },
        { role: "paste", label: "Paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload", label: "Reload" },
        { role: "forceReload", label: "Force Reload" },
        { role: "toggleDevTools", label: "Developer Tools" },
        { type: "separator" },
        { role: "resetZoom", label: "Actual Size" },
        { role: "zoomIn", label: "Zoom In" },
        { role: "zoomOut", label: "Zoom Out" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Full Screen" },
      ],
    },
    {
      label: "Alarm",
      submenu: [
        {
          label: "Enable All Alarms",
          click: () => {
            mainWindow.webContents.send(
              "menu-enable-all-alarms",
              "menu-enable-all-alarms",
            );
          },
        },
        {
          label: "Disable All Alarms",
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
      label: "Help",
      submenu: [
        {
          label: "About Tomato Mien",
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
  // 업데이트 사용 가능할 때
  autoUpdater.on("update-available", () => {
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Available",
        message:
          "A new version is available. Would you like to download it now?",
        buttons: ["Download", "Later"],
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
        title: "Update Ready",
        message:
          "Update has been downloaded. Would you like to restart the app to apply it?",
        buttons: ["Restart Now", "Later"],
      })
      .then(result => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  // 업데이트 오류 — 네트워크 오류는 오프라인 환경에서 정상이므로 무시
  autoUpdater.on("error", error => {
    const isNetworkError =
      error?.message &&
      /net::ERR_|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|ENETUNREACH|getaddrinfo/i.test(
        error.message,
      );
    if (isNetworkError) return;
    console.error("업데이트 오류:", error);
  });

  // 앱 시작 시 업데이트 확인 (오프라인이면 스킵)
  safeCheckForUpdates();
}

// 오프라인 상태에서는 업데이트 확인을 건너뜀
function safeCheckForUpdates() {
  if (!net.isOnline()) return;
  autoUpdater.checkForUpdatesAndNotify().catch(() => {});
}

// 보안: 새 윈도우 생성 방지
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
