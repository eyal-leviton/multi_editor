class Model {

  constructor() {
    this.content = [];
    this.cursor = 0;
  }

  getContent () {
    return this.content.join("");
  }

  setChar(c) {
    i = this.cursor;

    if (i > this.content.length){
      i = this.content.length;
    }

    this.content.splice(i, 0, c) = c;
    this.cursor += 1;
  }

  deleteChar() {
    if(this.cursor > 0){
      this.content.splice(this.cursor - 1, 1);
      this.cursor -= 1;
    }
  }

  getCursor () {
    return this.cursor;
  }

  setCursor (i) {
    if (i > this.content.length){
      i = this.content.length;
    }

    this.cursor = i;
  }

  getRightBreak(){
    return this.content.indexOf("<br />", this.cursor);
  }

  getLeftBreak(){
    return this.content.lastIndexOf("<br />", this.cursor);
  }

  // TODO: Move to contorller?
  getIndex (i) {
    if (i > this.content.length){
      i = this.content.length;
    }

    var length = 0;
    for(var j=0;j<i;j++) {
      length += this.content[j].length;
    }

    return length;
  }

}
