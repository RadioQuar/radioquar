function updatePlayer(){

    if(!APP.nowPlaying) return;

    const song = APP.nowPlaying.now_playing.song;

    const cover = document.getElementById("rq-cover");

    const title = document.getElementById("rq-song");

    const artist = document.getElementById("rq-artist");

    if(title){

        title.textContent = song.title || "Radio Quar";

    }

    if(artist){

        artist.textContent = song.artist || "";

    }

    if(cover){

        cover.src = song.art || "assets/cover-default.jpg";

    }

}

async function refreshNowPlaying(){

    await loadNowPlaying();

    updatePlayer();

}

function initPlayer(){

    APP.audio = new Audio(
        "https://radioquar.com/listen/radio_quar/radio320.mp3"
    );

    APP.audio.preload = "none";

    const volume = document.getElementById("rq-volume");

APP.audio.volume = parseFloat(volume.value);

volume.addEventListener("input", () => {

    APP.audio.volume = parseFloat(volume.value);

});

    const button =
        document.getElementById("rq-play");

    button.onclick = async ()=>{

        if(!APP.playing){

            try{

                await APP.audio.play();

                APP.playing = true;

                button.textContent =
                    "■ FERMA RADIO QUAR";

            }catch(error){

                console.error(error);

            }

        }else{

            APP.audio.pause();

            APP.audio.currentTime = 0;

            APP.playing = false;

            button.textContent =
                "▶ ASCOLTA RADIO QUAR";

        }

    };

}

