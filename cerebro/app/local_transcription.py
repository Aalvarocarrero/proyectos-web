"""Bounded, one-shot WAV transcription with a fixed local whisper.cpp executable."""
import io
from pathlib import Path
import subprocess
import tempfile
import threading
import wave

MAX_AUDIO_BYTES = 960044

def validate_wav(raw):
    if not isinstance(raw, bytes) or not 44 <= len(raw) <= MAX_AUDIO_BYTES:
        raise ValueError('Audio vacío o superior a 30 segundos')
    try:
        with wave.open(io.BytesIO(raw), 'rb') as audio:
            if audio.getnchannels()!=1 or audio.getsampwidth()!=2 or audio.getframerate()!=16000 or audio.getcomptype()!='NONE':
                raise ValueError('Se requiere WAV PCM mono de 16 bits a 16000 Hz')
            frames=audio.getnframes()
            if not 1600 <= frames <= 480000 or len(audio.readframes(frames)) != frames*2:
                raise ValueError('Duración o contenido de audio inválido')
    except (wave.Error, EOFError):
        raise ValueError('Archivo WAV inválido') from None

class LocalTranscriber:
    def __init__(self, executable, model):
        self.executable=Path(executable).resolve();self.model=Path(model).resolve()
        if not self.executable.is_file() or not self.model.is_file():raise ValueError('Whisper local no está instalado')
        self.lock=threading.Lock()

    def transcribe(self, raw):
        validate_wav(raw)
        if not self.lock.acquire(blocking=False):raise ValueError('El transcriptor está ocupado; espere al turno actual')
        try:
            with tempfile.TemporaryDirectory(prefix='cerebro-voz-') as folder:
                source=Path(folder)/'input.wav';output=Path(folder)/'transcript'
                source.write_bytes(raw);source.chmod(0o600)
                try:
                    result=subprocess.run([str(self.executable),'-m',str(self.model),'-f',str(source),'-l','es','-otxt','-of',str(output),'-nt','-t','4'],
                                          stdin=subprocess.DEVNULL,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=90,check=False)
                except (OSError,subprocess.TimeoutExpired):raise ValueError('El transcriptor local no completó la solicitud') from None
                path=output.with_suffix('.txt')
                if result.returncode or not path.is_file():raise ValueError('No se obtuvo una transcripción local')
                text=path.read_text().strip()
                if not text or len(text)>6000:raise ValueError('Transcripción vacía o demasiado larga')
                return {'transcript':text,'locale':'es-ES','engine':'whisper.cpp base','audioRetained':False,'confirmationRequired':True}
        finally:self.lock.release()
