type keyEventType = 'up' | 'down';

export default class KeyboardManager {
  private keys = new Set();
  private events: Array<{
    keyCode: string;
    type: keyEventType;
    callback: () => void;
  }> = [];
  constructor(element: GlobalEventHandlers = window) {
    element.addEventListener('keydown', event => this.keydown(event));
    element.addEventListener('keyup', event => this.keyup(event));
  }
  public isDown(keyCode: string) {
    return this.keys.has(keyCode);
  }
  public on(keyCode: string, type: keyEventType, callback: () => void) {
    this.events.push({
      keyCode,
      type,
      callback,
    });
  }
  public off(keyCode: string, type?: keyEventType, callback?: () => void) {
    for (const k in this.events) {
      const event = this.events[k];
      if (keyCode !== event.keyCode) continue;
      if (type && type !== event.type) continue;
      if (callback && callback !== event.callback) continue;
      delete this.events[k];
    }
  }
  private keydown(event: KeyboardEvent) {
    this.keys.add(event.code);
    this.emit(event.code, 'down');
  }
  private keyup(event: KeyboardEvent) {
    this.keys.delete(event.code);
    this.emit(event.code, 'up');
  }
  private emit(keyCode: string, type: keyEventType) {
    for (const event of this.events) {
      if (keyCode !== event.keyCode || type !== event.type) continue;
      event.callback();
    }
  }
}
