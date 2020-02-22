__author__ = "Arjun Singh"
__email__ = "awesome.arjun11@gmail.com"

# TODO: Optimise Imports
import os
import sys
import shutil
import tarfile
from gevent.pool import Pool
from tempfile import TemporaryFile
import warnings
import traceback

warnings.filterwarnings('ignore')
from spleeter.separator import Separator
from spleeter.model.provider import get_default_model_provider
from spleeter.audio.adapter import get_default_audio_adapter
import eel

from downloader import ModelDownloader


@eel.expose
def splitune(audio_file, stem=2):
    """Splits a audio file into vocals and various accompaniments depending on spleeter model

    Parameters
    ----------
    audio_file : str
        file path to audio file
    stem : str or int
        separator model. Can be 2,4 or 5.

    Returns
    -------
    str
        path where wav files are stored

    """
    if int(stem) not in (2, 4, 5):
        stem = 2
    shutil.rmtree(directories['tmpsplit'])
    dirname = os.path.splitext(os.path.basename(audio_file))[0]
    print(f"file: {audio_file}\nname: {dirname}")
    fulldirpath = os.path.join(directories['tmpsplit'], dirname)
    try:
        allseperators.get(int(stem), Separator(resource_path('resources', '2stems.json'))).separate_to_file(audio_file, directories['tmpsplit'])
        if int(stem) == 2:
            os.rename(os.path.join(fulldirpath, f'accompaniment.wav'), os.path.join(fulldirpath, f'other.wav'))
            eel.addNotification(f"Tune Separated Successfully ({stem}stems model)", "success")
        return dirname
    except Exception as e:
        eel.addNotification(str(e), "danger")
        eel.alphaDebug(traceback.format_exc())


@eel.expose
def preloadmodel(stem):
    """Preloads the tensorflow predictor model for faster processing

    Parameters
    ----------
    stem : str or int
    """
    global allseperators
    try:
        allseperators[int(stem)]._get_predictor()
    except ValueError as e:
        # when directory exists but model is corrupted or non existent
        shutil.rmtree(f"pretrained_models/{stem}stems", ignore_errors=True)


@eel.expose
def download_with_progress(name):
    downloader = ModelDownloader(notifier=eel.notifyprogress)
    model_directory = os.path.join(directories['root'], downloader.modelprovider.DEFAULT_MODEL_PATH, name)
    print(model_directory)
    if not os.path.exists(model_directory):
        os.makedirs(model_directory, exist_ok=True)
        try:
            with TemporaryFile() as dest:
                downloader.downloadin(name, dest)
                dest.seek(0)
                tar = tarfile.open(fileobj=dest)
                tar.extractall(path=model_directory)
                tar.close()
        except Exception as e:
            shutil.rmtree(model_directory, ignore_errors=True)
            eel.errorOnDownload(name, e)
            eel.alphaDebug(traceback.format_exc())
            return
    eel.addNotification(f"{name} model downloaded", "success")
    eel.notifyprogress(name, 100)


def model_exists(separator):
    # TODO: MODEL INTEGRITY CHECKS WITH CHECKSUM
    separator = str(separator)
    if len(separator) == 1:
        separator = separator + "stems"
    modelprovider = get_default_model_provider()
    model_directory = os.path.join(directories['root'], modelprovider.DEFAULT_MODEL_PATH, f"{separator}")
    return os.path.exists(model_directory)


@eel.expose
def check_models():
    status = {}
    for model in ('2stems', '4stems', '5stems'):
        status[model] = model_exists(model)
    return status


@eel.expose
def export(srcdirname, destination_dir, format='mp3'):
    """Exports separated music into wav or mp3

    Parameters
    ----------
    srcdirname : str
        Source Directory containing separated files
    destination_dir: str
        Destination directory
    format : {'wav','mp3'}
        File formats (codecs)
    """
    destination_dir = os.path.join(destination_dir, srcdirname)
    os.makedirs(destination_dir, exist_ok=True)
    audio_adapter = get_default_audio_adapter()
    pool = Pool()
    for track in ('vocals.wav', 'other.wav', 'bass.wav', 'drums.wav', 'piano.wav'):
        filepath = os.path.join(directories['tmpsplit'], srcdirname, track)
        if os.path.exists(filepath):
            if format == 'wav':
                shutil.copy2(filepath, destination_dir)
            else:
                data = list(audio_adapter.load(filepath))
                instrument = track.split('.')[0]
                pool.apply_async(audio_adapter.save,
                                 (os.path.join(destination_dir, f'{instrument}.mp3'),
                                  *data,
                                  'mp3',
                                  '128k'))

    pool.join()
    eel.addNotification(f"Exported {format} files to {destination_dir}", "success")


def resource_path(*args):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except AttributeError:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, *args)


if __name__ == '__main__':
    eel.browsers.set_path('electron', resource_path('node_modules', 'electron', 'dist', 'electron.exe'))
    eel.init('web')
    directories = {
        'root': resource_path(""),
        'web': resource_path("web"),
        'tmpsplit': resource_path("web", "tmpsplit"),
    }
    os.makedirs(directories['tmpsplit'], exist_ok=True)
    os.environ['MODEL_PATH'] = os.path.join(directories['root'], 'pretrained_models')
    allseperators = {
        # using explicit stem.json instead of spleeter:stem to avoid problems with pyinstaller later
        2: Separator(resource_path('resources', '2stems.json')),
        4: Separator(resource_path('resources', '4stems.json')),
        5: Separator(resource_path('resources', '5stems.json'))
    }
    eel.start('index.html', mode='electron')


