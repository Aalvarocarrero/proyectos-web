export const installedVoices=['Reed (Español (España))','Paulina (Español (México))','Mónica (Español (España))']
const key='cerebro.nativeVoice'
export function selectedVoice(storage=globalThis.localStorage){try{const v=storage?.getItem(key);return installedVoices.includes(v)?v:installedVoices[0]}catch{return installedVoices[0]}}
export function chooseVoice(voice,storage=globalThis.localStorage){if(!installedVoices.includes(voice))throw Error('Voz no admitida');storage.setItem(key,voice)}
