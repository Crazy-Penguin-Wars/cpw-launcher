const { app, BrowserWindow, autoUpdater } = require("electron");
const discord_integration = require('./integrations/discord');
const path = require("path");
const { DEFAULT_SERVER_URL, ALLOWED_SERVER_ORIGINS } = require("./config");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) app.quit();

// Check for updates except for macOS
if (process.platform != "darwin") require("update-electron-app")({ repo: "New-Club-Penguin/NewCP-App-Build" });

const pluginPaths = {
  win32: path.join(path.dirname(__dirname), "lib/pepflashplayer.dll"),
  darwin: path.join(path.dirname(__dirname), "lib/PepperFlashPlayer.plugin"),
  linux: path.join(path.dirname(__dirname), "lib/libpepflashplayer.so"),
};


if (process.platform === "linux") app.commandLine.appendSwitch("no-sandbox");
const pluginName = pluginPaths[process.platform];
console.log("pluginName", pluginName);

app.commandLine.appendSwitch("ppapi-flash-path", pluginName);
app.commandLine.appendSwitch("ppapi-flash-version", "31.0.0.122");
app.commandLine.appendSwitch("ignore-certificate-errors");

let mainWindow;
let pendingTestMapUrl = null;

function testMapUrlFromProtocolLink(protocolLink) {
  try {
    const link = new URL(protocolLink);
    if (link.protocol !== "cpw:" || link.hostname !== "test-map") return null;

    const testMapUrl = new URL(link.searchParams.get("url"));
    if (!ALLOWED_SERVER_ORIGINS.has(testMapUrl.origin) || testMapUrl.pathname !== "/test-map") {
      console.warn("Rejected test-map URL from an untrusted server:", testMapUrl.toString());
      return null;
    }
    return testMapUrl.toString();
  } catch (_error) {
    return null;
  }
}

function handleProtocolLink(protocolLink) {
  const testMapUrl = testMapUrlFromProtocolLink(protocolLink);
  if (!testMapUrl) return false;

  pendingTestMapUrl = testMapUrl;
  if (mainWindow) {
    mainWindow.loadURL(testMapUrl);
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
  return true;
}

function protocolLinkFromArguments(argumentsList) {
  return argumentsList.find((argument) => argument.startsWith("cpw://"));
}

// macOS delivers custom protocol links through this event.  Windows and Linux
// deliver them through the command line handled by the single-instance event.
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleProtocolLink(url);
});

const createWindow = () => {
  // Create the browser window.
  let splashWindow = new BrowserWindow({
    width: 600,
    height: 320,
    frame: false,
    transparent: true,
    show: false,
  });

  splashWindow.setResizable(false);
  splashWindow.loadURL(
    "file://" + path.join(path.dirname(__dirname), "src/index.html"),
  );
  splashWindow.on("closed", () => (splashWindow = null));
  splashWindow.webContents.on("did-finish-load", () => {
    splashWindow.show();
  });

  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    useContentSize: true,
    show: false,
    webPreferences: {
      plugins: true,
    },
  });

  mainWindow.webContents.on("did-finish-load", () => {
    if (splashWindow) {
      splashWindow.close();
      mainWindow.show();
    }
    discord_integration.initDiscordRichPresence();
  });

  mainWindow.webContents.on("will-navigate", (event, urlString) => {
    let isAllowed = false;
    try {
      isAllowed = ALLOWED_SERVER_ORIGINS.has(new URL(urlString).origin);
    } catch (_error) {}
    if (!isAllowed) {
      event.preventDefault();
    }
  });
  app.on('before-quit', (e) => {
    mainWindow.destroy()
  })
  mainWindow.on("closed", () => (mainWindow = null));

  mainWindow.webContents.session.clearHostResolverCache();

  new Promise((resolve) =>
    setTimeout(() => {
      mainWindow.loadURL(pendingTestMapUrl || `${DEFAULT_SERVER_URL}/`);
      resolve();
    }, 5000)
  );
};

const launchMain = () => {
  // Disallow multiple clients running
  if (!app.requestSingleInstanceLock()) return app.quit();
  app.on("second-instance", (_event, commandLine, _workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    const protocolLink = protocolLinkFromArguments(commandLine);
    if (protocolLink && handleProtocolLink(protocolLink)) return;
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  if (process.defaultApp) {
    app.setAsDefaultProtocolClient("cpw", process.execPath, [path.resolve(process.argv[1])]);
  } else {
    app.setAsDefaultProtocolClient("cpw");
  }

  app.whenReady().then(() => {
    const startupProtocolLink = protocolLinkFromArguments(process.argv);
    if (startupProtocolLink) handleProtocolLink(startupProtocolLink);
    createWindow();
    
    app.on("activate", () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

launchMain();
