class View {

  constructor() {
    document.body.innerHTML = "<div id='content'>" +
    "<div id='cursor' class='cursor' style='border-color: blue;'></div>" +
    "</div>";
    this.content = document.getElementById("content");
  }

  loadXMLDoc() {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState === XMLHttpRequest.DONE && this.status == 200) {
          document.getElementById("content").innerHTML = xhttp.responseText;
        }
      };
      xhttp.open("GET", "content", false);
      xhttp.send();
    }

  setContent(content, i) {
    this.loadXMLDoc()
    this.setCursor(i, true);
  }

  setCursor(i, changed=false) {
    if(changed){
      var element = document.getElementById('cursor');
      if(element){
        element.parentNode.removeChild(element);
      }
      var cursorDiv = "" +
      "<div id='cursor' class='cursor' style='border-color: blue;'></div>";
      this.content.innerHTML = this.content.innerHTML.slice(0, i) + cursorDiv +
      this.content.innerHTML.slice(i);
    }
  }
}
