const electron = require('electron');
const url = require('url');
const path = require('path');
const ipcMain = require('electron').ipcMain;

const {app, BrowserWindow, dialog, Menu} = electron;

let mainWindow;

app.on('ready', function(){
    
    mainWindow = new BrowserWindow({webPreferences: 
        {
            nodeIntegration: true
        },
        frame:false, //https://github.com/binaryfunt/electron-seamless-titlebar-tutorial
    });

    mainWindow.loadURL('http://localhost:8000/index.html');
});




/* OPEN FILE */
ipcMain.on('openFile',(event,arg)=>{
    if(arg==true){
        const files = dialog.showOpenDialogSync(mainWindow,{
            properties: ['openFile'],
            filters: [{name:'Audio', extensions:['mp3','ogg','wav','aac']}]
        });
        if(!files) return;
        console.log("FILES: " + files);
        const file = files[0];
        event.sender.send('filepathname',file);
    }
});

/* HANDLING WINDOW EVENTS*/
ipcMain.on('winmaximise',(event,arg)=>{
    if(arg==true){
        mainWindow.maximize();
        event.sender.send('toggleMaxRestoreButtons',true);
    }
});

ipcMain.on('winminimise',(event,arg)=>{
    if(arg==true){
        mainWindow.minimize();
        
    }
});

ipcMain.on('winclose',(event,arg)=>{
    if(arg==true){
        mainWindow.close();
    }
});

ipcMain.on('winrestore',(event,arg)=>{
    if(arg==true){
        mainWindow.unmaximize();
        event.sender.send('toggleMaxRestoreButtons',false);
    }
});

