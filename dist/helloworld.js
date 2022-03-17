"use strict";
var testel = document.getElementById("test");
if (testel) {
    testel.innerHTML = "Hello from TypeScript!";
}
else {
    window.alert("Element with id 'test' is missing from HTML!");
}
