import PianoRoll from './piano-roll'

const pianoRoll = new PianoRoll()

console.log(1,pianoRoll)
window.addEventListener('DOMContentLoaded', () => {
    console.log(pianoRoll)
  document.body.appendChild(pianoRoll.element)
})
