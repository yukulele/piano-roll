import PianoRoll from './PianoRoll';

const pianoRoll = new PianoRoll();
window.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(pianoRoll.element);
});
