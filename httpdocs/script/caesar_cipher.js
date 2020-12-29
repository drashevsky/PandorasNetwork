window.onload = function() {        //When the window loads this code will generate the key values for the caesar cipher selection
    for (var i = 0; i < 26; i++) {
        document.getElementById("key").innerHTML += "<option value='" + i + "'>" + i + "</option>\n";
    }
}

function cipher(text, key, mode) {                                //Text = text to process, key is the key to shift by, mode is decrypt if true
    text = text.toUpperCase();                                    //Convert parameter to uppercase
    if (text.length >= 1 && key >= 0 && key <= 25) {              //Sanitize input to function
        var outString = "";                                       //The return string
        if (mode) key = 26 - key;                                 //If the caesar mode is decrypt invert the key: e.g. 1 -> 25 and 10 -> 16
        for (var i = 0; i < text.length; i++) {                   //Loop thru string
            if (text.charCodeAt(i) > 64 && text.charCodeAt(i) < 91) {  //If character is A - Z encrypt it, else leave it alone
                outString += String.fromCharCode((text.charCodeAt(i) - 65 + key) % 26 + 65);
            } else {                                              //Encryption/decryption works like this:
                outString += text.charAt(i);                      //The char is subtracted from 65 to make it in the 0 - 25 range.
            }                                                     //Then the key or inverted key is added to it.
        }                                                         //Modulo is used because its remainder when the char is divided by 26 always
        return outString;                                         //results in the character, (8 / 26): 26 can't fit into 8! This is true unless the
    } else {                                                      //character + key is larger than 26, in which case modulo will return the correct
        return "Error: Bad input.";                               //wrap-around value (same as if you subtracted 26 from the number)
    }                                                             //Rest of code just returns string or error message, depending on result
}

function encrypt() {    //Gets 3 parameters from HTML page and calls crypto function, before returning result back to textarea, encrypt
    document.getElementById("text").value = cipher(document.getElementById("text").value, parseInt(document.getElementById("key").value), false);
}

function decrypt() {    //Gets 3 parameters from HTML page and calls crypto function, before returning result back to textarea, decrypt
    document.getElementById("text").value = cipher(document.getElementById("text").value, parseInt(document.getElementById("key").value), true);
}
