import concurrent.futures
from tempfile import TemporaryFile
import time
import requests
from spleeter.model.provider import get_default_model_provider


class ChunkDownload:
    """Downloads a chunk of bigger file"""
    URL = None

    def __init__(self, url, temp_file, start_byte, end_byte):
        self.URL = url
        self.temp_file = temp_file
        self.start_byte = start_byte
        self.end_byte = end_byte
        self.chunk_downloaded = 0

    def __call__(self):
        """ Making ChunkDownload object callable"""
        response = requests.get(self.URL, stream=True, headers={'Range': f'bytes={self.start_byte}-{self.end_byte}'})
        while True:
            buff = response.raw.read(100000)
            if not buff:
                break
            self.temp_file.write(buff)
            self.chunk_downloaded += len(buff)


class ModelDownloader:
    modelprovider = get_default_model_provider()
    THREADS = 8

    def __init__(self, threads=8, notifier=lambda: None):
        """
        Constructor ModelDownloader
        Parameters
        ----------
        threads : Number of threads to create (determines number of chunks/parts)
        notifier : Callable function/object to be called with progress value
        """
        self.THREADS = threads
        self.notifier = notifier
        self._chunks = []
        self.state = 0

    @property
    def notifier(self):
        return self._notifier

    @notifier.setter
    def notifier(self, fn_notify):
        if not callable(fn_notify):
            raise Exception("notifier must be callable")
        self._notifier = fn_notify

    def _geturl(self, model_name):
        return f'{self.modelprovider._host}/{self.modelprovider._repository}/{self.modelprovider.RELEASE_PATH}/{self.modelprovider._release}/{model_name}.tar.gz'

    @staticmethod
    def _getRemoteFileSize(url):
        # response = requests.head(url, allow_redirects=True)
        # if response.status_code != 200:
        response = requests.get(url, stream=True, allow_redirects=True)
        return int('0' + response.headers.get('content-length', 0))

    def notify_progress(self, name, file_size):
        """
        Runs asynchronously to notify download progress
        Parameters
        ----------
        name : model name
        file_size : total size

        Returns : None
        -------

        """
        while self.state:
            total_download = 0
            for chunk in self._chunks:
                total_download += chunk.chunk_downloaded
            percent = (total_download * 100) // file_size
            self.notifier(name, percent)
            time.sleep(0.5)

    def downloadin(self, model_name, dest):
        """
        Downloads model in a file like object dest. Note: it doesn't save any file the caller gets
        downloaded content in dest object

        Parameters
        ----------
        model_name : Name of the model to download
        dest : file like object where final downloaded file is stored

        Returns
        -------

        """
        self.state = 1
        url = self._geturl(model_name)
        file_size = self._getRemoteFileSize(url)
        total_chunks = file_size / self.THREADS

        # create chunks
        for chunk in range(self.THREADS):
            temp_file = TemporaryFile()
            start_byte = int(chunk * total_chunks)
            end_byte = int(((chunk + 1) * total_chunks) - 1)
            if chunk == self.THREADS - 1:
                end_byte = ''
            self._chunks.append(ChunkDownload(url, temp_file, start_byte, end_byte))

        # Download File in chunks via multithreading
        with concurrent.futures.ThreadPoolExecutor() as executor:
            progress_thread = executor.submit(self.notify_progress, model_name, file_size)
            chunk_download_threads = [executor.submit(chunk) for chunk in self._chunks]
            concurrent.futures.wait(chunk_download_threads)
            self.state = 0
            progress_thread.cancel()

        # Combine downloaded chunks into dest file-like object
        for chunk in self._chunks:
            chunk.temp_file.seek(0)
            while True:
                buff = chunk.temp_file.read(1024 * 1024 * 20)
                if not buff:
                    break
                dest.write(buff)
            chunk.temp_file.close()
        self.state = 0
        self._chunks.clear()
