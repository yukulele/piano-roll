type SheetNote = {
  pitch: number
  time: number
  length: number
}
type Sheet = SheetNote[]

import parseHtmlFragment from './parseHtmlFragment'
import template from './pianoRollTemplate'
export default class PianoRoll {
  private zoomFactor = 1.2
  private zoom = { x: 0, y: 0 }
  private defaultSize = { x: 30, y: 10 }
  private size = { x: 0, y: 0 }
  private mouse = { x: 0, y: 0 }
  private cursor = { x: 0, y: 0 }
  private moveOffset = 0
  private savedNoteSize = 1
  private elms = this.selection()
  private resizing: HTMLDivElement | undefined
  private currentNote: HTMLDivElement | undefined
  private delegate = new EventTarget()
  constructor() {
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this.elms.rollViewport.addEventListener('wheel', (ev) => this.wheel(ev))
    window.addEventListener('mousemove', (ev) => this.mousemove(ev))
    this.elms._.addEventListener('mousedown', (ev) => this.mousedown(ev))
    window.addEventListener('mouseup', (ev) => this.mouseup(ev))
    this.elms._.addEventListener('contextmenu', (ev) => ev.preventDefault())
    this.setZoom('x', this.zoom.x)
    this.setZoom('y', this.zoom.y)
  }

  centerScroll() {
    const vp = this.elms.viewport
    console.log(vp.scrollHeight)
    vp.scrollTop = vp.scrollHeight / 2 - vp.clientHeight / 2
    this.initNoteEvents()
  }

  private initNoteEvents() {
    let down = false
    this.elms._.addEventListener('mousedown', (e) => {
      if (e.target === this.elms.keyboard) down = true

      if (this.currentNote || down) this.noteOn(126 - this.cursor.y)
    })
    window.addEventListener('mouseup', () => {
      this.noteOff()
      down = false
    })
    window.addEventListener('mousemove', () => {
      const y =
        this.currentNote?.style?.getPropertyValue('--pos-y') || this.cursor.y
      if (this.currentNote || down) this.noteOn(126 - +y)
    })
  }

  addNote(pitch?: number, time?: number, length?: number) {
    const note = document.createElement('div')
    note.style.setProperty('--width', this.savedNoteSize.toString())
    const resizeHandle = document.createElement('div')
    resizeHandle.classList.add('resize-handle')
    note.appendChild(resizeHandle)
    this.elms.notes.appendChild(note)
    if (pitch != null)
      note.style.setProperty('--pos-y', (126 - pitch).toString())
    if (time != null) note.style.setProperty('--pos-x', time.toString())
    if (length != null) note.style.setProperty('--width', length.toString())
    return note
  }

  setSheet(sheet: Sheet) {
    this.resetSheet()
    for (const note of sheet) {
      this.addNote(note.pitch, note.time, note.length)
    }
  }

  getSheet(): Sheet {
    const notes = Array.from(this.elms.notes.children).filter(
      (elm): elm is HTMLDivElement => elm instanceof HTMLDivElement,
    )
    return notes.map((note) => ({
      pitch: 126 - +note.style.getPropertyValue('--pos-y'),
      time: +note.style.getPropertyValue('--pos-x'),
      length: +note.style.getPropertyValue('--width'),
    }))
  }

  resetSheet() {
    this.elms.notes.replaceChildren()
  }

  addEventListener(
    type: 'note' | 'noteOff',
    callback: (ev: CustomEvent<number>) => void,
  ): void {
    this.delegate.addEventListener.call(
      this.delegate,
      type,
      callback as EventListener,
    )
  }

  dispatchEvent(ev: CustomEvent<number>): boolean {
    return this.delegate.dispatchEvent.call(this.delegate, ev)
  }

  removeEventListener(
    type: 'note' | 'noteOff',
    callback: (ev: CustomEvent<number>) => void,
  ): void {
    return this.delegate.removeEventListener.call(
      this.delegate,
      type,
      callback as EventListener,
    )
  }
  private noteOn(pitch: number) {
    this.dispatchEvent(new CustomEvent('note', { detail: pitch }))
  }
  private noteOff() {
    this.dispatchEvent(new CustomEvent('noteOff'))
  }
  get element() {
    return this.elms._
  }
  private setIsErasing(erasing = true) {
    this.elms._.classList.toggle('is-erasing', erasing)
  }
  private getIsErasing() {
    return this.elms._.classList.contains('is-erasing')
  }
  private updateCursor(roundedWidth = true) {
    const x =
      (this.mouse.x - (this.resizing ? 0 : this.moveOffset)) / this.size.x
    const firstTime =
      this.currentNote?.getAttribute('style')?.match('--pos-') == null

    this.cursor.x = roundedWidth ? Math[firstTime ? 'floor' : 'round'](x) : x
    this.cursor.y = Math.floor(this.mouse.y / this.size.y)
    this.elms._.style.setProperty('--cursor-pos', this.cursor.y.toString())
    if (this.resizing) {
      const posX = Math.max(
        roundedWidth ? 1 : 0,
        this.cursor.x - +this.resizing.style.getPropertyValue('--pos-x'),
      )

      this.resizing.style.setProperty('--width', posX.toString())
      this.savedNoteSize = posX
    } else if (this.currentNote) {
      const x = Math.max(0, this.cursor.x)
      const y = this.cursor.y
      this.currentNote.style.setProperty('--pos-x', x.toString())
      this.currentNote.style.setProperty('--pos-y', y.toString())
    }
  }
  private mousemove(event: MouseEvent) {
    const rect = this.elms.rollPage.getBoundingClientRect()
    this.mouse.x = event.pageX - rect.left
    this.mouse.y = event.pageY - rect.top
    if (this.getIsErasing() && event.target instanceof HTMLDivElement) {
      const target = event.target.closest('.pianoroll-notes>div')
      if (target) target.remove()
    }
    this.updateCursor(!event.ctrlKey)
  }
  private mousedown(event: MouseEvent) {
    this.setIsErasing(false)
    if (event.button === 1 /* middle click */) {
      return
    }
    if (!(event.target instanceof HTMLDivElement)) {
      return
    }
    if (event.button === 2 /* right click */) {
      this.mouseup(event)
      this.setIsErasing(true)
      this.mousemove(event)
      return
    }
    if (!this.elms.rollPage.contains(event.target)) return
    let note: HTMLDivElement
    if (event.target !== this.elms.rollPage) {
      note = event.target
    } else {
      note = this.addNote()
    }
    if (note.classList.contains('resize-handle')) {
      note = note.parentElement as HTMLDivElement
      this.resizing = note
    }
    if (this.currentNote) this.currentNote.classList.remove('selected')
    this.currentNote = note
    this.currentNote.classList.add('selected')
    this.elms._.classList.add(this.resizing ? 'is-resizing' : 'is-moving')
    if (note === event.target)
      this.moveOffset = event.clientX - note.getBoundingClientRect().left
    this.mousemove(event)
    this.moveOffset = event.clientX - note.getBoundingClientRect().left
  }

  private mouseup(event: MouseEvent) {
    this.setIsErasing(false)
    delete this.resizing

    if (!this.currentNote) return
    this.currentNote.classList.remove('selected')
    delete this.currentNote
    this.moveOffset = 0
    this.elms._.classList.remove('is-moving', 'is-resizing')
  }
  private wheel(event: WheelEvent) {
    event.preventDefault()
    if (event.ctrlKey || event.altKey) {
      const oldCursor = Object.assign({}, this.cursor)
      if (event.ctrlKey) {
        this.setZoom('x', this.getZoom('x') + Math.sign(event.deltaY))
      }
      if (event.altKey) {
        this.setZoom('y', this.getZoom('y') + Math.sign(event.deltaY))
      }
      return
    }
    this.scroll(Math.sign(event.deltaY) * 30, event.shiftKey ? 'y' : 'x')
    this.mousemove(event)
  }
  private getZoom(axe: 'x' | 'y') {
    return this.zoom[axe]
  }
  private setZoom(axe: 'x' | 'y', zoom = 0) {
    this.zoom[axe] = zoom
    const prop = '--zoom-' + axe
    this.size[axe] = this.zoomToSize(axe, zoom)
    this.elms._.style.setProperty(prop, this.size[axe].toString())
    this.updateCursor()
  }
  private zoomToSize(axe: 'x' | 'y', zoom = 0) {
    return this.zoomFactor ** zoom * this.defaultSize[axe]
  }
  private sizeToZoom(axe: 'x' | 'y', size = this.defaultSize[axe]) {
    return Math.log(size / this.defaultSize[axe]) / Math.log(this.zoomFactor)
  }
  private scroll(delta: number, axe: 'x' | 'y' = 'y') {
    if (axe === 'y') {
      this.elms.viewport.scrollBy({
        top: delta,
      })
      return
    }
    this.elms.rollViewport.scrollBy({
      left: delta,
    })
  }
  private resize() {
    this.elms._.style.setProperty(
      '--line-width',
      Math.max(1, 1 / window.devicePixelRatio) + 'px',
    )
  }
  private selection() {
    return this.selectAll(
      parseHtmlFragment(template).firstChild as HTMLElement,
      {
        viewport: '.pianoroll-viewport',
        page: '.pianoroll-page',
        keyboard: '.pianoroll-keyboard',
        rollViewport: '.pianoroll-roll-viewport',
        rollPage: '.pianoroll-roll-page',
        rollKeys: '.pianoroll-roll-keys',
        rollTime: '.pianoroll-roll-time',
        notes: '.pianoroll-notes',
        cursor: '.pianoroll-cursor',
      },
    )
  }
  private selectAll<A extends { [key: string]: string }>(
    _: HTMLElement,
    query: A,
  ) {
    const ret = { _ } as { [K in keyof A | '_']: HTMLElement }
    for (const key in query) {
      const selector = query[key]
      if (typeof selector !== 'string') {
        continue
      }
      const elm = _.querySelector(selector)
      if (!(elm instanceof HTMLElement))
        throw `${key} (${selector}) is not an element`
      ret[key] = elm
    }
    return ret
  }
}
