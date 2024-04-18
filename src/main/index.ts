import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { pathToFileURL } from 'url'
import { RawMosaicImagesProtocol } from './app-loc'

// protocol.registerSchemesAsPrivileged([
//   {
//       scheme: RawMosaicImagesProtocol.SCHEME,
//       privileges: {
//           allowServiceWorkers:true,
//           bypassCSP: true,
//           stream:true,
//           supportFetchAPI:true
//       }
//   }
// ])

function createWindow(): void {


  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })


  const rawMosaicImagesProtocol = new RawMosaicImagesProtocol()
  await rawMosaicImagesProtocol.setup()

  // protocol.handle('app', (req) => {
  //   console.log(req.url)
  //   const { protocol,host, pathname } = new URL(req.url)
  //   console.log(protocol)
  //   if (host === 'bundle') {
  //     if (pathname === '/') {
  //       return new Response('<h1>hello, world</h1>', {
  //         headers: { 'content-type': 'text/html' }
  //       })
  //     }
  //     // NB, this checks for paths that escape the bundle, e.g.
  //     // app://bundle/../../secret_file.txt
  //     const pathToServe = path.resolve(__dirname, pathname)
  //     const relativePath = path.relative(__dirname, pathToServe)
  //     const isSafe = relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)
  //     if (!isSafe) {
  //       return new Response('bad', {
  //         status: 400,
  //         headers: { 'content-type': 'text/html' }
  //       })
  //     }

  //     return net.fetch(pathToFileURL(pathToServe).toString())
  //   } else if (host === 'api') {
  //     return net.fetch('https://api.my-server.com/' + pathname, {
  //       method: req.method,
  //       headers: req.headers,
  //       body: req.body
  //     })
  //   } else {
  //     return net.fetch('file://' + req.url)
  //   }

  // })



  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
