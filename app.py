__author__ = "Arjun Singh"
__email__ = "awesome.arjun11@gmail.com"

# TODO: Optimise Imports
import os
import sys
import requests
import shutil
import tarfile
from multiprocessing import Pool
from tempfile import TemporaryFile
import warnings

warnings.filterwarnings('ignore')
from spleeter.separator import Separator
from spleeter.model.provider import get_default_model_provider
from spleeter.utils.audio.adapter import get_default_audio_adapter
import eel


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
    empty_directory(directories['tmpsplit'])
    dirname = "_".join(audio_file.split('\\')[-1].rsplit('.', 1)[0].split(' '))
    fulldirpath = os.path.join(directories['tmpsplit'], dirname)
    allseperators.get(int(stem), Separator(resource_path('resources', '2stems.json'))).separate_to_file(audio_file, fulldirpath)
    if int(stem) == 2:
        os.rename(os.path.join(fulldirpath, f'accompaniment.wav'), os.path.join(fulldirpath, f'other.wav'))
    return dirname


@eel.expose
def preloadmodel(stem):
    """Preloads the tensorflow predictor model for faster processing

    Parameters
    ----------
    stem : str or int
    """
    global allseperators
    allseperators[int(stem)]._get_predictor()


@eel.expose
def download_with_progress(name):
    """Download models with progress

    Parameters
    ----------
    name : str
        Name of the model

    Returns
    -------

    """
    modelprovider = get_default_model_provider()
    url = f'{modelprovider._host}/{modelprovider._repository}/{modelprovider.RELEASE_PATH}/{modelprovider._release}/{name}.tar.gz'
    model_directory = os.path.join(directories['root'], modelprovider.DEFAULT_MODEL_PATH, name)
    if not os.path.exists(model_directory):
        try:
            os.makedirs(model_directory)
            response = requests.get(url, stream=True)
            total_length = int('0' + response.headers.get('content-length'))
            if response.status_code != 200:
                raise IOError(f'Resource {url} not found')
            elif total_length == 0:
                raise IOError(f'Content length {response.headers.get("content-length")} ({total_length})')
            with TemporaryFile() as stream:
                percent = -1
                while 1:
                    buff = response.raw.read(total_length // 100)
                    if not buff:
                        break
                    stream.write(buff)
                    percent += 1
                    eel.notifyprogress(name, percent)
                stream.seek(0)
                tar = tarfile.open(fileobj=stream)
                tar.extractall(path=model_directory)
                tar.close()
        except Exception as e:  # TODO: optimise exeption handling
            import shutil
            shutil.rmtree(model_directory)
            eel.errorOnDownload(name, e)
            return
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

    pool.close()
    pool.join()


def empty_directory(dir_name):
    with os.scandir(dir_name) as entries:
        for entry in entries:
            if entry.is_file() or entry.is_symlink():
                os.remove(entry.path)
            elif entry.is_dir():
                shutil.rmtree(entry.path)


def resource_path(*args):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except AttributeError:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, *args)


if __name__ == '__main__':
    # set path to electron browser. Later to be replaced by electron executable
    # eel.browsers.set_path('electron', 'path/to/electron-splitune.exe')

    eel.browsers.set_path('electron', resource_path('node_modules', 'electron', 'dist', 'electron.exe'))
    eel.init('web')
    directories = {
        'root': resource_path(""),
        'web': resource_path("web"),
        'tmpsplit': resource_path("web", "tmpsplit"),
    }
    allseperators = {
        # using explicit stem.json instead of spleeter:stem to avoid problems with pyinstaller later
        2: Separator(resource_path('resources', '2stems.json')),
        4: Separator(resource_path('resources', '4stems.json')),
        5: Separator(resource_path('resources', '5stems.json'))
    }

    eel.start('index.html', mode='electron')
