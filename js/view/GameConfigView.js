class GameConfigView {
    constructor(gameOptionsForClass, gameOptionsSubmitButtonClass, deckTypeSelectorClass,
                playerNameSubmitButtonClass, gameResetClass, numPlayersSelectorClass, numberOfCardsToUseName,
                scoreBoardPlayerPrefixClass, playerNamePrefixClass) {
        validateRequiredParams(this.constructor, arguments, 'gameOptionsForClass', 'gameOptionsSubmitButtonClass',
            'deckTypeSelectorClass', 'playerNameSubmitButtonClass', 'gameResetClass', 'numPlayersSelectorClass',
            'numberOfCardsToUseName', 'scoreBoardPlayerPrefixClass', 'playerNamePrefixClass');
        this.gameOptionsSubmitButtonClass = gameOptionsSubmitButtonClass;
        this.gameOptionsFormClass = gameOptionsForClass;
        this.deckTypeSelectorClass = deckTypeSelectorClass;
        this.playerNameSubmitButtonClass = playerNameSubmitButtonClass;
        this.gameResetClass = gameResetClass;
        this.numPlayersSelectorClass = numPlayersSelectorClass;
        this.numberOfCardsToUseName = numberOfCardsToUseName;
        this.scoreBoardPlayerPrefixClass = scoreBoardPlayerPrefixClass;
        this.playerNamePrefixClass = playerNamePrefixClass;

        this.scoreBoardClass = 'scoreBoardContent';
        this.nameInputPrefixClass = 'name';
    }

    getNameInputPrefixClass() {
        return this.nameInputPrefixClass;
    }

    withGameControlForms(document) {
        validateRequiredParams(this.withGameControlForms, arguments, 'document');
        this.withTitleTag(document)
            .withPlayerForm(document)
            .withGameOptionsForm(document)
            .withScoreBoardContent(document)
            .withResetContent(document);
        return this;
    }

    withResetContent(document) {
        validateRequiredParams(this.withResetContent, 'document');
        BODY_ELEMENT.appendChild(new ElementBuilder(document)
            .withTag(DIV_TAG)
            .withClass(this.gameResetClass)
            .withAttribute('style', 'display: none;').build()
            .appendChild(new ElementBuilder(document)
                .withTag(ANCHOR_TAG)
                .withAttribute('href', '#')
                .withInnerText('Click to play again').build()));
        return this;
    }

    withScoreBoardContent(document) {
        let div = new ElementBuilder(document).withTag(DIV_TAG).withClass(this.scoreBoardClass).build();
        for (let i = 1; i <= MAX_PLAYERS; i++) {
            div.appendChild(new ElementBuilder(document).withTag(DIV_TAG)
                .withClass(this.scoreBoardPlayerPrefixClass + i)
                .withAttribute("style","display: none;")
                .withInnerText('Player ' + i + ': 0 matches').build());
        }
        BODY_ELEMENT.appendChild(div);
        return this;
    }

    withTitleTag(document) {
        BODY_ELEMENT.appendChild(new ElementBuilder(document)
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
        BODY_ELEMENT.appendChild(form);
        return this;
    }

    withGameOptionsSubmit(document, form) {
        form
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withClass(this.gameOptionsSubmitButtonClass)
                .withAttribute("type", "button")
                .withAttribute("value", "submit").build());
        return this;
    }

    withNumberOfCardsInput(document, form) {
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
            .withClass(this.deckTypeSelectorClass).build()
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
            .withClass(this.numPlayersSelectorClass).build();

        for (let i = 1; i <= MAX_PLAYERS; i++) {
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

        for (let i = 1; i <= MAX_PLAYERS; i++) {
            form.appendChild(new ElementBuilder(document)
                .withTag(DIV_TAG)
                .withClass(this.playerNamePrefixClass + i)
                .withAttribute("style", "display: none;")
                .withInnerText("Player " + i + ' name:').build()
                .appendChild(new ElementBuilder(document)
                    .withTag(INPUT_TAG).withClass(this.nameInputPrefixClass + i)
                    .withAttribute("type", "text")
                    .build()))
        }

        form
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withClass(this.playerNameSubmitButtonClass)
                .withAttribute("style", "display: none")
                .withAttribute("type", "button")
                .withAttribute("name", "playerNames")
                .withAttribute("value", "submit").build());

        BODY_ELEMENT.appendChild(form);
        return this;
    }
}
