import assert from 'node:assert/strict'
import {installedVoices,selectedVoice,chooseVoice} from '../jarvis-ui-preview/src/voicePreference.js'
let value=null;const storage={getItem:()=>value,setItem:(_,v)=>{value=v}}
assert.equal(selectedVoice(storage),installedVoices[0]);assert.equal(value,null)
chooseVoice(installedVoices[1],storage);assert.equal(selectedVoice(storage),installedVoices[1])
assert.throws(()=>chooseVoice('untrusted',storage));assert.equal(value,installedVoices[1])
value='invalid';assert.equal(selectedVoice(storage),installedVoices[0])
console.log('PASS voice preference: unchanged default, explicit persistent selection, invalid value rejected; no audio used')
