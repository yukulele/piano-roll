import template from './piano-roll-template.js'
import { exportDefaultSpecifier } from 'babel-types/index.js'

export default class PianoRoll {
  private elm = parseHtmlFragment(template()).firstChild as HTMLElement
  private roll = this.elm.querySelector(
    '.pianoroll-roll-viewport'
  ) as HTMLElement
  constructor() {
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this.roll.addEventListener('wheel', event => {
      event.preventDefault()
      if (event.ctrlKey) return this.zoom(event.deltaY, 'y')
      else if (event.altKey) return this.zoom(event.deltaY, 'x')
      this.scroll(event.deltaY * 10)
    })
  }
  get element() {
    return this.elm

  }
  zoom(delta: number, axe: 'x' | 'y') {
    this.elm.style.setProperty(
      '--zoom-'+axe,
      (+this.elm.style.getPropertyValue( '--zoom-'+axe) + delta).toString()
    )
  }
  scroll(delta: number) {
    this.roll.scrollBy({
      left: delta
    })
  }
  private resize() {
    this.elm.style.setProperty(
      '--line-width',
      1 / window.devicePixelRatio + 'px'
    )
  }
}

function parseHtmlFragment(str = '') {
  var t = document.createElement('template')
  t.innerHTML = str
  return t.content.cloneNode(true)
}
