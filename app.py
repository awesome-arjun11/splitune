__author__ = "Arjun Singh"
__email__ = "awesome.arjun11@gmail.com"


import warnings
warnings.filterwarnings('ignore')

from spleeter.separator import Separator
from spleeter.utils.audio.adapter import get_default_audio_adapter
import eel
import os


eel.browsers.set_path('electron', 'node_modules/electron/dist/electron.exe')
eel.init('web')


@eel.expose
def sendfilename(audio_file, stem=2):
    if int(stem) not in (2,4,5):
        stem=2
    dirname = "_".join(audio_file.split('\\')[-1].rsplit('.',1)[0].split(' '))
    fulldirpath = os.path.join( os.path.dirname(os.path.abspath(__file__)), 'web',dirname)
    allseperators.get(int(stem),Separator('spleeter:2stems')).separate_to_file(audio_file, fulldirpath, codec='mp3')
    if int(stem) == 2:
        os.rename(os.path.join(fulldirpath,'accompaniment.mp3'),os.path.join(fulldirpath,'other.mp3'))
    return dirname







if __name__=='__main__':
	# for future ability to load model at startup
    allseperators = {
        2 : Separator('spleeter:2stems'),
        4 : Separator('spleeter:4stems'),
        5 : Separator('spleeter:5stems')
    }

    eel.start('index.html',mode='electron')


