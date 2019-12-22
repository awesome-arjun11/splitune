

const {ipcRenderer}=nodeRequire('electron');
//const perSettings=nodeRequire('electron-settings');
const perSettings = nodeRequire('electron').remote.require('electron-settings');
//const remote = noderequire('electron').remote;

// When document has loaded, initialise
document.onreadystatechange = () => {
    if (document.readyState === "complete") {

        // Windows control (minimize,maximize,close)
        handleWindowControls();

        //Default preferences
        window.settings = perSettings.get("defaultsettings",{'separator':2,'format':'wav'});

        getModelDownloadStatus(preload = true);
        // stores current useful data for the session
        window.appdata={};

        //Chosen settings in settings menu
        discardSettings();

        //on saving settings
        $('#saveSettings').click(function () {
            window.settings.separator = $("#defseparator input[type='radio']:checked").val();
            window.settings.format = $("#defformat input[type='radio']:checked").val();
            perSettings.set("defaultsettings",window.settings);
            $('#settingsModalCenter').modal('hide');
        });
        //on exporting files
        $("#exportfiles").click(getExportDirectory);

        // closing settings menu discarding all unsaved changes
        let settingsModal = $('#settingsModalCenter');
        settingsModal.on('hidden.bs.modal', function () {
            discardSettings();
        });

        settingsModal.on('shown.bs.modal', function () {
            getModelDownloadStatus();
            $.each(window.modelStatus, function (index,val) {
                if(val){
                    $(`#download${index}`).attr("disabled", true);
                    $(`#progress${index}`).css('width',`100%`).addClass('bg-success').children('span').text(`${index} model download complete`);
                }else{
                    $(`#download${index}`).attr("disabled", false);
                    $(`#progress${index}`).css('width',`0%`).removeClass('bg-success').children('span').text(`Download ${index} model`);
                }
            })
        });
    }
};

function handleWindowControls() {

    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById('min-button').addEventListener("click", event => {
        ipcRenderer.send('winminimise',true);
    });

    document.getElementById('max-button').addEventListener("click", event => {
        ipcRenderer.send('winmaximise',true);
    });

    document.getElementById('restore-button').addEventListener("click", event => {
        ipcRenderer.send('winrestore',true);
    });

    document.getElementById('close-button').addEventListener("click", event => {
        ipcRenderer.send('winclose',true);
    });

}

ipcRenderer.on('toggleMaxRestoreButtons',(event,data)=>{
    if (data) {
        $(document.body).addClass('maximized');
    } else {
        $(document.body).removeClass('maximized');
    }
});

function openfile(){
    ipcRenderer.send('openFile',true)
}

function getExportDirectory(){
    ipcRenderer.send('exportDirectory',true)
}

ipcRenderer.on('filepathname',(event,data)=>{
    //console.log(data);
    var stem = $("#stemcount").attr('data-stem');
    $("#smokescreenModalCenter").modal("show");
    clearAudio();
    eel.splitune(data,stem)(onSpleeterRun);
});

ipcRenderer.on('directorypath',(event,data)=>{
    $("#smokescreenModalCenter").modal("show");
    eel.export(window.appdata.directory,data,window.settings.format)(removesmokescreen);
});

function onSpleeterRun(d){
    window.appdata.directory = d;
    removesmokescreen();
    $("#exportfiles").removeClass("hide");
    loadAudio(d);
}
function removesmokescreen(){
    $("#smokescreenModalCenter").modal("hide");
}

function clearAudio(){
    try{
        wavevocals.destroy();
        waveother.destroy();
        wavedrums.destroy();
        wavebass.destroy();
        wavepiano.destroy();
    }catch(err){}

    setPlayIcon('vocals');
    setPlayIcon('other');
    setPlayIcon('drums');
    setPlayIcon('bass');
    setPlayIcon('piano');
    $('#tunetitle').text("");
    $('.separated-audio').addClass('hide');
    $('.separated-drums, .separated-bass, .separated-piano').addClass('hide');
}

function loadAudio(directory){
    $('#tunetitle').text(directory);
    $('.separated-audio').removeClass('hide');
    let selectedStem = $("#stemcount").attr('data-stem');
    
    // create vocals and other
    window.wavevocals = getwavesurfer('#waveform-vocals');
    window.waveother = getwavesurfer('#waveform-other');

    // Load audio
    wavevocals.load(`../tmpsplit/${directory}/vocals.wav`);
    waveother.load(`../tmpsplit/${directory}/other.wav`);

    // setup icon change on play/pause events
    wavevocals.on('play', function(){
        setPauseIcon(wavevocals.mediaContainer.id.split("-")[1]);
    });
    wavevocals.on('pause', function(){
        setPlayIcon(wavevocals.mediaContainer.id.split("-")[1]);
    });
    wavevocals.on('finish', function(){
        setPlayIcon(wavevocals.mediaContainer.id.split("-")[1]);
    });
    waveother.on('play', function(){
        setPauseIcon(waveother.mediaContainer.id.split("-")[1]);
    });
    waveother.on('pause', function(){
        setPlayIcon(waveother.mediaContainer.id.split("-")[1]);
    });
    waveother.on('finish', function(){
        setPlayIcon(waveother.mediaContainer.id.split("-")[1]);
    });


    if(selectedStem > 2){
        // Show drums and bass
        $('.separated-drums').removeClass('hide');
        $('.separated-bass').removeClass('hide');

        // create drums and bass
        window.wavedrums = getwavesurfer('#waveform-drums');
        window.wavebass = getwavesurfer('#waveform-bass');

        // Load audio
        wavebass.load(`../tmpsplit/${directory}/bass.wav`);
        wavedrums.load(`../tmpsplit/${directory}/drums.wav`);

        //setup icon change
        wavedrums.on('play', function(){
            setPauseIcon(wavedrums.mediaContainer.id.split("-")[1]);
        });
        wavedrums.on('finish', function(){
            setPlayIcon(wavedrums.mediaContainer.id.split("-")[1]);
        });
        wavedrums.on('pause', function(){
            setPlayIcon(wavedrums.mediaContainer.id.split("-")[1]);
        });
        wavebass.on('play', function(){
            setPauseIcon(wavebass.mediaContainer.id.split("-")[1]);
        });
        wavebass.on('pause', function(){
            setPlayIcon(wavebass.mediaContainer.id.split("-")[1]);
        });
        wavebass.on('finish', function(){
            setPlayIcon(wavebass.mediaContainer.id.split("-")[1]);
        });
    }

    if(selectedStem > 4){
        // Show piano
        $('.separated-piano').removeClass('hide');
        // create piano
        window.wavepiano= getwavesurfer('#waveform-piano');
        // Load audio
        wavepiano.load(`../tmpsplit/${directory}/piano.wav`);
        //setup icon change
        wavepiano.on('play', function(){
            setPauseIcon(wavepiano.mediaContainer.id.split("-")[1]);
        });
        wavepiano.on('pause', function(){
            setPlayIcon(wavepiano.mediaContainer.id.split("-")[1]);
        });
        wavepiano.on('finish', function(){
            setPlayIcon(wavepiano.mediaContainer.id.split("-")[1]);
        });
    }
}


function setPlayIcon(t){
    $(`#${t} > i:first`).removeClass('ion-ios-pause').addClass('ion-ios-play');
}

function setPauseIcon(t){
    $(`#${t} > i:first`).removeClass('ion-ios-play').addClass('ion-ios-pause');
}


function discardSettings(){
    $('#defformat input:radio[name=defaultformat]').filter(`[value=${window.settings.format}]`).prop('checked', true);
    $('#defseparator input:radio[name=defaultseparator]').filter(`[value=${window.settings.separator}]`).prop('checked', true);
}

function preloadModel(check){
    if(check){
        eel.preloadmodel(window.settings.separator);
        //Setting selected model to preferred model
        selectStem(window.settings.separator);
    }else{
        $("settingsModalCenter").modal("show");
        alert("Default Separator Model Not Found. Download From Preference Menu.");
    }
}


async function getModelDownloadStatus(preload=false){

    if(preload){
        window.modelStatus = await eel.check_models()();
        preloadModel(window.modelStatus[`${window.settings.separator}stems`]);
    }else{
        eel.check_models()(function (status) {
            window.modelStatus = status;
        });
    }
}



