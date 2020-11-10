// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, Tray, Notification} = require('electron')
const path = require('path')
const http = require('http')
const express_server = require('./express_server')

/* (重要)虽然并不需要再多监听一个端口,
  因为导入 ./express_server 以后会自动开始监听4000端口
  但是这么操作一下可以使windows防火墙允许electron开启http服务器. */
http.createServer(express_server).listen('5000')

let tray = null

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // width: 998,
    // height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  mainWindow.maximize()

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // 修改关闭时的动作为隐藏
  mainWindow.on('close', (event) => { 
    event.preventDefault();
    mainWindow.hide(); 
    mainWindow.setSkipTaskbar(true);
  });

  // (重要)改成绝对路径就能解决打包后托盘消失的问题了
  // tray = new Tray('./static/img/clipboard.png')
  tray = new Tray(path.join(__dirname,'./static/img/clipboard.png'))
  // 托盘右键选项
  const contextMenu = Menu.buildFromTemplate([
    {label: '退出', click: () => {mainWindow.destroy()}}, //完全退出程序
  ])
  tray.setToolTip('快发一些文件过来吧.')
  tray.setContextMenu(contextMenu)
  // 点击托盘, 打开关闭窗口
  tray.on('click', ()=>{ 
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

}).then(() => {
  // 显示系统通知
  new Notification({
    title: '局域网剪切板已启动',
    body: '关闭设置窗口后将继续在托盘运行',
    icon: path.join(__dirname,'./static/img/clipboard.png'),
  }).show()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})