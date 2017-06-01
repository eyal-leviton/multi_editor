class Controller {
  /**
  * Function constructor
  * @param view (object) view
  * @param model (object) model
  * set version to 0
  * span dict of {NAME, [SHOULD LIT BUTTON, SPAN]}
  * keyCodes constants
  */
  constructor(view, model) {
    this.view = view;
    this.model = model;

    this.version = 0;

    this.span = {
      BOLD:[false, "<span style='font-weight:bold'>"],
      UNDERLINE:[false, "<span style='text-decoration: underline;'>"],
      BLUE:[false, "<span style='color:blue'>"],
      RED:[false, "<span style='color:red'>"],
      GREEN:[false, "<span style='color:green'>"]
    };

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

  /**
  * Function events
  * checks for readable key press events
  */
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

  /**
  * Function specialEvents
  * checks for spacial keys press events
  */
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
  
	fireFoxEvents(evt) {
		if (evt) {
			var shouldUpdate = true;
			var specialEvents = false;
		  if (evt.keyCode == this.keyCodes['BACK_SPACE']) {
			evt.preventDefault();
			this.fetch('\b')
			shouldUpdate = false;
			specialEvents = true;
		  } else if(evt.keyCode == this.keyCodes['LEFT']) {
			this.leftPress();
			specialEvents = true;
		  } else if(evt.keyCode == this.keyCodes['RIGHT']) {
			this.rightPress();
			specialEvents = true;
		  } else if(evt.keyCode == this.keyCodes['END']) {
			this.endPress();
			specialEvents = true;
		  } else if(evt.keyCode == this.keyCodes['HOME']) {
			this.homePress();
			specialEvents = true;
		  } else if(evt.keyCode == this.keyCodes['TAB']) {
			evt.preventDefault();
			this.fetch('&nbsp;&nbsp;&nbsp;&nbsp;');
			specialEvents = true;
		  } else {
			shouldUpdate = false;
		  }

		  if (shouldUpdate) {
			this.updateView();
		  }
		  
		  if (specialEvents) {
			  return;
		  }
			var code = evt.keyCode ? evt.keyCode : evt.which;
		if (code == this.keyCodes['ENTER']) {
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

  /**
  * Function fetch
  * fetch content from server and setting client local content it if needed
  * @param c (string) char to set in server, if empty fetch() will not set
  * content
  * @param spanloc (int) location of span needed to be deleted, if spanloc
  * is -1 than no spans are needed to be deleted
  */
  fetch(c = '', spanloc = -1){
    var shouldSet = true;
    var eraseSpan = false;
    var str = '"';
    // if char is '\b ' delete char
    if (c == '\b') {
      if (spanloc == -1) {
        // if span should be deleted, server will delete it.
        if(this.model.shouldDeleteSpan()) {
          this.fetch('\b', this.model.getCursor());
          this.fetch('\b', this.model.getCursor());
          return
        }
        str = this.model.deleteChar();
        if (str == '') {
          return;
        }
      } else {
        str = '\b' + '"' + (spanloc).toString();
      }
    //else set char
    } else if(c != '') {
      str = this.model.setChar(c);
    // only fetch content, do not set
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

  /**
  * Function updateModel
  * updates model with givin data
  * @param data (JSON) contains: version of server, content, and whether
  * content has changed or not.
  */
  updateModel(data) {
    var json = JSON.parse(data);
    if (json.changed) {
      this.version = json.version;
      this.model.update(json.content);
      this.updateView()
    }
  }

  /**
  * Function updateView
  * updates view with content in model
  */
  updateView() {
    this.updateSpans();
    this.view.setContent(this.model.getContent(), this.model.getIndex(this.model.getCursor()));
  }

  /**
  * Function updateSpans
  * update buttons to lit or turn off, depends on cursor location
  */
  updateSpans() {
    var spanKeys = Object.keys(this.span);
    for(var i=0;i<spanKeys.length;i++) {
      var shouldChange = this.model.checkSpan(this.span[spanKeys[i]][1]);
      if(shouldChange != this.span[spanKeys[i]][0]) {
        this.setState(spanKeys[i]);
      }
    }
  }

  /**
  * Function leftPress
  * set cursor 1 block to the left
  */
  leftPress() {
    this.model.setCursor(this.model.getCursor() - 1);
  }

  /**
  * Function rightPress
  * set cursor 1 block to the right
  */
  rightPress() {
    this.model.setCursor(this.model.getCursor() + 1);
  }

  /**
  * Function endPress
  * set cursor to the end of the line
  */
  endPress() {
    var loc = this.model.getRightBreak();
    if(loc == -1) {
      this.model.setCursor(this.model.getLength());
    } else {
      this.model.setCursor(loc);
    }
  }

  /**
  * Function homePress
  * set cursor to the start of the line
  */
  homePress() {
    var loc = this.model.getLeftBreak();
    if(loc == -1) {
      this.model.setCursor(0);
    } else {
      this.model.setCursor(loc);
    }
  }

  /**
  * Function tabPress
  * create four spaces within one block
  */
  tabPress() {
    this.model.setChar('&nbsp;&nbsp;&nbsp;&nbsp;');
  }

  /**
  * Function buttonPress
  * check if button can be pressed, if it can, changes it indication state
  * @param key (string) constant of button name
  */
  buttonPress(key) {
    var spanKeys = Object.keys(this.span);
    var i = 0;
    var toChange = true;
    while(i < spanKeys.length) {
      if(spanKeys[i] != key && this.span[spanKeys[i]][0]) {
        toChange = false;
      }
      i++;
    }

    if(toChange) {
      this.setState(key);
      if(this.span[key][0]) {
        this.fetch(this.span[key][1]);
        this.fetch("</span>");
        this.leftPress();
      } else {
        var code = model.shouldCloseSpan();
        if(code == 1) {
          this.leftPress();
        } else if (code == 2){
          this.rightPress();
        } else {
          this.fetch("</span>");
          this.fetch(this.span[key][1]);
          this.leftPress();
        }
      }
    }
  }

  /**
  * Function boldButton
  * check if bold button state can be changed
  */
  boldButton() {
    this.buttonPress('BOLD');
  }

  /**
  * Function underlineButton
  * check if underline button state can be changed
  */
  underlineButton() {
    this.buttonPress('UNDERLINE')
  }

  /**
  * Function redButton
  * check if red button state can be changed
  */
  redButton() {
    this.buttonPress('RED');
  }

  /**
  * Function greenButton
  * check if green button state can be changed
  */
  greenButton() {
    this.buttonPress('GREEN');
  }

  /**
  * Function blueButton
  * check if blue button state can be changed
  */
  blueButton() {
    this.buttonPress('BLUE');
  }

  /**
  * Function setState
  *  changes the state of a button from lit to turn off and the other way
  * around
  * @param key (string) constant of button name
  */
  setState(key) {
    this.span[key][0] = !this.span[key][0];

    if(this.span[key][0]) {
      document.getElementById(key).style.backgroundColor = 'blue';
    } else {
      document.getElementById(key).style.backgroundColor = 'green';
    }
  }

}
