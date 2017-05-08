class View {

  constructor() {
    this.content = document.getElementById("content");
    this.elements = 'cursor'
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
    var element = document.getElementById('cursor');
    if(element) {
      element.parentNode.removeChild(element);
    }

    var cursorDiv = "<div id='cursor' class='cursor' style='border-color: blue;'></div>";
    content = content.slice(0, i) + cursorDiv + content.slice(i);

    this.content.innerHTML = content;
  }

}
