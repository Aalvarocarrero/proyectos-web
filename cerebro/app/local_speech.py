"""Bounded local macOS speech file generation; never plays or captures audio."""
from pathlib import Path
import subprocess,tempfile,threading

class MacSpeech:
    def __init__(self,voice):
        if voice!='Reed (Español (España))':raise ValueError('Voz no admitida')
        if not Path('/usr/bin/say').is_file():raise ValueError('TTS macOS no disponible')
        self.voice=voice;self.lock=threading.Lock()
    def synthesize(self,text):
        if not isinstance(text,str) or not text.strip() or len(text)>1200:raise ValueError('Texto de voz vacío o superior a 1200 caracteres')
        if not self.lock.acquire(blocking=False):raise ValueError('La voz local está ocupada')
        try:
            with tempfile.TemporaryDirectory(prefix='cerebro-tts-') as folder:
                source=Path(folder)/'text.txt';target=Path(folder)/'speech.wav'
                source.write_text(text);source.chmod(0o600)
                try:r=subprocess.run(['/usr/bin/say','-v',self.voice,'-f',str(source),'-o',str(target),'--data-format=LEI16@16000'],stdin=subprocess.DEVNULL,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=45,check=False)
                except (OSError,subprocess.TimeoutExpired):raise ValueError('La voz local no completó la síntesis') from None
                if r.returncode or not target.is_file() or target.stat().st_size>8*1024*1024:raise ValueError('No se obtuvo audio local válido')
                return target.read_bytes()
        finally:self.lock.release()
