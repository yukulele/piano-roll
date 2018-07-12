import template from './piano-roll-template.js'

type selection<T> = { [K in keyof T | '_']: HTMLElement }

export default class PianoRoll {
  private zoom = { x: 0, y: 0 }
  private elms = this.selection()
  constructor() {
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this.elms.rollviewport.addEventListener('wheel', event => this.wheel(event))
    this.elms._.addEventListener('mousemove', event=>this.mousemove(event))
  }
  get element() {
    return this.elms._
  }

  mousemove(event: MouseEvent) {
    
  }
  private wheel(event: WheelEvent) {
    event.preventDefault()
    let axe: 'x' | 'y' | undefined
    if (event.ctrlKey) axe = 'x'
    else if (event.altKey) axe = 'y'
    if (axe) {
      this.setZoom(axe, this.getZoom(axe) + Math.sign(event.deltaY))
      return
    }
    this.scroll(event.deltaY * 10)
  }
  private getZoom(axe: 'x' | 'y') {
    return this.zoom[axe]
  }
  private setZoom(axe: 'x' | 'y', zoom = 0) {
    this.zoom[axe] = zoom
    const prop = '--zoom-' + axe
    const value = 1.2 ** zoom
    this.elms._.style.setProperty(prop, value.toString())
  }
  private scroll(delta: number) {
    this.elms.rollviewport.scrollBy({
      left: delta
    })
  }
  private resize() {
    this.elms._.style.setProperty(
      '--line-width',
      1 / window.devicePixelRatio + 'px'
    )
  }
  private selection(){
    return this.selectAll(parseHtmlFragment(template()).firstChild as HTMLElement, {
      viewport: '.pianoroll-viewport',
      page: '.pianoroll-page',
      keyboard: '.pianoroll-keyboard',
      rollviewport: '.pianoroll-roll-viewport',
      rollpage: '.pianoroll-roll-page',
      cursor: '.pianoroll-cursor'
    })
  }
  private selectAll<A>(_: HTMLElement, query: A): selection<A> {
    var ret = { _ } as selection<A>
    for (const key in query) {
      const v = query[key]
      if (typeof v !== 'string') continue
      ret[key] = _.querySelector(v) as HTMLElement
    }
    return ret
  }
}

function parseHtmlFragment(str = '') {
  var t = document.createElement('template')
  t.innerHTML = str
  return t.content.cloneNode(true)
}
