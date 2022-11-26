var currentTime = new Date('2022-10-01T04:00:00');
 
var statusStrom = false;
var aktuelleZeile = 0;

 function setDate() {

    //const secondHand = document.querySelector('.second-hand');
    const minsHand = document.querySelector('.min-hand');
    const hourHand = document.querySelector('.hour-hand');
    
    //console.log(currentTime)
    const now = currentTime;

    const seconds = now.getSeconds();
    const secondsDegrees = ((seconds / 60) * 360) + 90;
    //secondHand.style.transform = `rotate(${secondsDegrees}deg)`;

    const mins = now.getMinutes();
    const minsDegrees = ((mins / 60) * 360) + ((seconds/60)*6) + 90;
    minsHand.style.transform = `rotate(${minsDegrees}deg)`;

    const hour = now.getHours();
    const hourDegrees = ((hour / 12) * 360) + ((mins/60)*30) + 90;
    hourHand.style.transform = `rotate(${hourDegrees}deg)`;

    currentTime = new Date(currentTime.getTime() + 100000);

    if(now.getHours() == parseInt(document.getElementsByClassName("startZeit")[aktuelleZeile].innerText) && !statusStrom ){
        statusStrom = true;
        let port = parseInt(document.getElementsByClassName("startZeit")[aktuelleZeile].id)
        console.log("An " + now.getHours() + " port: " +  port + "aktuelleZeile " + aktuelleZeile)
        fetch('http://192.168.178.72/event?portnumber='+port+'&state=on').then((data) => console.log(data));
    }

    if(now.getHours() == parseInt(document.getElementsByClassName("endZeit")[aktuelleZeile].innerText) && statusStrom){
        statusStrom = false;
        let port = parseInt(document.getElementsByClassName("startZeit")[aktuelleZeile].id);
        aktuelleZeile++;
        if (aktuelleZeile >= parseInt(document.getElementsByClassName("startZeit").length)){
            aktuelleZeile = 0;
            console.log("Zurück auf erste Zeile")
        }
        console.log("Aus " + now.getHours() + " port "+ port + "aktuelleZeile " + aktuelleZeile);
        fetch('http://192.168.178.72/event?portnumber='+port+'&state=off').then((data) => console.log(data));
    }
}

setInterval(setDate, 100);

setDate();