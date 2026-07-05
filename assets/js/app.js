const APP = {

    schedule: [],

    currentProgram: null,

    nextProgram: null,

    nowPlaying: null,

    selectedDay: "LUN",

    initialized: false,

    audio: null,

podcastAudio: null,

currentPodcastButton: null,

currentPodcastUrl: null,

    playing: false,

    podcastPlaying:false,

    mode: "live"

};



function updateClock(){

    const clock=document.getElementById("rq-clock");

    if(clock){

        clock.textContent=
            new Date().toLocaleTimeString("it-IT");

    }

}

updateClock();





function initTabs(){

    const tabs = document.querySelectorAll(".rq-tab");

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            tabs.forEach(t => t.classList.remove("active"));

            tab.classList.add("active");

            APP.selectedDay = tab.dataset.day;

            renderSchedule();

        });

    });

}

/* ==========================================================
   SELECT TODAY
========================================================== */

function selectToday() {

    const giorni = [

        "DOM",

        "LUN",

        "MAR",

        "MER",

        "GIO",

        "VEN",

        "SAB"

    ];

    const oggi =

        giorni[new Date().getDay()];

    const tabs =

        document.querySelectorAll(".rq-tab");

    tabs.forEach(tab => {

        tab.classList.remove("active");

        if (tab.dataset.day === oggi) {

            tab.classList.add("active");

            APP.selectedDay = oggi;

        }

    });

}











/* ==========================================================
   AZURACAST SERVICE
========================================================== */








/* ==========================================================
   PODCAST REST API
========================================================== */




/* ==========================================================
   RENDER PODCAST
========================================================== */

function renderPodcasts(podcasts){

    const slider =
        document.getElementById(
            "rq-podcast-slider"
        );

    if(!slider) return;

    slider.innerHTML = "";

    podcasts.forEach(podcast=>{

        const cover =
            podcast.meta.cover_image ||
            "assets/podcast-placeholder.jpg";

        const title =
            podcast.title.rendered
            .replace(
                /^S\d+E\d+\s*[-–]\s*/i,
                ""
            );

        const audio =
            podcast.meta.audio_file || "";

        slider.innerHTML += `

            <article class="rq-podcast-card">

                <div class="rq-podcast-cover">

                    <img
                        src="${cover}"
                        alt="${title}">

                </div>

                <div class="rq-podcast-body">

                    <h3 class="rq-podcast-title">

                        ${title}

                    </h3>

                    <button
                        class="rq-podcast-play"
                        type="button"
                        data-audio="${audio}"
                        data-cover="${cover}"
                        data-title="${title}">

                        ▶ Ascolta

                    </button>

                </div>

            </article>

        `;

    });

    initPodcastButtons();

}



/* ==========================================================
   PODCAST BUTTONS
========================================================== */

function initPodcastButtons(){

    document
        .querySelectorAll(".rq-podcast-play")
        .forEach(button=>{

            button.onclick = ()=>{

                PodcastPlayer.play(button);

            };

        });

}



/* ==========================================================
   PODCAST PLAYER
========================================================== */

const PodcastPlayer = {

    audio: new Audio(),

    currentButton: null,

    currentTitle: "",

    currentCover: "",

    currentUrl: "",

    playing: false,

    play(button){

        const url = button.dataset.audio;

        if(!url){

            alert("Podcast non disponibile.");

            return;

        }

        /* stesso podcast */

        if(this.currentUrl === url){

            if(this.playing){

                this.pause();

            }else{

                this.resume();

            }

            return;

        }

        /* ferma radio */

        if(APP.playing){

            APP.audio.pause();

            APP.audio.currentTime = 0;

            APP.playing = false;

            document.getElementById("rq-play").textContent =
                "▶ ASCOLTA RADIO QUAR";

        }

        /* ripristina pulsante precedente */

        if(this.currentButton){

            this.currentButton.textContent =
                "▶ Ascolta";

        }

        this.currentButton = button;

        this.currentUrl = url;

        this.currentTitle = button.dataset.title;

        this.currentCover = button.dataset.cover;

        this.audio.pause();

        this.audio.src = url;

        this.audio.currentTime = 0;

        this.audio.play();

        this.playing = true;

        this.showMiniPlayer();

        button.textContent =
            "⏸ Pausa";

        

        this.audio.onended = ()=>{

            this.stop();

        };

    },



    pause(){

        this.audio.pause();

        this.playing = false;

        if(this.currentButton){

            this.currentButton.textContent =
                "▶ Riprendi";

        }

        document
            .getElementById("rq-podcast-play")
            .textContent =
            "▶ Riprendi";

    },



    resume(){

    this.audio.play();

    this.playing = true;

    if(this.currentButton){

        this.currentButton.textContent =
            "⏸ Pausa";

    }

    document
        .getElementById("rq-podcast-play")
        .textContent =
        "⏸ Pausa";

},


    stop(){

        this.audio.pause();

        this.audio.currentTime = 0;

        this.audio.src = "";

        this.playing = false;

        this.currentUrl = "";

        if(this.currentButton){

            this.currentButton.textContent =
                "▶ Ascolta";

        }

        this.currentButton = null;

         this.currentTitle = "";

         this.currentCover = "";

        document
            .getElementById("rq-podcast-player")
            .classList.add("hidden");

    },



    showMiniPlayer(){

        document
            .getElementById("rq-podcast-player")
            .classList.remove("hidden");

        document
            .getElementById("rq-podcast-title")
            .textContent =
            this.currentTitle;

        document
            .getElementById("rq-podcast-cover")
            .src =
            this.currentCover;

        document
            .getElementById("rq-podcast-play")
            .textContent =
            "⏸ Pausa";

    }

};





 

async function boot(){

    updateClock();

    initTabs();

    selectToday();

    initPlayer();

    PodcastSlider.init();

    // Carica subito il player
    await loadNowPlaying();

    updatePlayer();

await loadPodcasts();

    // Carica il palinsesto in background
    loadWeekSchedule().then(() => {

        renderSchedule();

        updateNextProgram();

    });

    setInterval(updateClock, 1000);

    setInterval(async () => {

        await refreshNowPlaying();

        updateNextProgram();

        renderSchedule();

    }, 15000);

}

// boot();


