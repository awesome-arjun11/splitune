const electron = require('electron');
const url = require('url');
const path = require('path');
const ipcMain = require('electron').ipcMain;

const {app, BrowserWindow, dialog, Menu} = electron;

let mainWindow;

app.on('ready', function(){
    
    mainWindow = new BrowserWindow({webPreferences: 
        {
            nodeIntegration: true,
        },
        frame:false, //https://github.com/binaryfunt/electron-seamless-titlebar-tutorial
        icon: "web/favicons/loaderlogo.png",

    });

    mainWindow.loadURL('http://localhost:8000/index.html');
});

/* OPEN FILE */
ipcMain.on('openFile',(event,arg)=>{
    if(arg===true){
        const files = dialog.showOpenDialogSync(mainWindow,{
            properties: ['openFile'],
            filters: [{name:'Audio', extensions:['mp3','ogg','wav','aac']}]
        });
        if(!files) return;
        const file = files[0];
        event.sender.send('filepathname',file);
    }
});


/* GET EXPORT DIRECTORY */
ipcMain.on('exportDirectory',(event,arg)=>{
    if(arg===true){
        const directories = dialog.showOpenDialogSync(mainWindow,{
            properties: ['openDirectory'],
        });
        if(!directories) return;
        const directory = directories[0];
        event.sender.send('directorypath',directory);
    }
});


/* HANDLING WINDOW EVENTS*/
ipcMain.on('winmaximise',(event,arg)=>{
    if(arg===true){
        mainWindow.maximize();
        event.sender.send('toggleMaxRestoreButtons',true);
    }
});

ipcMain.on('winminimise',(event,arg)=>{
    if(arg===true){
        mainWindow.minimize();
    }
});

ipcMain.on('winclose',(event,arg)=>{
    if(arg===true){
        mainWindow.close();
    }
});

ipcMain.on('winrestore',(event,arg)=>{
    if(arg===true){
        mainWindow.unmaximize();
        event.sender.send('toggleMaxRestoreButtons',false);
    }
});

