const API = {

    nowPlaying: "https://radioquar.com/api/nowplaying/radio_quar",

    schedule: "https://radioquar.com/api/station/1/schedule"

};
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

