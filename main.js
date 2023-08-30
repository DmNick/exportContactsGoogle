// ==UserScript==
// @name         Eksport kontaktów2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Eksport kontaktów googla do CSV, klawisz pojawi się po prawej na dole.
// @author       Dominik Banik dominik.banik@ekookna.pl
// @match        https://contacts.google.com/label/*
// @match        https://contacts.google.com/directory
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==
/* global $ */

(function() {
    'use strict';
    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    function format(el) {
        el = el.replace(/[^0-9.]/g, '');
        el = el.replace(/^0048|^48/g, '');
        el = el.replace(' ','');
        return el;
    }


    let loadData = async (div) => new Promise((myResolve,myReject) => {


        var x = 0;
        var tid = setInterval(()=>{
            if (div.firstChild.childNodes[1].innerText != null) {
                clearInterval(tid);
                //console.log("wczytano diva");
                myResolve(true);

            }
            if (x > 40){
                clearInterval(tid);
                console.log("Przekroczono limit czasu dla: "+div);
                myReject(false);
            }
            x++;
        }, 500);

    });

    async function loadScreen() {
        await sleep(1000);
        document.querySelectorAll(".ZvpjBb.C8Dkz")[0].querySelectorAll(".XXcuqd").forEach((el,index)=>{
            loadData(el).then(()=>{
                //console.log("wczytano loadData");
                el.firstChild.style.backgroundColor = "red";
                //console.log(el);
                //el.firstChild.style.backgroundColor = "red";
                let name = el.firstChild.childNodes[1].innerText;
                let email = el.firstChild.childNodes[2].innerText;
                let phone = format(el.firstChild.childNodes[3].innerText);

                let uwagi = '';
                if(phone.length>9){
                    uwagi = "UWAGA";
                }
                let contact =
                    name + "," + email + "," + phone + "," + uwagi + "\r\n";
                if (!phone || phone === null || phone === '') {
                    return;
                }
                if (!window.exportedContactsStorage.includes(contact)) {
                    window.exportedContactsStorage.push(contact);
                }
                console.log(contact);
            });
        });
    }

    async function main(){
        let naglowki = "Name,E-mail 1 - Value,Phone 1 - Value,Uwagi\r\n";
        window.exportedContactsStorage = [];
        exportedContactsStorage.push(naglowki);
        window.scroller = document.querySelectorAll(".ZvpjBb.C8Dkz")[0].parentElement.parentElement.parentElement.parentElement.parentElement;
        //console.log(scroller);
        //scroller.scrollTo(0, 0);
        //await sleep(1500);
        do {
            await sleep(2000);
            loadScreen().then(()=>{

                scroller.scrollTo({
                    top: scroller.scrollTop + 800,
                    behavior: "smooth",
                });
                console.log("Wczytywanie: ",scroller.scrollTop.toString() +"/" +scroller.scrollHeight.toString() +" = " +((scroller.scrollTop / scroller.scrollHeight) * 100).toString() +"%");
                document.querySelector("#pobierzCSV").innerHTML = (Math.round(((scroller.scrollTop / scroller.scrollHeight) * 100)).toString() + "%");
            })
        } while (scroller.scrollHeight - scroller.scrollTop > document.body.scrollHeight)
        //loadScreen();
            await sleep(5000);
        console.log(window.exportedContactsStorage);

        let text = '';
        exportedContactsStorage.forEach((el,index) => {
            text += el;
        });
        var blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
        var linkhref = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.innerHTML = "Pobierz";
        link.setAttribute("href", linkhref);
        link.setAttribute("download", "Eko-Okna Kontakty.csv");
        link.style.position = "fixed";
        link.style.bottom = "50px";
        link.style.right = "50px";
        link.style.zIndex = "1001";
        document.querySelector("#pobierzCSV").remove();
        document.body.appendChild(link); // Required for FF
    }

    function init(){
        if (window.trustedTypes && window.trustedTypes.createPolicy) {
            window.trustedTypes.createPolicy('default', {
                createHTML: (string, sink) => string
            });
        }

        var buttonDiv = document.body.appendChild(document.createElement("button"));
        buttonDiv.style.position = "fixed";
        buttonDiv.style.bottom = "50px";
        buttonDiv.style.right = "50px";
        buttonDiv.style.zIndex = "1001";
        buttonDiv.id = "pobierzCSV";
        buttonDiv.innerHTML = `<p>Eksportuj do CSV</p>`;
        buttonDiv.addEventListener("click",main);
    }


    init();
    // Your code here...
})();
