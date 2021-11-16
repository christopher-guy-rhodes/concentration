class GameControlView {
    constructor(maxPlayers, nameInputPrefixClass, gameOptionsForClass, gameOptionsSubmitClass, deckTypeClass,
                playerNameSubmitClass, gameResetClass, numPlayersClass, numberOfCardsToUseName, playerPrefixClass,
                playerNamePrefixClass) {
        validateRequiredParams(this.constructor, arguments, 'maxPlayers', 'nameInputPrefixClass',
            'gameOptionsForClass', 'gameOptionsSubmitClass', 'deckTypeClass', 'playerNameSubmitClass', 'gameResetClass',
            'numPlayersClass', 'numberOfCardsToUseName', 'playerPrefixClass', 'playerNamePrefixClass');
        this.maxPlayers = maxPlayers;
        this.nameInputPrefixClass = nameInputPrefixClass;
        this.gameOptionsSubmitClass = gameOptionsSubmitClass;
        this.gameOptionsFormClass = gameOptionsForClass;
        this.deckTypeClass = deckTypeClass;
        this.playerNameSubmitClass = playerNameSubmitClass;
        this.gameResetClass = gameResetClass;
        this.numPlayersClass = numPlayersClass;
        this.numberOfCardsToUseName = numberOfCardsToUseName;
        this.playerPrefixClass = playerPrefixClass;
        this.playerNamePrefixClass = playerNamePrefixClass;
        this.scoreBoardClass = 'scoreBoardContent';

        this.body = new ElementBuilder(document).withTag("body").build();
    }

    renderForms(document) {
        validateRequiredParams(this.renderForms, arguments, 'document');
        this.withTitleTag(document)
            .withPlayerForm(document)
            .withGameOptionsForm(document)
            .withScoreBoardContent(document)
            .withResetContent(document);
    }

    withResetContent(document) {
        let div = new ElementBuilder(document)
            .withTag(DIV_TAG)
            .withClass(this.gameResetClass)
            .withAttribute('style', 'display: none;').build();
        div.appendChild(new ElementBuilder(document)
            .withTag(ANCHOR_TAG)
            .withAttribute("href", "#")
            .withInnerText('Click to play again').build());
        this.body.appendChild(div);
        return this;
    }

    withScoreBoardContent(document) {
        let div = new ElementBuilder(document).withTag(DIV_TAG).withClass(this.scoreBoardClass).build();
        for (let i = 1; i <= this.maxPlayers; i++) {
            div.appendChild(new ElementBuilder(document).withTag(DIV_TAG)
                .withClass(this.playerPrefixClass + i)
                .withAttribute("style","display: none;")
                .withInnerText('Player ' + i + ': 0 matches').build());
        }
        this.body.appendChild(div);
        return this;
    }

    withTitleTag(document) {
        this.body.appendChild(new ElementBuilder(document)
            .withTag(H2_TAG)
            .withInnerText('Classic Concentration Memory Game').build());
        return this;
    }

    withGameOptionsForm(document) {
        validateRequiredParams(this.withGameOptionsForm, arguments, 'document');

        let form = new ElementBuilder(document).withTag(FORM_TAG)
            .withClass(this.gameOptionsFormClass).build();
        this.withNumberOfPlayersSelect(document, form)
            .withDeckTypeSelect(document, form)
            .withNumberOfCardsInput(document, form)
            .withGameOptionsSubmit(document, form);
        this.body.appendChild(form);
        return this;
    }

    withGameOptionsSubmit(document, form) {
        form
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withClass(this.gameOptionsSubmitClass)
                .withAttribute("type", "button")
                .withAttribute("value", "submit").build());
        return this;
    }

    withNumberOfCardsInput(document, form) {
        // Number of cards
        form
            .appendChild(new ElementBuilder(document)
                .withTag(DIV_TAG)
                .withInnerText('How many cards?').build())
            .appendChild(new ElementBuilder(document).withTag(INPUT_TAG)
                .withAttribute("type", "text")
                .withAttribute("name", this.numberOfCardsToUseName)
                .withAttribute("size", "4").build())
            .appendChild(new ElementBuilder(document)
                .withTag(BREAK_TAG).build())
            .appendChild(new ElementBuilder(document)
                .withTag(BREAK_TAG).build());
        return this;
    }

    withDeckTypeSelect(document, form) {
        let deckTypeSelect = new ElementBuilder(document)
            .withTag(SELECT_TAG)
            .withClass(this.deckTypeClass).build()
            .appendChild(new ElementBuilder(document)
                .withTag(OPTION_TAG)
                .withAttribute('value', 'picture')
                .withInnerText('Picture Deck').build())
            .appendChild(new ElementBuilder(document)
                .withTag(OPTION_TAG)
                .withAttribute('value', 'playing')
                .withInnerText('Playing Deck').build());

        form
            .appendChild(new ElementBuilder(document)
                .withTag(DIV_TAG)
                .withInnerText('What type of deck?').build())
            .appendChild(deckTypeSelect)
            .appendChild(new ElementBuilder(document)
                .withTag(BREAK_TAG).build())
            .appendChild(new ElementBuilder(document)
                .withTag(BREAK_TAG).build());
        return this;
    }

    withNumberOfPlayersSelect(document, form) {
        let numPlayersSelect = new ElementBuilder(document)
            .withTag(SELECT_TAG)
            .withClass(this.numPlayersClass).build();

        for (let i = 1; i <= this.maxPlayers; i++) {
            numPlayersSelect.appendChild(new ElementBuilder(document)
                .withTag(OPTION_TAG)
                .withAttribute('value', i)
                .withInnerText(i).build());
        }

        form
            .appendChild(new ElementBuilder(document)
                .withTag(DIV_TAG)
                .withInnerText('How many players?').build())
            .appendChild(new ElementBuilder(document).withTag(INPUT_TAG)
                .withAttribute("type", "hidden").build())
            .appendChild(numPlayersSelect)
            .appendChild(new ElementBuilder(document)
                .withTag(BREAK_TAG).build())
            .appendChild(new ElementBuilder(document)
                .withTag(BREAK_TAG).build());
        return this;
    }

    withPlayerForm(document) {
        validateRequiredParams(this.withPlayerForm, arguments, 'document');
        let form = new ElementBuilder(document)
            .withTag("form").build();

        for (let i = 1; i <= this.maxPlayers; i++) {
            form.appendChild(new ElementBuilder(document)
                .withTag("div")
                .withClass(this.playerNamePrefixClass + i)
                .withAttribute("style", "display: none;")
                .withInnerText("Player " + i + ' name:').build()
                .appendChild(new ElementBuilder(document)
                    .withTag("input").withClass(this.nameInputPrefixClass + i)
                    .withAttribute("type", "text")
                    .build()))
        }

        form
            .appendChild(new ElementBuilder(document)
                .withTag("input")
                .withClass(this.playerNameSubmitClass)
                .withAttribute("style", "display: none")
                .withAttribute("type", "button")
                .withAttribute("name", "playerNames")
                .withAttribute("value", "submit").build());

        this.body.appendChild(form);
        return this;
    }

}
