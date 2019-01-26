export default class AttachementObserver {
  private parent = this.elm.parentElement;
  constructor(private elm: Element) {
    const mu = new MutationObserver(this.observation);
    const options = { childList: true, subtree: true };
    mu.observe(document.documentElement, options);
  }
  private get isAttached() {
    return document.body.contains(this.elm);
  }
  private observation(records: MutationRecord[]) {
    records.forEach(record => {
      if (record.target.contains(this.elm)) {
        // TODO
      }
    });
  }
}
