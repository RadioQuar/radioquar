function toMinutes(time){

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;

}

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

}function getLiveProgram(){

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


