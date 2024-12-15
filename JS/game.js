$(() => {
    /*Using fadeOut(0) instead of hide() on some of the objects since it seems to bug-out some objects. Sometimes i needed both not to mess up flex, abuse both in same frame bugs out but looks in the way i want it.
    +-100 frame-pauses let DOM breath for animations resets/classes.
    Mixing vanilla with JQuery just to get some feeling for it.
    */

    //TODO: Theme selection events
    "use strict"
    /* Variables */

    const INPUT_VALIDATOR = /^[a-zA-Z]{1,1}$/;
    const ANIMAL_POOL = ["dog", "cat", "donkey", "horse", "pig", "rabbit", "anaconda", "bat", "antelope", "dolphin", "whale", "elk", "shark", "jaguar", "orca", "tarantula", "turtle", "whale"]
    const FRUIT_POOL = ["banana", "apple", "kiwi", "cherry", "peach", "orange", "mango", "guava", "lime", "apricot", "grapefruit", "sapodilla", "plum", "loquat", "pear", "carambola", "strawberry", "pomegranate", "blackberry", "physalis", "papaya", "fig", "grapes"];
    const VEGETABLES_POOL = ["broccoli", "carrots", "asparagues", "beetroot", "cauliflower", "celery", "corn", "cucumber", "cabbage", "eggplant", "spinach", "yam", "avocado", "ginger", "potato", "kale", "lettuce", "chickpea"];
    const WORD_THEMES = ["animals", "vegetables", "fruits"]

    let allThemesBtn = [];
    let allHearts = [];
    let dynamicMsg_el = document.querySelector(".dynamic-message");
    let inputGuess_el = document.querySelector("#guess-input");
    let guessBtn_el = document.querySelector(".guess");
    let life = 8;
    let pickedWord = "";
    let wrongLettersGuessed = [];
    let visualOutput = [];
    let inputLetter = "";
    let replay = false;
    let hasWon = false;
    let total, loss, wins = 0;
    let spellInMotion = false;
    let chosenTheme = "";

    /* Functions */

    const randomPickWord = (theme) => {
        switch (theme) {
            case 'animals':
                return pickedWord = ANIMAL_POOL[Math.floor(Math.random() * ANIMAL_POOL.length)].toUpperCase();
            case 'vegetables':
                return pickedWord = VEGETABLES_POOL[Math.floor(Math.random() * VEGETABLES_POOL.length)].toUpperCase();
            case 'fruits':
                return pickedWord = FRUIT_POOL[Math.floor(Math.random() * FRUIT_POOL.length)].toUpperCase();
            default:
                pickedWord = ANIMAL_POOL[Math.floor(Math.random() * ANIMAL_POOL.length)].toUpperCase();
        }
    }


    const spellAndLifeLogic = () => {
        spellInMotion = true;
        $(".wiz").removeClass("wizCast")
        $(".king").removeClass("kingHit kingDeath")

        setTimeout(() => { $(".wiz").addClass("wizCast"); }, 100);

        setTimeout(() => {
            calcStepsAndAnimators();
        }, 600);

    }

    const createGameElements = (parentClass, classToElement, amountOfElements) => {
        let parent = document.querySelector(parentClass);
        let elementArray = [];
        if (parent.children.length > 0) {
            while (parent.firstChild) { //Force use of 1st assignment loop criteria..
                parent.removeChild(parent.lastChild);
            }
        }

        for (let index = 0; index < amountOfElements; index++) {
            let createdElement = document.createElement("div");
            createdElement.classList.add(classToElement);
            parent.appendChild(createdElement);
            elementArray.push(createdElement);
        }

        return elementArray;
    }

    const newGame = () => {
        pickedWord = "";
        life = 8;
        hasWon = false;
        wrongLettersGuessed.length = 0, visualOutput.length = 0;
    }

    const gameOver = () => {
        $(dynamicMsg_el).text(`You lost! The right answer was ${pickedWord}!`).stop(true).delay(2000).fadeIn(0);
        $('.start-game').text("Play again?");
        $('.start-game__container').delay(1000).fadeIn(500);
        $(guessBtn_el).fadeOut(0).hide();
        $(inputGuess_el).fadeOut(0).hide();
        $('.correct-words').fadeOut(0).hide();
        $('.failed-words').fadeOut(0).hide();
        $('.heart-container').fadeOut(0).hide();
        updateStats(1, 0, 1);
        replay = true;
    }

    const won = () => {
        hasWon = true;
        replay = true;

        $('.failed-words').hide();
        $(dynamicMsg_el).text(`Woohoo!! You won! You also had ${life} lives left!`).stop(true).fadeIn(500);
        $('.start-game').text("Play again?");
        $('.start-game__container').fadeIn(1000);

        inputGuess_el.disabled = true;
        updateStats(0, 1, 1);
    }

    const getDistance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    }

    const updateStats = (lossarg, winsarg, totalarg, wipe = false) => {
        if (!wipe) {
            loss += lossarg;
            wins += winsarg;
            total += totalarg;
        } else {
            loss = 0;
            wins = 0;
            total = 0;
        }

        $('.total-play').text("Played:" + total);
        $('.total-wins').text("Wins:" + wins);
        $('.total-losses').text("Losses:" + loss);
    }

    const updateLife = () => {
        life--;
        allHearts[life].classList.remove("full-heart");
        allHearts[life].classList.add("empty-heart");
    }

    const guess = () => {
        if (hasWon || spellInMotion) return;

        resetInputVisuals();
        updateWrongLetterOutput();

        if (INPUT_VALIDATOR.test(inputLetter)) {

            inputLetter = inputLetter.toUpperCase();

            if (pickedWord.includes(inputLetter)) {
                for (let index = 0; index < pickedWord.length; index++)
                    if (pickedWord[index] === inputLetter)
                        visualOutput[index] = inputLetter;

                updateVisualOutput();

                if (visualOutput.join("") === pickedWord) {
                    won();
                }
            }
            else {
                if (!wrongLettersGuessed.includes(inputLetter)) {

                    wrongLettersGuessed.push(inputLetter);
                    $(dynamicMsg_el).text(`Letter '${inputLetter}' doesn't exist in this word`).stop(true).fadeIn(0).fadeOut(3000);
                    updateWrongLetterOutput();

                } else
                    $(dynamicMsg_el).text(`Letter ${inputLetter} is wrong and you also have guessed this letter already.`).stop(true).fadeIn(0).fadeOut(3000);

                spellAndLifeLogic();
            }

        } else
            $(dynamicMsg_el).text("Needs to be single letter and also not a number!").stop(true).fadeIn(0).fadeOut(3000);

        inputLetter = "";
    }

    const resetInputVisuals = () => {
        inputGuess_el.classList.remove("valid");
        inputGuess_el.classList.remove("invalid");
        inputGuess_el.value = "";
    }

    const initSetup = () => {
        newGame();
        allHearts = createGameElements('.heart-container', 'full-heart', life);
        pickedWord = randomPickWord(chosenTheme);
       
        for (let index = 0; index < pickedWord.length; index++) {
            visualOutput.push("_");
        }

        updateVisualOutput();
        updateWrongLetterOutput();

        $('.guess-container').show();
        $(guessBtn_el).fadeOut(0).fadeIn(1000);
        $(inputGuess_el).fadeOut(0).fadeIn(1000, () => $(inputGuess_el).focus());
        $('.correct-words').fadeOut(0).delay(500).fadeIn(2000);
        $('.failed-words').fadeOut(0).delay(1000).fadeIn(2000);
        $('.heart-container').fadeOut(0).delay(500).fadeIn(1000);
        inputGuess_el.disabled = false;
    }

    const addEventsToTheme = () => {
        for (let index = 0; index < allThemesBtn.length; index++) {
            if (index === 0) {
                allThemesBtn[index].classList.add("theme-button--active");
                chosenTheme = "animals";
            }
            allThemesBtn[index].textContent = `[${WORD_THEMES[index]}]`;

            allThemesBtn[index].addEventListener('click', () => {
                chosenTheme = WORD_THEMES[index];

                for (let k = 0; k < allThemesBtn.length; k++) {
                    allThemesBtn[k].classList.remove('theme-button--active');
                }
                allThemesBtn[index].classList.add('theme-button--active');
            });
        }
    }

    const updateVisualOutput = () => {
        $(".correct-words").text(visualOutput.join(""));
    }

    const updateWrongLetterOutput = () => {
        $(".failed-words").text("Wrong Letters: " + wrongLettersGuessed.join(""));
    }

    const calcStepsAndAnimators = () => {
        let p1 = this.document.querySelector('.wiz').getBoundingClientRect();
        let p2 = this.document.querySelector('.king').getBoundingClientRect();
        let distance = getDistance(p1.right, p1.top, p2.right, p2.top)

        document.querySelector(".spell").classList.remove("hidden");

        $('.spell').css("right", distance + "px");
        $('.spell').stop(true).animate({ right: "-=" + (distance - 100) + "px" }, () => {
            $('.spell').css("right", distance + "px");

            document.querySelector(".spell").classList.add("hidden");

            $(".spell-socket").addClass("spellExplode");
            setTimeout(() => $(".spell-socket").removeClass("spellExplode"), 1000);

            updateLife();
            spellInMotion = false;

            if (life === 0) { document.querySelector(".king");
                let king =  document.querySelector(".king");
                king.classList.remove("king-hit");
                king.classList.add("king-death");
                king.classList.add("kingDeath");
                gameOver();
            }
            else {
                document.querySelector(".king").classList.add("kingHit");
            }

        })
    }
    /* Events */
    inputGuess_el.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            guess();
        }
    });

    $(".start-game").on("click", () => {
        if (replay) {
            $(".first-group")
                .delay(1000)
                .stop(true)
                .animate({ left: "-30rem" })
                .delay(2000, () => $(".second-group")
                    .stop(true)
                    .animate({ right: "-30rem" }, () => {
                        document.querySelector(".king").classList.add("king-hit");
                        document.querySelector(".king").classList.remove("king-death");
                        document.querySelector(".king").classList.remove("kingDeath");
                    }));
        } else
            updateStats(0, 0, 0, true);

        $('.correct-words').hide();
        $('.guess-container').hide();
        $(dynamicMsg_el).fadeOut(0);
        $(".start-game__container").fadeOut(1000, "swing", () => {
            $(".game-objects").show(0, () => $(".first-group")
                .stop(true)
                .delay(1000)
                .animate({ left: "10%" })
                .delay(2000, () => $(".second-group")
                    .stop(true)
                    .animate({ right: "10%" })));
        });

        $(".word-container").delay(2000).show((() => {
            initSetup();
        }));
    })

    inputGuess_el.addEventListener('input', (event) => {
        if (INPUT_VALIDATOR.test(event.target.value)) {
            inputGuess_el.classList.add("valid");
            inputGuess_el.classList.remove("invalid");
            inputLetter = event.target.value;
        } else {
            if (event.target.value === "") {
                inputGuess_el.classList.remove("invalid");
                inputGuess_el.classList.remove("valid");
            }
            else {
                inputGuess_el.classList.remove("valid");
                inputGuess_el.classList.add("invalid");
            }
        }
    });

    guessBtn_el.addEventListener('click', () => {
        guess();
    })

    //Force on Init
    $(".word-container").hide();
    allThemesBtn = createGameElements('.word-theme', 'theme-button', 3);
    addEventsToTheme();

});


