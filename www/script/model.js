class Model {


  /**
  * Function constructor
  * create empty list for content,
  * cursor at location 0,
  * new parse and xhttp
  */
  constructor() {
    this.content = [];
    this.cursor = 0;
    this.parser = new DOMParser();
    this.xhttp = new XMLHttpRequest();
  }

  /**
  * Function getLength
  * @returns (int) content length
  */
  getLength() {
    return this.content.length;
  }

  /**
  * Function getContent
  * @returns (string) content
  */
  getContent() {
    return this.content.join('');
  }

  /**
  * Function getArray
  * @returns (list) content as list
  */
  getArray() {
    return this.content
  }

  // update content
  // receive: content (string) - new content from server
  /**
  * Function update
  * update content with giving content
  * @returns (string) content string with <sep> as seperator to
  * represent array
  */
  update(content) {
    this.content  = content.split("<sep>");
  }

  /**
  * Function setChar
  * creates string to send to server, for setting a char, and updates cursor
  * @param c (string) block of string
  * @returns (string) block of string and cursor pos.
  */
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

  /**
  * Function shouldDeleteSpan
  * check if span should be deleted
  * @return (boolean) true if span should be deleted.
  */
  shouldDeleteSpan() {
    return (this.content[this.cursor] == "</span>" && this.content[this.cursor - 1].startsWith("<span"));
  }

  /**
  * Function deleteChar
  * creates string to send to server, for deleting a char, and updates cursor
  */
  deleteChar() {
    var str = '';
    if(this.cursor > 0) {
      this.setCursor(this.cursor - 1);
      str = '\b' + '"' + (this.cursor + 1).toString();
    }

    return str
  }

  /**
  * Function getCursor
  * @returns (int) cursor position
  */
  getCursor() {
    return this.cursor;
  }

  /**
  * Function setCursor
  * set cursor location.
  * @param i (int) location to set
  */
  setCursor(i) {
    if (i > this.content.length){
      i = this.content.length;
    } else if(i < 0) {
      i = 0;
    } else if(i < this.cursor) {
      if(this.content[i] != null && (this.content[i] == "</span>" || this.content[i].startsWith("<span"))) {
        if(!this.content[i - 1].startsWith("<span")) {
          i--;
        }
      }
    } else if(i > this.cursor) {
      if(this.content[i - 1] != null && (this.content[i - 1] == "</span>" || this.content[i - 1].startsWith("<span"))) {
        if(this.content[i] != null &&this.content[i] != "</span>" && !this.content[i].startsWith("<span")) {
          i++;
        }
      }
    }

    this.cursor = i;
  }

  /**
  * Function getRightBreak
  * @returns (int) index of closest break line from the right
  */
  getRightBreak() {
    return this.content.indexOf("<br>", this.cursor);
  }

  /**
  * Function getLeftBreak
  * @returns (int) index of closest break line from the left
  */
  getLeftBreak() {
    if(this.cursor != 0) {
      return this.content.lastIndexOf("<br>", this.cursor - 1) + 1;
    } else {
      return -1;
    }
  }

  /**
  * Function getIndex
  * return "real" index of object, not the block, but the actual index of the
  * long string made from the array
  * @param i (int) index of block in array
  * @returns (int) index of block in string
  */
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

  /**
  * Function checkSpan
  * check if cursor within span
  * @param span (string) constant of span name
  * @return (boolean) is cursor within span
  */
  checkSpan(span) {
    var spanState = false;
    if(this.inClosingSpan(span)) {
      spanState = this.inOpeningSpan(span);
    }

    return spanState;
  }

  /**
  * Function inOpeningSpan
  * check if within opening span
  * @param span (string) constant of span name
  * @returns (boolean) is cursor within opening span
  */
  inOpeningSpan(span) {
    var i = this.cursor - 1;
    while(i >= 0) {
      if(this.content[i].startsWith("<span")) {
        if(this.content[i] == span) {
          return true;
        }
      }
      if(this.content[i] == "</span>") {
        return false;
      }

      i--;
    }

    return false;
  }

  /**
  * Function inClosingSpan
  * check if within closing span
  * @param span (string) constant of span name
  * @returns (boolean) is cursor within closing span
  */
  inClosingSpan(span) {
    var i = this.cursor;
    while(i < this.content.length && i > 0) {
      if(this.content[i].startsWith("<span")) {
        if(this.content[i] == span) {
          return false;
        }
      }
      if(this.content[i] == "</span>") {
        return true;
      }

      i++;
    }

    return false;
  }

  /**
  * Function shouldCloseSpan
  * check if when button to turn off span is pressed, how should it close it
  * @returns (int) code of what should happen decided by cursor location
  */
  shouldCloseSpan() {
    var code = 0;
    if(this.content[this.cursor - 1].startsWith("<span")) {
      code = 1;
    } else if(this.content[this.cursor] == "</span>") {
      code = 2;
    }

    return code;
  }

}
