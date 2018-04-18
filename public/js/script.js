function storeData(userName){
    return new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                //xhttp.responseText
                var xhttp2 = new XMLHttpRequest();
                xhttp2.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        //xhttp2.responseText
                        var xhttp3 = new XMLHttpRequest();
                        xhttp3.onreadystatechange = function() {
                            if (this.readyState == 4 && this.status == 200) {
                                //xhttp3.responseText
                                resolve(1);
                            }
                        };
                        xhttp3.open("GET", "api/saveHeroTweets/"+userName, true);
                        xhttp3.send();
                    }
                };
                xhttp2.open("GET", "api/following/"+userName, true);
                xhttp2.send();
            }
        };
        xhttp.open("GET", "api/getTweets/"+userName, true);
        xhttp.send();
    });
}

let analysis = '';

function getResult(userName){
    return new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                analysis = xhttp.responseText;
                resolve(1);
            }
        };
        xhttp.open("GET", "api/result/"+userName, true);
        xhttp.send();
    });
}

function execute(){
    let userName = document.getElementById('twitterHandle').value;
    let result = document.getElementById('result');
    if(userName != ''){
        storeData(userName).then(() => {
            result.innerHTML = "<div class='notification is-success'>Result Stored Successfully!</div>";
            getResult(userName).then(() => {
                result.innerHTML += "<div class='box'>"+analysis+"</div>";
            });
        });
    } else {
        window.alert("The Twitter Handle Field is Emtpy")
    }
    return false;
}