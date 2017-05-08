class Model {

  constructor() {
    this.content = [];
    this.cursor = 0;
    this.parser = new DOMParser();
    this.xhttp = new XMLHttpRequest();

    this.setBold = false;
    this.setUnderline = false;
  }

  getLength() {
    return this.content.length;
  }

  getContent() {
    return this.content.join('');
  }

  getBoldState() {
    return this.setBold;
  }

  setBoldState(state) {
    this.setBold = state;
  }

  getUnderlineState() {
    return this.setUnderline;
  }

  setUnderlinetate(state) {
    this.setUnderline = state;
  }

  update(content) {
    this.content  = content.split("<sep>");
  }

  setChar(c) {
    var i = this.cursor;
    var str = '';

    if (i > this.content.length) {
      i = this.content.length;
    }

    str = c + '"' + this.cursor.toString();

    this.cursor += 1;

    return str;
  }

  deleteChar() {
    var str = ''
    if(this.cursor > 0) {
      this.content.splice(this.cursor - 1, 1);

      str = '\b' + '"' + this.cursor.toString()

      this.cursor -= 1;
    }

    return str
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

    var changed = false;

    while(this.content[i] != null && this.content[i].startsWith("<span")) {
      if(i > this.cursor) {
        i++;
      } else {
        i--;
      }

      changed = true;
    }

    if (!changed) {
      while(this.content[i] != null && this.content[i].startsWith("</span>")) {
        if(i > this.cursor) {
          i++;
        } else {
          i--;
        }

        changed = true;
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
