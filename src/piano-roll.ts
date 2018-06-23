import template from './piano-roll-template'

export default class PianoRoll {
  private elm = document.createRange().createContextualFragment(template()).firstChild
  constructor() {
    this.elm
  }
  get element() {
    return this.elm
  }
}
