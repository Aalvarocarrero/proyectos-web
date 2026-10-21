import io,sys,tempfile,unittest,wave
from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from local_transcription import validate_wav,LocalTranscriber
from ollama_runtime import LocalChat
from server import Store
from local_assistant import ModelReply

def wav(rate=16000,channels=1,frames=16000):
 b=io.BytesIO()
 with wave.open(b,'wb') as w:w.setnchannels(channels);w.setsampwidth(2);w.setframerate(rate);w.writeframes(b'\0\0'*frames*channels)
 return b.getvalue()

class TranscriptionTests(unittest.TestCase):
 def test_audio_contract(self):
  validate_wav(wav())
  for raw in [b'not wav',wav(44100),wav(channels=2),wav(frames=480001),wav()[:-10]]:
   with self.assertRaises(ValueError):validate_wav(raw)
 def test_temp_audio_is_cleaned_and_fixed_cli_no_shell(self):
  with tempfile.TemporaryDirectory() as tmp:
   exe=Path(tmp)/'cli';model=Path(tmp)/'model';exe.touch();model.touch();engine=LocalTranscriber(exe,model);paths=[]
   def run(args,**kwargs):
    self.assertNotIn('shell',kwargs);self.assertEqual(args[0],str(exe.resolve()));self.assertIn('es',args)
    source=Path(args[args.index('-f')+1]);paths.append(source);self.assertTrue(source.exists())
    Path(args[args.index('-of')+1]+'.txt').write_text('Prueba sintética')
    return SimpleNamespace(returncode=0)
   with patch('local_transcription.subprocess.run',side_effect=run):result=engine.transcribe(wav())
   self.assertFalse(paths[0].exists());self.assertFalse(result['audioRetained']);self.assertTrue(result['confirmationRequired'])
 def test_project_permission_review_and_no_audio_persistence(self):
  with tempfile.TemporaryDirectory() as tmp:
   store=Store(tmp)
   for pid in ['a','b']:store.mutate({'revision':store.revision(),'action':'create','entity':{'id':pid,'kind':'project','projectId':'','title':pid,'body':'','status':'pendiente','priority':'media','nextAction':''},'evidence':[]})
   calls=[]
   engine=SimpleNamespace(transcribe=lambda raw:{'transcript':'Hola','audioRetained':False,'confirmationRequired':True})
   def backend(req):calls.append(req);return ModelReply('Respuesta',False,True)
   chat=LocalChat(store,backend,engine)
   with self.assertRaises(ValueError):chat.transcribe('a',wav())
   chat.voice_permission('a',True);chat.permission('a',True)
   self.assertFalse(chat.view('b')['voiceInputAllowed']);self.assertTrue(LocalChat(store).view('a')['voiceInputAllowed'])
   before=chat.path.read_bytes();result=chat.transcribe('a',wav());self.assertEqual(chat.path.read_bytes(),before);self.assertEqual(result['projectId'],'a')
   with self.assertRaises(ValueError):chat.send('a','1','Hola',input_source='confirmed_transcript')
   response=chat.send('a','1','Hola',input_source='confirmed_transcript',transcript_confirmed=True)
   self.assertEqual(response['state'],'completed');self.assertEqual(calls[0].source,'confirmed_transcript')
   chat.voice_permission('a',False)
   with self.assertRaises(ValueError):chat.transcribe('a',wav())

if __name__=='__main__':unittest.main()
