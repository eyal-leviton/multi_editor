#Multi-editor
https://docs.google.com/document/d/1SCG4KcYc_hNzz-Mb_-vy3ykq5zOAvprzA25neAXNRJg/edit?usp=sharing

##Outline
A googledoc like editor with collaboration capability.

##Stages:

###Basic editor
Implement a basic editor using HTML client side.
Use innerHTML to present the text[1].
To simplify cursor, use background color to mark where cursor is.
Use html key down/up to detect keys[2].
For each key or cursor move send to server using XMLHTTPRequest[3][4].
Server will write the keys into a file.
At this point support only left/right arrows to move.

###Advanced editor
Add buttons to modify style of selected text: color/bold/underline.
Use <Shift><Left/Right Arrow> to mark, inject correct HTML tags.

###Calibration
Workout the server side.
The server will store the document content as one large HTML string.
The cursor for each client will be based on random id taken from a cookie in the following format:
'<div id="cursor_<id>" style�>X</div>', this will also show the cursor, also give a random color for each id, so that each cursor will be in different color.
Moving the cursor will remove the div and put it in different location.
Each modification of content, including cursor move, the client will send index, bytes that are going to be replaced and bytes that are being replaced.
If server finds that bytes that are going to be replace differ at index+-10, it will reject the update request and client will revert the change because of a conflict (ignore the cursor marker).
The server will perform the modification in the document and store a list of changes, each has its own revision#.
A client will periodically poll changes since last poll, and update its view.

###Envelope
Add download support to create html document, of course this will not contain cursor locations.
Add upload support of the html document into the document.
Add authentication so each user has its own name/password, add user management capability to admin user, each user can be admin by adding attribute, store the users in XML format.
Each document created will be auto saved in server side, owned by the user that created it, a user may list documents that belongs to him, and share with other users. The permissions will be saved in XML file.

###Finishes (Score: 100)
Support <Up/Down> arrows.
Support <Shift><Up/Down>.
Support <PageUp/Down> and scrolling.
Object oriented, documentation.

###Styles
Text size?
Images?
Right/Left/Center?
Hebrew?
etc...
Encryption
Encrypt file content on server when saving using a password.

##References

[1] http://www.w3schools.com/jsref/prop_html_innerhtml.asp
[2] http://www.w3schools.com/tags/ev_onkeydown.asp
[3] https://en.wikipedia.org/wiki/XMLHttpRequest
[4] http://www.w3schools.com/xml/xml_http.asp

Helpful for learing keypress:
https://www.w3.org/2002/09/tests/keys.html
Js class:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
