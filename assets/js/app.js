

/* ==========================================================
   RADIO QUAR 2.0
   BUILD 004.6
========================================================== */

const API = {

    nowPlaying: "https://radioquar.com/api/nowplaying/radio_quar",

    schedule: "https://radioquar.com/api/station/1/schedule"

};

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



function renderSchedule(){

    const container = document.getElementById("rq-schedule");

    if(!container) return;

    container.innerHTML = "";

    const shows = APP.schedule.filter(show =>
        show.day === APP.selectedDay
    );

    const live = getLiveProgram();

    const todayName = [
        "DOM",
        "LUN",
        "MAR",
        "MER",
        "GIO",
        "VEN",
        "SAB"
    ][new Date().getDay()];

    const showLiveBadges =
        APP.selectedDay === todayName;

    shows.forEach(show => {

let stateClass = "";
let stateLabel = "";

if(showLiveBadges){

    if(live.current && show.id === live.current.id){

        stateClass = " live";
        stateLabel =
            '<div class="rq-state rq-state-live">● ORA IN ONDA</div>';

    }else if(live.next && show.id === live.next.id){

        stateClass = " next";
        stateLabel =
            '<div class="rq-state rq-state-next">○ PROSSIMO</div>';

    }

}

        container.innerHTML += `

           <div class="rq-show${stateClass}"> 

                <div class="rq-time">

                    ${show.start}

                </div>

                <div class="rq-program">

    ${stateLabel}

    <div class="rq-program-title">

        ${show.title}

    </div>

                    <div class="rq-program-speaker">

                        ${show.speaker ? "con " + show.speaker : ""}

                    </div>

                </div>

                <div class="rq-star">☆</div>

            </div>

        `;

    });

}


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




function toMinutes(time){

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;

}


function getCurrentProgram(){

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    const shows = APP.schedule.filter(show => 
        show.day === APP.selectedDay
    );

    let current = null;
    let next = null;

    for(let i = 0; i < shows.length; i++){

        const show = shows[i];

        let start = toMinutes(show.start);
        let end = toMinutes(show.end);

        // Programma che termina dopo mezzanotte
        if(end < start){
            end += 1440;
        }

        let nowValue = currentMinutes;

        if(nowValue < start && end > 1440){
            nowValue += 1440;
        }

        if(nowValue >= start && nowValue < end){

            current = show;
            next = shows[i + 1] || null;

            break;

        }

    }

    return {
        current,
        next
    };

}


function getLiveProgram(){

    if(APP.schedule.length === 0){

        return {
            current: null,
            next: null
        };

    }

    const dayNames = [
        "DOM",
        "LUN",
        "MAR",
        "MER",
        "GIO",
        "VEN",
        "SAB"
    ];

    const now = new Date();

    const today = dayNames[now.getDay()];

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    const shows = APP.schedule
        .filter(show => show.day === today)
        .sort((a,b) =>
            toMinutes(a.start) - toMinutes(b.start)
        );

    let current = null;
    let next = null;

    for(let i=0;i<shows.length;i++){

        const show = shows[i];

        const start = toMinutes(show.start);

        let end = toMinutes(show.end);

        if(end <= start){

            end += 1440;

        }

        let nowValue = currentMinutes;

        if(nowValue < start && end > 1440){

            nowValue += 1440;

        }

        if(nowValue >= start && nowValue < end){

            current = show;

            next = shows[i+1] || null;

            break;

        }

    }

    if(!current){

        next = shows.find(show =>
            toMinutes(show.start) > currentMinutes
        ) || null;

    }

    return {

        current,
        next

    };

}



/* ==========================================================
   AZURACAST SERVICE
========================================================== */

function buildWeek() {

    const today = new Date();

    const monday = new Date(today);

    const day = monday.getDay();

    const diff = (day === 0) ? -6 : 1 - day;

    monday.setDate(monday.getDate() + diff);

    const week = [];

    for (let i = 0; i < 7; i++) {

        const date = new Date(monday);

        date.setDate(monday.getDate() + i);

        week.push(date);

    }

    return week;

}


async function loadDay(date){

    const yyyy = date.getFullYear();

    const mm = String(date.getMonth() + 1).padStart(2,"0");

    const dd = String(date.getDate()).padStart(2,"0");

    const url =
        `${API.schedule}?now=${yyyy}-${mm}-${dd}T00:00:00&rows=100`;

    try{

        const response = await fetch(url);

        if(!response.ok){

            throw new Error(`HTTP ${response.status}`);

        }

        const data = await response.json();

        console.log(
            `${dd}/${mm}/${yyyy}`,
            data
        );

        return data;

    }catch(error){

        console.error(
            "Errore caricamento:",
            url,
            error
        );

        return [];

    }

}


function normalizeSchedule(items){

    return items.map(item => {

        const startDate = new Date(item.start);

        const endDate = new Date(item.end);

        const dayNames = [
            "DOM",
            "LUN",
            "MAR",
            "MER",
            "GIO",
            "VEN",
            "SAB"
        ];

        return {

            id: item.id,

            day: dayNames[startDate.getDay()],

            start:
                startDate.toLocaleTimeString("it-IT",{
                    hour:"2-digit",
                    minute:"2-digit"
                }),

            end:
                endDate.toLocaleTimeString("it-IT",{
                    hour:"2-digit",
                    minute:"2-digit"
                }),

            title: item.title,

            speaker: "",

            is_now: item.is_now

        };

    });

}



async function loadWeekSchedule(){

    const week = buildWeek();

    APP.schedule = [];

    console.log("SETTIMANA");

    for(const day of week){

        const result = await loadDay(day);

       if(Array.isArray(result)){

    const normalized = normalizeSchedule(result);

    normalized.forEach(show => {

        const exists = APP.schedule.some(item => item.id === show.id);

        if(!exists){

            APP.schedule.push(show);

        }

    });

}

    }

    console.log("PROGRAMMI CARICATI:", APP.schedule.length);

    console.log(APP.schedule);

}

async function loadNowPlaying(){

    try{

        const response = await fetch(API.nowPlaying);

        if(!response.ok){

            throw new Error(`HTTP ${response.status}`);

        }

        const data = await response.json();

        APP.nowPlaying = data;

        console.log("NOW PLAYING", data);

    }catch(error){

        console.error("Errore Now Playing:", error);

    }

}


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

function updateNextProgram(){

    const live = getLiveProgram();

    if(!live || !live.next){

        return;

    }

    const time =
        document.getElementById("rq-next-time");

    const title =
        document.getElementById("rq-next-title");

    const speaker =
        document.getElementById("rq-next-speaker");

    const countdown =
        document.getElementById("rq-next-countdown");

    if(time){

        time.textContent = live.next.start;

    }

    if(title){

        title.textContent = live.next.title;

    }

    if(speaker){

        speaker.textContent =
            live.next.speaker
            ? "con " + live.next.speaker
            : "";

    }

    const now = new Date();

    const nowMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    const startMinutes =
        toMinutes(live.next.start);

    let diff =
        startMinutes - nowMinutes;

    if(diff < 0){

        diff += 1440;

    }

    const hours =
        Math.floor(diff / 60);

    const minutes =
        diff % 60;

    if(countdown){

        countdown.textContent =
            `🕒 tra ${hours}h ${minutes}m`;

    }

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


async function refreshNowPlaying(){

    await loadNowPlaying();

    updatePlayer();

}

/* ==========================================================
   PODCAST REST API
========================================================== */

async function loadPodcasts() {

    const slider =
        document.getElementById("rq-podcast-slider");

    if (!slider) return;

    slider.innerHTML =
        "<p>Caricamento podcast...</p>";

    try {

        const response = await fetch(
            "https://news.radioquar.com/wp-json/wp/v2/podcast?per_page=12"
        );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

       const podcasts =
    await response.json();

/* passa i dati al nuovo slider */

PodcastSlider.setData(podcasts);

/* il nuovo slider esegue il rendering */

PodcastSlider.render();

    } catch (error) {

        console.error(
            "Errore Podcast:",
            error
        );

        slider.innerHTML = `

            <div class="rq-podcast-error">

                Impossibile caricare i podcast.

            </div>

        `;

    }

}



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


