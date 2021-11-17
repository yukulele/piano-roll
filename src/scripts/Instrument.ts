export default class Instrument {
  notes: Set<{
    pitch: number
    time: number
    osc: OscillatorNode
    gain: GainNode
  }> = new Set()

  constructor(private ac = new AudioContext()) {}

  noteOn(pitch: number, time = this.ac.currentTime) {
    const freq = 440 * 2 ** ((pitch - 69) /* A4 */ / 12)
    const gain = this.ac.createGain()
    gain.gain.value = 0.2
    const osc = this.ac.createOscillator()
    osc.frequency.value = freq
    osc.type = 'sawtooth'
    const obj = { pitch, time, osc, gain }
    gain.connect(this.ac.destination)
    osc.connect(gain)
    osc.start(time)
    osc.onended = () => {
      gain.disconnect()
      osc.disconnect()
      this.notes.delete(obj)
    }
    this.notes.add(obj)
  }

  noteOff(pitch: number, time = this.ac.currentTime) {
    const note = [...this.notes]
      .filter((note) => note.pitch === pitch && note.time < time)
      .sort((n1, n2) => n2.time - n1.time)[0]
    if (!note) return
    note.osc.stop(time)
  }

  panic() {
    this.notes.forEach((osc) => osc.osc.stop())
  }
}
