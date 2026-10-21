const MAX_SPOKEN_CHARACTERS = 6000
const ERROR_CODES = new Set([
  'canceled', 'interrupted', 'audio-busy', 'audio-hardware', 'network',
  'synthesis-failed', 'synthesis-unavailable', 'language-unavailable',
  'voice-unavailable', 'text-too-long', 'invalid-argument', 'not-allowed',
])

export function getSpanishLocalVoices(synthesis) {
  try {
    return (synthesis?.getVoices?.() || []).filter(voice =>
      voice.localService === true && /^es(?:-|$)/i.test(voice.lang || '')
    )
  } catch {
    return []
  }
}

export function getSelectedProjectText(selection, projectId) {
  if (!selection || selection.isCollapsed || !selection.rangeCount) return ''
  const element = node => node?.nodeType === 1 ? node : node?.parentElement
  const recordFor = node => element(node)?.closest('.memory-record[data-project-id], .stored-message[data-project-id]')
  const anchor = recordFor(selection.anchorNode)
  const focus = recordFor(selection.focusNode)
  if (!anchor || anchor !== focus || anchor.dataset.projectId !== projectId) return ''
  const text = selection.toString().trim()
  return text.length > 0 && text.length <= MAX_SPOKEN_CHARACTERS ? text : ''
}

/**
 * Selection-only browser TTS. The caller must supply an explicitly selected
 * local Spanish voice; this adapter never opens a microphone or sends requests.
 */
export function createLocalSpeechOutput({ synthesis, Utterance, onState }) {
  let sequence = 0
  let active = null
  const report = (state, message) => onState?.({ state, message })

  function speak(text, voice) {
    if (typeof text !== 'string' || !text.trim() || text.length > MAX_SPOKEN_CHARACTERS) {
      report('error', 'Selecciona texto de un único registro; el límite es 6.000 caracteres.')
      return false
    }
    if (!voice || voice.localService !== true || !/^es(?:-|$)/i.test(voice.lang || '') || typeof Utterance !== 'function' || !synthesis?.speak) {
      report('unavailable', 'No hay una voz española declarada local disponible en este navegador.')
      return false
    }
    stop('Lectura anterior cancelada para iniciar la nueva selección.', false)
    const current = ++sequence
    let utterance
    try {
      utterance = new Utterance(text.trim())
      utterance.voice = voice
      utterance.lang = voice.lang
      active = { current, utterance }
      report('queued', `Preparando lectura seleccionada con ${voice.name || 'voz local'}.`)
      utterance.onstart = () => {
        if (active?.current === current) report('speaking', `Leyendo selección con ${voice.name || 'voz local'}, declarada local por el navegador.`)
      }
      utterance.onend = () => {
        if (active?.current !== current) return
        active = null
        report('ended', 'Lectura finalizada. No se ha verificado si el sistema procesa el audio sin conexión.')
      }
      utterance.onerror = event => {
        if (active?.current !== current) return
        active = null
        const code = ERROR_CODES.has(event?.error) ? event.error : 'error'
        report('error', `La lectura terminó con un error del sintetizador (${code}).`)
      }
      synthesis.speak(utterance)
      return true
    } catch {
      active = null
      report('error', 'No se pudo iniciar la lectura en el dispositivo.')
      return false
    }
  }

  function stop(message = 'Lectura detenida por la persona.', updateState = true) {
    if (!active) return false
    sequence++
    active = null
    try { synthesis?.cancel?.() } catch { /* keep cancellation local and best effort */ }
    if (updateState) report('stopped', message)
    return true
  }

  return { speak, stop, active: () => Boolean(active), dispose: () => stop('Lectura cancelada al salir de este proyecto.', false) }
}
