class Controller {

  constructor(view, model) {
    this.view = view;
    this.model = model;

    this.setBold = false;
    this.setUnderline = false;

    this.version = 0;

    this.keyCodes = {
      BACK_SPACE:8,
      SPACE:32,
      ENTER:13,
      LEFT:37,
      RIGHT:39,
      UP:38,
      DOWN:40,
      END:35,
      HOME:36,
      TAB:9
    };
  }

  //checks for readable keys
  events(evt) {
    if (evt) {
      if (evt.charCode == this.keyCodes['ENTER']) {
        evt.preventDefault();
        this.fetch('<br>');
      } else if (evt.charCode == this.keyCodes['SPACE']) {
        this.fetch('&nbsp;');
      } else if (evt.charCode == '&'.charCodeAt(0)) {
        this.fetch('&amp;');
      } else if (evt.charCode == '<'.charCodeAt(0)) {
        this.fetch('&lt;');
      } else if (evt.charCode == '>'.charCodeAt(0)) {
        this.fetch('&gt;');
      } else if (evt.charCode == '"'.charCodeAt(0)) {
        this.fetch('&quot;');
      } else if (evt.charCode == '\''.charCodeAt(0)) {
        this.fetch('&#039;');
      } else if (evt.charCode == '\\'.charCodeAt(0)) {
        this.fetch('&#92;');
      } else {
        this.fetch(String.fromCharCode(evt.charCode));
      }
    }
  }

  //checks for spacial keys
  specialEvents(evt) {
    if (evt) {
      var shouldUpdate = true;
      if (evt.keyCode == this.keyCodes['BACK_SPACE']) {
        evt.preventDefault();
        this.fetch('\b')
        shouldUpdate = false;
      } else if(evt.keyCode == this.keyCodes['LEFT']) {
        this.leftPress();
      } else if(evt.keyCode == this.keyCodes['RIGHT']) {
        this.rightPress();
      } else if(evt.keyCode == this.keyCodes['END']) {
        this.endPress();
      } else if(evt.keyCode == this.keyCodes['HOME']) {
        this.homePress();
      } else if(evt.keyCode == this.keyCodes['TAB']) {
        evt.preventDefault();
        this.fetch('&nbsp;&nbsp;&nbsp;&nbsp;');
      } else {
        shouldUpdate = false;
      }

      if (shouldUpdate) {
        this.updateView();
      }
    }
  }

  fetch(c = ''){
    var shouldSet = true;
    var str = '"';
    if (c == '\b') {
      str = this.model.deleteChar();
      if (str == '') {
        return;
      }
    } else if(c != '') {
      str = this.model.setChar(c);
    } else {
      shouldSet = false;
    }

    var xhttp = new XMLHttpRequest();
    var self = this;
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState === XMLHttpRequest.DONE && this.status == 200) {
        self.updateModel(xhttp.responseText)
      }
    };

    if(shouldSet){
      xhttp.open("POST", "set", true);
    } else {
      xhttp.open("POST", "content", true);
    }
    xhttp.send(str + '"' + this.version.toString());
  }

  updateModel(data) {
    var json = JSON.parse(data);
    if (json.changed) {
      this.version = json.version;
      this.model.update(json.content);
      this.updateView()
    }
  }

  updateView() {
    this.view.setContent(this.model.getContent(), this.model.getIndex(this.model.getCursor()));
  }

  backspace() {
    this.model.deleteChar();
  }

  leftPress() {
    this.model.setCursor(this.model.getCursor() - 1);
  }

  rightPress() {
    this.model.setCursor(this.model.getCursor() + 1);
  }

  endPress() {
    var loc = this.model.getRightBreak();
    if(loc == -1) {
      this.model.setCursor(this.model.getLength());
    } else {
      this.model.setCursor(loc);
    }
  }

  homePress() {
    var loc = this.model.getLeftBreak();
    if(loc == -1) {
      this.model.setCursor(0);
    } else {
      this.model.setCursor(loc);
    }
  }

  tabPress() {
    this.model.setChar('&nbsp;&nbsp;&nbsp;&nbsp;');
  }

  boldButton() {
    this.setBold = !this.setBold;

    if(this.setBold) {
      document.getElementById('Bold').style.backgroundColor = 'blue';
      this.fetch("<span style='font-weight:bold'>");
    } else {
      document.getElementById('Bold').style.backgroundColor = 'green';
      this.fetch("</span>");
    }
  }

  underlineButton() {
    this.setUnderline = !this.setUnderline;
  }

  imageButtom() {
    var image_url = prompt("place image url here:");

    if (image_url != null && image_url != "") {
      if (this.imageExists(image_url)) {
        this.fetch('<img src=' + image_url + '>');
      } else {
        alert('image was not found')
      }
    }
  }

  imageExists(image_url) {
    var http = new XMLHttpRequest();

    http.open('HEAD', image_url, false);
    http.send();

    return http.status == 200;
  }
}
