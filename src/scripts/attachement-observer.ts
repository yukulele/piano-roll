class attachementObserver {
  private parent = this.elm.parentElement
  constructor(private elm: Element) {
    var mu = new MutationObserver(this.observation)
    var options = { childList: true, subtree: true }
    mu.observe(document.documentElement, options)
  }
  private get isAttached(){
    return document.body.contains(this.elm)
  }
  private observation(reccords:MutationRecord[]){
    reccords.forEach(reccord=>{
      if(reccord.target.contains(this.elm)){
      }
    })
  }
}