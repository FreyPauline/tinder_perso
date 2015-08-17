/*jslint browser: true, node: true */
/*global $, jQuery, alert*/
"use strict";
var i,
    obj,
    request,
    eventListen,
    check,
    dispatch,
    display;
/*fonction eventLinsten
event sur l'écran (click, touch, swap...)*/
eventListen = function () {
    var i = 0;

    document.getElementById('ul').addEventListener('click', function () {
        if (i === 0) {
            document.getElementById('navi').style.display = "block";
            document.getElementById('navi').style.position = "absolute";
            document.getElementById('nav').style.position = "relative";
            i += 1;
        } else {
            document.getElementById('navi').style.display = "none";
            i = 0;
        }
    });
    document.getElementById('fav').addEventListener('click', function () {
        document.getElementById('favoris').innerHTML = "";
        document.getElementById('favoris').style.display = "block";
        document.getElementById('app').style.display = "none";
        document.getElementById('blacklist').style.display = "none";
        document.getElementById('navi').style.display = "none";
        var resultStorage = JSON.parse(localStorage.tab);
        for (i = 0; i < resultStorage.length; i += 1) {
            if (resultStorage[i].like === 1) {
                document.getElementById('favoris').innerHTML += "<div id='pictureFav'><img class='image' src='" + resultStorage[i].url + "' alt='image chat'><p>Name: " + resultStorage[i].name + " Age: " + resultStorage[i].age + "</p></div>";
            }
        }
        i = 0;
    });
    document.getElementById('balck').addEventListener('click', function () {
        document.getElementById('blacklist').innerHTML = "";
        document.getElementById('blacklist').style.display = "block";
        document.getElementById('app').style.display = "none";
        document.getElementById('favoris').style.display = "none";
        document.getElementById('navi').style.display = "none";
        var resultStorage = JSON.parse(localStorage.tab);
        for (i = 0; i < resultStorage.length; i += 1) {
            if (resultStorage[i].like === 0) {
                document.getElementById('blacklist').innerHTML += "<div id='pictureFav'><img class='image' src='" + resultStorage[i].url + "' alt='image chat'><p>Name: " + resultStorage[i].name + " Age: " + resultStorage[i].age + "</p></div>";
            }
        }
        i = 0;
    });
    document.getElementById('ac').addEventListener('click', function () {
        document.getElementById('app').style.display = "block";
        document.getElementById('blacklist').style.display = "none";
        document.getElementById('favoris').style.display = "none";
        document.getElementById('navi').style.display = "none";
        i = 0;
    });
};



/*fonction check
(vérifit si les chats présents dans la liste de request sont déja dans la liste de favoris où dans la blacklist si le tableau est vide rappel request())*/
check = function (arrayRequest) {
    if (window.localStorage && window.localStorage !== null) {
        /*si le local storage est vide on envoi le tableau de requeste directement a la vue*/
        if (localStorage.tab === undefined) {
            console.log(arrayRequest);
            display(arrayRequest);
        } else {
            /*ici on compare les valeurs et on les supprime pour appeler display avec des chats qui ne se trouve pas dans le storage*/
            var resultStorage = JSON.parse(localStorage.tab),
                result = {'results': []},
                y,
                found,
                keycourant;
            /*resultStorage[0] = like
              resultStorage[1] = unlike*/
            for (i = 0; i < arrayRequest.results.length; i += 1) {
                keycourant = arrayRequest.results[i].sha1;
                found = false;
                for (y = 0; y < resultStorage.length && found === false; y += 1) {
                    if (keycourant === resultStorage[y].token) {
                        found = true;
                    }
                }
                if (found === false) {
                    result.results.push(arrayRequest.results[i]);
                }
            }

            if (result.results.length < 0) {
                document.getElementById('picture').innerHTML = "Recherche de chat en cours";
                request();
            } else {
                display(result);
            }
        }
    } else {
        console.log("le locale storage est désativé");
    }
};
/*fonction request
(recupère la liste des chats)*/
request = function () {
    document.getElementById('picture').innerHTML = "<img id='load' src='img/url.gif'><p>Recherche en cours</p>";
    var xmlhttp,
        str,
        resultRequest;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }

    xmlhttp.open("GET", "http://catinder.samsung-campus.net/proxy.php", true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState >= 1 && xmlhttp.readyState <= 3) {
            document.getElementById('picture').innerHTML = "<img id='load' src='img/url.gif'>";
        }
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById('picture').innerHTML = "";
            str = xmlhttp.responseText;
            resultRequest = JSON.parse(str);
            check(resultRequest);
        }
    };
    eventListen();
};
/*fonction dispatch
met en favoris ou backlist les chats*/
if (localStorage.tab !== undefined) {
    var tab = JSON.parse(localStorage.tab);
} else {
    var tab = [];
}
dispatch = function (sha1, picUrl, name, age, nb) {
    /*like = 1 j'aime
      like = 0 j'aime pas*/
    tab.push({
        token: sha1,
        url: picUrl,
        name : name,
        age: age,
        like: nb
    });
    obj = JSON.stringify(tab);
    localStorage.setItem("tab", obj);
};


/*fonction display
(affiche les chats de la liste dans le html et vide le tableau au fur et a mesure. une fois le tableau vide appel request())*/
display = function (arrayDisplay) {
    document.getElementById('picture').innerHTML = "";
    var buttonYes = document.getElementById('yes'),
        buttonNo = document.getElementById('no');
    if (arrayDisplay.results.length > 0) {

        document.getElementById('picture').innerHTML = "<img class='image' src='" + arrayDisplay.results[0].picUrl + "' alt='" +  arrayDisplay.results[0].sha1 + "'><p>Nom :" + arrayDisplay.results[0].name + "</p><p>Age: " + arrayDisplay.results[0].age + "</p>";

        buttonYes.onclick = function () {
            if (arrayDisplay.results.length > 0) {
                dispatch(arrayDisplay.results[0].sha1, arrayDisplay.results[0].picUrl, arrayDisplay.results[0].name, arrayDisplay.results[0].age, 1);
                arrayDisplay.results.shift();
                display(arrayDisplay);
            } else {

                request();
            }
        };

        buttonNo.onclick = function () {

            if (arrayDisplay.results.length > 0) {
                dispatch(arrayDisplay.results[0].sha1, arrayDisplay.results[0].picUrl, arrayDisplay.results[0].name, arrayDisplay.results[0].age, 0);
                arrayDisplay.results.shift();
                display(arrayDisplay);
            } else {

                request();
            }
        };

    } else {
        request();
    }
};


document.onload = request();