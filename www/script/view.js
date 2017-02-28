class View {

  constructor() {
    document.body.innerHTML = "<div id='content'></div>";
    this.content = document.getElementById("content");
    this.cursor = 0;
  }

  setContent(content) {
    this.content.innerHTML = content;
    this.setCursor(this.cursor, true);
  }

  setCursor(i, changed=false) {
    if(i != this.cursor || changed){
      this.content.removeElement(document.getElementById("cursor"));
      var cursorDiv = '<div id="cursor" class="cursor" style="border-color: blue;"></div>';
      this.content = this.content.slice(0, i) + cursorDiv + this.content.slice(i);
      this.cursor = i;
    }
  }

}
