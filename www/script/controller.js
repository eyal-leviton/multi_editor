class Controller {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    document.onkeypress = this.charKey;
    document.onkeydown = this.specialKey;
    this.keyCodes = {
      BACK_SPACE:8,
      SPACE:32,
      ENTER:13,
      LEFT:37,
      RIGHT:39,
      UP:38,
      DOWN:40,
      END:35,
      HOME:36
    };
  }

  //checks for readable keys
  events(evt) {
    if (evt) {
      if (evt.charCode == this.keyCodes['ENTER']) {
        this.model.setChar('<br />');
      } else if (evt.charCode == this.keyCodes['SPACE']) {
        this.model.setChar('&nbsp;');
      } else {
        this.model.setChar(String.fromCharCode(evt.charCode));
      }
    }
  }

  //checks for spacial keys
  specialEvents(evt) {
    if (evt) {
      if (evt.keyCode == this.keyCodes['BACK_SPACE']) {
        this.backspace();
      } else if(evt.keyCode == this.keyCodes['LEFT']) {
        this.leftPress();
      } else if(evt.keyCode == this.keyCodes['RIGHT']) {
        this.rightPress();
      } else if(evt.keyCode == this.keyCodes['END']) {
        this.endPress();
      } else if(evt.keyCode == this.keyCodes['HOME']) {
        this.homePress();
      }
    }
  }

  backspace() {
    this.model.deleteChar();
  }

  leftPress() {

  }

}
