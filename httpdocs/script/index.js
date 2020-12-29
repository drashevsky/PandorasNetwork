window.onload = function() {
    enterNarrator();
    if (!window.location.hash) {
        window.location = window.location + '#loaded';
        window.location.reload();
    }
}

function enterNarrator() {
    document.getElementById("narrator-wrapper").style.visibility = "visible";
}

function exitNarrator() {
    document.getElementById("narrator-wrapper").style.visibility = "hidden";
}
