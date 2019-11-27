

const {ipcRenderer}=nodeRequire('electron');
//const remote = noderequire('electron').remote;

// When document has loaded, initialise
document.onreadystatechange = () => {
    if (document.readyState == "complete") {
        handleWindowControls();
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

ipcRenderer.on('filepathname',(event,data)=>{
    //console.log(data);
    var stem = $("#stemcount").attr('data-stem');
    $(".smokescreen").removeClass('hide');
    clearAudio();
    eel.sendfilename(data,stem)(removesmokescreen);
    

});

function removesmokescreen(d){
    console.log(d);
        
    $(".smokescreen").addClass('hide');
    loadAudio(d);
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

    $('.seperated-drums, .seperated-bass, .seperated-piano').addClass('hide');


}

function loadAudio(directory){
    
    $('#tunetitle').text(directory);
    $('.sperated-audio').removeClass('hide');
    let selectedStem = $("#stemcount").attr('data-stem');
    
    // create vocals and other
    window.wavevocals = getwavesurfer('#waveform-vocals');
    window.waveother = getwavesurfer('#waveform-other');

    // Load audio
    wavevocals.load(`../${directory}/vocals.mp3`);
    waveother.load(`../${directory}/other.mp3`);

    // setup icon change on play/pause events
    wavevocals.on('play', function(){
        setPauseIcon(wavevocals.mediaContainer.id.split("-")[1]);
    })
    wavevocals.on('pause', function(){
        setPlayIcon(wavevocals.mediaContainer.id.split("-")[1]);
    })
    wavevocals.on('finish', function(){
        setPlayIcon(wavevocals.mediaContainer.id.split("-")[1]);
    })

    waveother.on('play', function(){
        setPauseIcon(waveother.mediaContainer.id.split("-")[1]);
    })
    waveother.on('pause', function(){
        setPlayIcon(waveother.mediaContainer.id.split("-")[1]);
    })
    waveother.on('finish', function(){
        setPlayIcon(waveother.mediaContainer.id.split("-")[1]);
    })


    if(selectedStem > 2){
        // Show drums and bass
        $('.seperated-drums').removeClass('hide');
        $('.seperated-bass').removeClass('hide');

        // create drums and bass
        window.wavedrums = getwavesurfer('#waveform-drums');
        window.wavebass = getwavesurfer('#waveform-bass');

        // Load audio
        wavebass.load(`../${directory}/bass.mp3`);
        wavedrums.load(`../${directory}/drums.mp3`);

        //setup icon change
        wavedrums.on('play', function(){
            setPauseIcon(wavedrums.mediaContainer.id.split("-")[1]);
        })
        wavedrums.on('finish', function(){
            setPlayIcon(wavedrums.mediaContainer.id.split("-")[1]);
        })
        wavedrums.on('pause', function(){
            setPlayIcon(wavedrums.mediaContainer.id.split("-")[1]);
        })

        wavebass.on('play', function(){
            setPauseIcon(wavebass.mediaContainer.id.split("-")[1]);
        })
        wavebass.on('pause', function(){
            setPlayIcon(wavebass.mediaContainer.id.split("-")[1]);
        })
        wavebass.on('finish', function(){
            setPlayIcon(wavebass.mediaContainer.id.split("-")[1]);
        })
    }

    if(selectedStem > 4){
        // Show piano
        $('.seperated-piano').removeClass('hide');
        // create piano
        window.wavepiano= getwavesurfer('#waveform-piano');
        // Load audio
        wavepiano.load(`../${directory}/piano.mp3`);
        //setup icon change
        wavepiano.on('play', function(){
            setPauseIcon(wavepiano.mediaContainer.id.split("-")[1]);
        })
        wavepiano.on('pause', function(){
            setPlayIcon(wavepiano.mediaContainer.id.split("-")[1]);
        })
        wavepiano.on('finish', function(){
            setPlayIcon(wavepiano.mediaContainer.id.split("-")[1]);
        })
    }
}


function setPlayIcon(t){
    $(`#${t} > i:first`).removeClass('ion-ios-pause');
    $(`#${t} > i:first`).addClass('ion-ios-play');
}

function setPauseIcon(t){
    console.log("Inside setPauseIcon: " + t);
    $(`#${t} > i:first`).removeClass('ion-ios-play');
    $(`#${t} > i:first`).addClass('ion-ios-pause');
}