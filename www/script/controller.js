class Controller {
  constructor(view, model) {
    this.view = view;
    this.model = model;

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
      console.log(this.keyCodes)
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
      } else if(evt.keyCode == this.keyCodes['TAB']) {
        this.tabPress();
      }
    }
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
      this.model.setCursor(this.getLength());
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
}