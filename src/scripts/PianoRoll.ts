import parseHtmlFragment from './parseHtmlFragment';
import template from './pianoRollTemplate';

type selection<T> = { [K in keyof T | '_']: HTMLElement };

export default class PianoRoll {
  private zoomFactor = 1.2;
  private zoom = { x: 0, y: 0 };
  private defaultSize = { x: 30, y: 10 };
  private size = { x: 0, y: 0 };
  private mouse = { x: 0, y: 0 };
  private cursor = { x: 0, y: 0 };
  private elms = this.selection();
  private currentNote: HTMLDivElement | undefined = undefined;
  constructor() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.elms.rollViewport.addEventListener('wheel', event =>
      this.wheel(event),
    );
    this.elms._.addEventListener('mousemove', event => this.mousemove(event));
    this.elms._.addEventListener('mousedown', event => this.mousedown(event));
    this.elms._.addEventListener('mouseup', event => this.mouseup(event));
    this.setZoom('x', this.zoom.x);
    this.setZoom('y', this.zoom.y);
  }
  get element() {
    return this.elms._;
  }
  public updateCursor() {
    this.cursor.x = Math.floor(this.mouse.x / this.size.x);
    this.cursor.y = Math.floor(this.mouse.y / this.size.y);
    this.elms._.style.setProperty('--cursor-pos', this.cursor.y.toString());
    if (this.currentNote) {
      this.currentNote.style.setProperty('--pos-x', this.cursor.x.toString());
      this.currentNote.style.setProperty('--pos-y', this.cursor.y.toString());
    }
  }
  public mousemove(event: MouseEvent) {
    const rect = this.elms.rollPage.getBoundingClientRect();
    this.mouse.x = event.pageX - rect.left;
    this.mouse.y = event.pageY - rect.top;
    this.updateCursor();
  }
  public mousedown(event: MouseEvent) {
    if (!(event.target instanceof HTMLDivElement)) {
      return;
    }
    if (event.target === this.elms.keyboard) {
      return;
    }
    const note =
      event.target !== this.elms.rollPage
        ? event.target
        : this.elms.notes.appendChild(document.createElement('div'));
    this.currentNote = note;
    this.mousemove(event);
  }
  public mouseup(event: MouseEvent) {
    delete this.currentNote;
  }
  private wheel(event: WheelEvent) {
    event.preventDefault();
    let axe: 'x' | 'y' | undefined;
    if (event.ctrlKey) {
      axe = 'x';
    } else if (event.altKey) {
      axe = 'y';
    }
    if (axe) {
      this.setZoom(axe, this.getZoom(axe) + Math.sign(event.deltaY));
      return;
    }
    this.scroll(event.deltaY * 10, event.shiftKey ? 'y' : 'x');
    this.mousemove(event);
  }
  private getZoom(axe: 'x' | 'y') {
    return this.zoom[axe];
  }
  private setZoom(axe: 'x' | 'y', zoom = 0) {
    this.zoom[axe] = zoom;
    const prop = '--zoom-' + axe;
    this.size[axe] = this.zoomToSize(axe, zoom);
    this.elms._.style.setProperty(prop, this.size[axe].toString());
    this.updateCursor();
  }
  private zoomToSize(axe: 'x' | 'y', zoom = 0) {
    return this.zoomFactor ** zoom * this.defaultSize[axe];
  }
  private sizeToZoom(axe: 'x' | 'y', size = this.defaultSize[axe]) {
    return Math.log(size / this.defaultSize[axe]) / Math.log(this.zoomFactor);
  }
  private scroll(delta: number, axe: 'x' | 'y' = 'y') {
    if (axe === 'y') {
      this.elms.viewport.scrollBy({
        top: delta,
      });
      return;
    }
    this.elms.rollViewport.scrollBy({
      left: delta,
    });
  }
  private resize() {
    this.elms._.style.setProperty(
      '--line-width',
      1 / window.devicePixelRatio + 'px',
    );
  }
  private selection() {
    return this.selectAll(
      parseHtmlFragment(template()).firstChild as HTMLElement,
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
    );
  }
  private selectAll<A>(_: HTMLElement, query: A): selection<A> {
    const ret = { _ } as selection<A>;
    for (const key in query) {
      const v = query[key];
      if (typeof v !== 'string') {
        continue;
      }
      ret[key] = _.querySelector(v) as HTMLElement;
    }
    return ret;
  }
}
