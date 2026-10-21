import sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from local_speech import MacSpeech
class SpeechTests(unittest.TestCase):
 def test_bounded_fixed_voice_temp_removed_no_playback(self):
  with patch('local_speech.Path.is_file',return_value=True):speech=MacSpeech('Reed (Español (España))')
  paths=[]
  def run(args,**kwargs):
   self.assertEqual(args[:3],['/usr/bin/say','-v','Reed (Español (España))']);self.assertIn('-o',args);self.assertNotIn('shell',kwargs)
   target=Path(args[args.index('-o')+1]);target.write_bytes(b'RIFFfixture');paths.append(target);return SimpleNamespace(returncode=0)
  with patch('local_speech.subprocess.run',side_effect=run):self.assertEqual(speech.synthesize('Texto ficticio'),b'RIFFfixture')
  self.assertFalse(paths[0].exists())
  for text in ['', 'a'*1201,None]:
   with self.assertRaises(ValueError):speech.synthesize(text)
 def test_voice_is_fixed(self):
  with self.assertRaises(ValueError):MacSpeech('untrusted')
