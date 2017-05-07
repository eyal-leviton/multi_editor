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

  setChar(c, isDiv) {
    var i = this.cursor;
    var str = '';

    if (i > this.content.length) {
      i = this.content.length;
    }

    str = c + '"' + this.cursor.toString();

    if (!isDiv) {
      this.cursor += 1;
    }

    return str;
  }

  update(content) {
    this.content  = content.split('&');
  }

  deleteChar() {
    var str = ''
    if(this.cursor > 0){
      this.content.splice(this.cursor - 1, 1);

      str = '\b' + '"' + this.cursor.toString()

      this.cursor -= 1;
    }

    return str
  }

  getCursor() {
    return this.cursor;
  }

  setCursor (i, isLeftPress) {
    if (i >= this.content.length){
      i = this.content.length;
    } else if(i < 0) {
      i = 0;
    } else {
      while ((this.content[i].startsWith('<')) && (!this.content[i].startsWith('<\\'))) {
        if (isLeftPress) {
          i--;
        } else {
          i++;
        }
      }
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
