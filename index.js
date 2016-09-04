const electron = require('electron')
const {app, BrowserWindow} = electron
const {Menu, Tray} = electron
const ipc = electron.ipcMain


let home
app.on('ready', () => {

    home = new BrowserWindow({
        width: 950,
        height: 600,
        frame: false
    })

    home.loadURL(`file://${__dirname}/app/home/index.html`)

    home.webContents.openDevTools()

    home.on('closed', () => {
        home = null
    })

    ipc.on('home-reload', () => home.reload() )

    ipc.on('appFocus', () => home.focus())
    ipc.on('appMinimize', () => home.minimize())
    ipc.on('appClose', () => home.close())
    ipc.on('appMaximize', () => home.maximize())
    ipc.on('appUnmaximize', () => home.unmaximize())
    ipc.on('appReload', () => home.reload())
})

app.on('window-all-closed', () => {

    if ( process.platform !== 'darwin' )
        app.quit()

})
