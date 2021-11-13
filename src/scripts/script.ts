import Instrument from './Instrument'
import PianoRoll from './PianoRoll'

const ac = new AudioContext()

export const pianoRoll = new PianoRoll()
export const instrument = new Instrument(ac)

window.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(pianoRoll.element)
  pianoRoll.centerScroll()
})

pianoRoll.addEventListener('note', (e) => {
  if ([...instrument.notes].find((n) => n.pitch === e.detail)) return
  instrument.panic()
  instrument.noteOn(e.detail)
})

pianoRoll.addEventListener('noteOff', (e) => {
  instrument.panic()
})

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return
  const playing = instrument.notes.size > 0
  instrument.panic()
  if (playing) return
  const sheet = pianoRoll.getSheet()
  const time = ac.currentTime
  const bpm = 360
  for (const note of sheet) {
    const start = time + (note.time / bpm) * 60
    const end = time + (note.time + note.length) / (bpm / 60)
    instrument.noteOn(note.pitch, start)
    instrument.noteOff(note.pitch, end)
  }
})

pianoRoll.setSheet([
  {
    pitch: 69,
    time: 0,
    length: 5,
  },
  {
    pitch: 72,
    time: 1,
    length: 8,
  },
  {
    pitch: 76,
    time: 2,
    length: 3,
  },
  {
    pitch: 79,
    time: 3,
    length: 2,
  },
  {
    pitch: 78,
    time: 4,
    length: 4.5,
  },
  {
    pitch: 71,
    time: 11,
    length: 1,
  },
])
