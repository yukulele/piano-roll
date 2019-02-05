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
  private resizing: HTMLDivElement | undefined;
  private currentNote: HTMLDivElement | undefined = undefined;
  constructor() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.elms.rollViewport.addEventListener('wheel', ev => this.wheel(ev));
    this.elms._.addEventListener('mousemove', ev => this.mousemove(ev));
    this.elms._.addEventListener('mousedown', ev => this.mousedown(ev));
    this.elms._.addEventListener('mouseup', ev => this.mouseup(ev));
    this.elms._.addEventListener('contextmenu', ev => ev.preventDefault());
    this.setZoom('x', this.zoom.x);
    this.setZoom('y', this.zoom.y);
  }
  get element() {
    return this.elms._;
  }
  private setIsErasing(erasing = true) {
    this.elms._.classList.toggle('is-erasing', erasing);
  }
  private getIsErasing() {
    return this.elms._.classList.contains('is-erasing');
  }
  private updateCursor(floor = true) {
    const x = this.mouse.x / this.size.x;
    this.cursor.x = floor ? Math.floor(x) : x;
    this.cursor.y = Math.floor(this.mouse.y / this.size.y);
    this.elms._.style.setProperty('--cursor-pos', this.cursor.y.toString());
    if (this.resizing) {
      const posX = Math.max(
        floor ? 1 : 0,
        this.cursor.x - +this.resizing.style.getPropertyValue('--pos-x'),
      );

      this.resizing.style.setProperty('--width', posX.toString());
    }
    if (this.currentNote) {
      this.currentNote.style.setProperty('--pos-x', this.cursor.x.toString());
      this.currentNote.style.setProperty('--pos-y', this.cursor.y.toString());
    }
  }
  private mousemove(event: MouseEvent) {
    const rect = this.elms.rollPage.getBoundingClientRect();
    this.mouse.x = event.pageX - rect.left;
    this.mouse.y = event.pageY - rect.top;
    if (this.getIsErasing() && event.target instanceof HTMLDivElement) {
      const target = event.target.closest('.pianoroll-notes>div');
      if (target) target.remove();
    }
    this.updateCursor(!event.ctrlKey);
  }
  private mousedown(event: MouseEvent) {
    this.setIsErasing(false);
    if (event.which === 2) {
      return;
    }
    if (!(event.target instanceof HTMLDivElement)) {
      return;
    }
    if (event.which === 3) {
      this.mouseup(event);
      this.setIsErasing(true);
      this.mousemove(event);
      return;
    }
    if (event.target === this.elms.keyboard) {
      return;
    }
    let note: HTMLDivElement;
    if (event.target !== this.elms.rollPage) {
      note = event.target;
    } else {
      note = document.createElement('div');
      const resizer = document.createElement('div');
      resizer.classList.add('resizer');
      note.appendChild(resizer);
      this.elms.notes.appendChild(note);
    }
    if (note.classList.contains('resizer')) {
      this.resizing = note.parentElement as HTMLDivElement;
    }
    if (this.currentNote) this.currentNote.classList.remove('selected');
    this.currentNote = note;
    this.currentNote.classList.add('selected');
    this.elms._.classList.add(this.resizing ? 'is-resizing' : 'is-moving');
    this.mousemove(event);
  }
  private mouseup(event: MouseEvent) {
    this.setIsErasing(false);
    delete this.resizing;

    if (!this.currentNote) return;
    this.currentNote.classList.remove('selected');
    delete this.currentNote;
    this.elms._.classList.remove('is-moving', 'is-resizing');
  }
  private wheel(event: WheelEvent) {
    event.preventDefault();
    if (event.ctrlKey || event.altKey) {
      const oldCursor = Object.assign({}, this.cursor);
      if (event.ctrlKey) {
        this.setZoom('x', this.getZoom('x') + Math.sign(event.deltaY));
      }
      if (event.altKey) {
        this.setZoom('y', this.getZoom('y') + Math.sign(event.deltaY));
      }
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
