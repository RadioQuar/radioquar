"use strict";

/* ==========================================================
   RADIO QUAR
   PodcastSlider v1
   1
   RC2.2
========================================================== */

const PodcastSlider = {

    /* ======================================================
       STATO
    ====================================================== */

    podcasts: [],

    currentIndex: 0,

    visibleCards: 3,

    slider: null,

    track: null,
    
    trackOffset: 0,
    
    isAnimating: false,

    transitionDuration: 400,
    
    headClones: [],

    tailClones: [],

    loopEnabled: true, 

    btnPrev: null,

    btnNext: null,



    /* ======================================================
       INIT
    ====================================================== */

init() {

    this.slider =
        document.getElementById(
            "rq-podcast-slider"
        );

    this.btnPrev =
        document.getElementById(
            "rq-podcast-prev"
        );

    this.btnNext =
        document.getElementById(
            "rq-podcast-next"
        );

    if (!this.slider) return;

    this.updateResponsive();

    window.addEventListener(
        "resize",
        () => {

            const oldVisible =
                this.visibleCards;

            this.updateResponsive();

            if (
                oldVisible !==
                this.visibleCards
            ) {

                this.render();

            }

        }
    );

},
 
/* ======================================================
       RESPONSIVE
    ====================================================== */

updateResponsive() {

    const width =
        window.innerWidth;

    if (width <= 768) {

        this.visibleCards = 1;

    }

    else if (width <= 1100) {

        this.visibleCards = 2;

    }

    else {

        this.visibleCards = 3;

    }

    if (
        this.currentIndex >
        Math.max(
            0,
            this.podcasts.length -
            this.visibleCards
        )
    ) {

        this.currentIndex =
            Math.max(
                0,
                this.podcasts.length -
                this.visibleCards
            );

    }

},

    /* ======================================================
       DATI
    ====================================================== */

setData(data) {

    this.podcasts =
        Array.isArray(data)
            ? data
            : [];

    this.currentIndex = 0;

},

    /* ======================================================
       RENDER
    ====================================================== */

render() {

    if (!this.slider) return;

    this.slider.innerHTML =
        `<div class="rq-podcast-track"></div>`;

    this.track =
        this.slider.querySelector(
            ".rq-podcast-track"
        );

        this.buildLoop();

    let html = "";

    /* ---------- cloni iniziali ---------- */

this.headClones.forEach(

    podcast => {

        html +=

            this.createClone(

                podcast

            );

    }

);

/* ---------- podcast reali ---------- */

this.podcasts.forEach(

    podcast => {

        html +=

            this.renderCard(

                podcast

            );

    }

);

/* ---------- cloni finali ---------- */

this.tailClones.forEach(

    podcast => {

        html +=

            this.createClone(

                podcast

            );

    }

);

    this.track.innerHTML =
        html;
     
     console.log(
    "Card nel track:",
    this.track.children.length
);

    this.bindEvents();

    this.updateButtons();

    this.move();

},


    /* ======================================================
       CARD
    ====================================================== */

    renderCard(podcast) {

        const cover =

            podcast.meta.cover_image ||

            "assets/podcast-placeholder.jpg";

        const title =

            podcast.title.rendered.replace(

                /^S\d+E\d+\s*[-–]\s*/i,

                ""

            );

        const audio =

            podcast.meta.audio_file || "";

        return `

<article class="rq-podcast-card">

    <div class="rq-podcast-cover">

        <img
            src="${cover}"
            alt="${title}"
            loading="lazy">

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

    },

/* ======================================================
   CREATE CLONE
====================================================== */

createClone(podcast) {

    return this.renderCard(podcast);

},

/* ======================================================
   BUILD LOOP
====================================================== */

buildLoop() {

    this.headClones = [];

    this.tailClones = [];

    if (

        !this.loopEnabled ||

        this.podcasts.length <= this.visibleCards

    ) {

        return;

    }

    const count = this.visibleCards;

    this.headClones =

        this.podcasts.slice(-count);

    this.tailClones =

        this.podcasts.slice(0, count);

},



    /* ======================================================
       EVENTI
    ====================================================== */

    bindEvents() {

    document
        .querySelectorAll(".rq-podcast-play")
        .forEach(button => {

            button.onclick = () => {

                PodcastPlayer.play(button);

            };

        });

    /* freccia sinistra */

    if (this.btnPrev) {

        this.btnPrev.onclick = () => {

            this.prev();

        };

    }

    /* freccia destra */

    if (this.btnNext) {

        this.btnNext.onclick = () => {

            this.next();

        };

    }

    /* transition end */

    if (this.track) {

        this.track.ontransitionend = () => {

            this.onTransitionEnd();

        };

    }

},


    /* ======================================================
       PLACEHOLDER
       (Parte 2)
    ====================================================== */

    /* ======================================================
   NEXT
====================================================== */

next() {

    if (

        this.currentIndex <

        this.podcasts.length -

        this.visibleCards

    ) {

        this.currentIndex++;

    }

    this.move();

    this.updateButtons();

},


/* ======================================================
   PREV
====================================================== */

prev() {

    this.goTo(

        this.currentIndex - 1

    );

},



/* ======================================================
   MAX INDEX
====================================================== */

getMaxIndex() {

    return Math.max(

        0,

        this.podcasts.length -

        this.visibleCards

    );

},


/* ======================================================
   GOTO
====================================================== */

goTo(index) {

    const maxIndex =
        this.getMaxIndex();

    /* limite sinistro */

    if (index < 0) {

        index = 0;

    }

    /* limite destro */

    if (index > maxIndex) {

        index = maxIndex;

    }

    /* aggiorna indice */

    this.currentIndex = index;

    /* aggiorna posizione */

    this.move();

    /* aggiorna pulsanti */

    this.updateButtons();

},





/* ======================================================
   MOVE
====================================================== */

move() {

    if (!this.track) return;

    const card =
        this.track.querySelector(
            ".rq-podcast-card"
        );

    if (!card) return;

    const style =
        getComputedStyle(this.track);

    const gap =
        parseFloat(style.gap) || 0;

    const width =
        card.getBoundingClientRect().width +
        gap;

    this.trackOffset =
        this.currentIndex * width;

    this.isAnimating = true;

    this.track.style.transition =

        `transform ${this.transitionDuration}ms ease`;

    this.track.style.transform =

        `translate3d(-${this.trackOffset}px,0,0)`;

},

/* ======================================================
   ON TRANSITION END
====================================================== */

onTransitionEnd() {

    this.isAnimating = false;

},



/* ======================================================
   NEXT
====================================================== */

next() {

    this.goTo(

        this.currentIndex + 1

    );

},


/* ======================================================
   BUTTONS
====================================================== */

updateButtons() {

    if (

        !this.btnPrev ||

        !this.btnNext

    ) {

        return;

    }

    const maxIndex =
        this.getMaxIndex();

    this.btnPrev.disabled =

        this.currentIndex <= 0;

    this.btnNext.disabled =

        this.currentIndex >= maxIndex;

},


};