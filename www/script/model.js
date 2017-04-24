class Model {

  constructor() {
    this.content = [];
    this.cursor = 0;
    this.parser = new DOMParser();
    this.xhttp = new XMLHttpRequest();
  }

  getLength() {
    return this.content.length;
  }

  getContent() {
    return this.content.join('');
  }

  setChar(c) {
    var i = this.cursor;

    if (i > this.content.length){
      i = this.content.length;
    }

    this.content.splice(i, 0, c);

    this.xhttp.open('POST', 'set', false);
    this.xhttp.send(c + '"' + this.cursor.toString());

    this.cursor += 1;
  }

  deleteChar() {
    if(this.cursor > 0){
      this.content.splice(this.cursor - 1, 1);

      this.xhttp.open('POST', 'set', false);
      this.xhttp.send('\b' + '"' + this.cursor.toString());

      this.cursor -= 1;
    }
  }

  getCursor() {
    return this.cursor;
  }

  setCursor (i) {
    if (i > this.content.length){
      i = this.content.length;
    } else if(i < 0) {
      i = 0;
    }

    this.cursor = i;
  }

  getRightBreak() {
    return this.content.indexOf("<br>", this.cursor);
  }

  getLeftBreak() {
    if(this.cursor != 0) {
      return this.content.lastIndexOf("<br>", this.cursor - 1) + 1;
    } else {
      return -1;
    }
  }

  // TODO: Move to contorller?
  getIndex(i) {
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
