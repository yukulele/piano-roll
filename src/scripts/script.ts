import PianoRoll from './piano-roll'

const pianoRoll = new PianoRoll()
window.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(pianoRoll.element)
})
