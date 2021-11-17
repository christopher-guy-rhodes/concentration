class GameConfigView {
    constructor(gameOptionsFormClass, gameOptionsSubmitButtonClass, deckTypeSelectorClass,
                playerNameSubmitButtonClass, gameResetClass, numPlayersSelectorClass, numberOfCardsToUseName,
                scoreBoardPlayerPrefixClass, playerNamePrefixClass, nameInputPrefixClass) {
        validateRequiredParams(this.constructor, arguments, 'gameOptionsFormClass', 'gameOptionsSubmitButtonClass',
            'deckTypeSelectorClass', 'playerNameSubmitButtonClass', 'gameResetClass', 'numPlayersSelectorClass',
            'numberOfCardsToUseName', 'scoreBoardPlayerPrefixClass', 'playerNamePrefixClass', 'nameInputPrefixClass');
        this.gameOptionsFormClass = gameOptionsFormClass;
        this.gameOptionsSubmitButtonClass = gameOptionsSubmitButtonClass;
        this.deckTypeSelectorClass = deckTypeSelectorClass;
        this.playerNameSubmitButtonClass = playerNameSubmitButtonClass;
        this.gameResetClass = gameResetClass;
        this.numPlayersSelectorClass = numPlayersSelectorClass;
        this.numberOfCardsToUseName = numberOfCardsToUseName;
        this.scoreBoardPlayerPrefixClass = scoreBoardPlayerPrefixClass;
        this.playerNamePrefixClass = playerNamePrefixClass;
        this.nameInputPrefixClass = nameInputPrefixClass;
    }

    /**
     * Generate the forms used to configure the game.
     * @param document the DOM document
     */
    buildGameControlForms(document) {
        validateRequiredParams(this.buildGameControlForms, arguments, 'document');
        this.withTitleTag(document)
            .withPlayerForm(document)
            .withGameOptionsForm(document)
            .withScoreBoardContent(document)
            .withResetContent(document);
    }

    /* private */
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

    /* private */
    withScoreBoardContent(document) {
        let div = new ElementBuilder(document).withTag(DIV_TAG).build();
        for (let i = 1; i <= MAX_PLAYERS; i++) {
            div.appendChild(new ElementBuilder(document).withTag(DIV_TAG)
                .withClass(this.scoreBoardPlayerPrefixClass + i)
                .withAttribute("style","display: none;")
                .withInnerText('Player ' + i + ': 0 matches').build());
        }
        BODY_ELEMENT.appendChild(div);
        return this;
    }

    /* private */
    withTitleTag(document) {
        BODY_ELEMENT.appendChild(new ElementBuilder(document)
            .withTag(H2_TAG)
            .withInnerText('Classic Concentration Memory Game').build());
        return this;
    }

    /* private */
    withGameOptionsForm(document) {
        validateRequiredParams(this.withGameOptionsForm, arguments, 'document');

        let form = new ElementBuilder(document).withTag(FORM_TAG)
            .withClass(this.gameOptionsFormClass).build();
        this.withNumberOfPlayersSelect(document, form)
            .withDeckTypeSelect(document, form)
            .withNumberOfCardsInput(document, form)
            .withGameOptionsSubmit(document, form)
            .withDeckPreviewImage(document, form)

        BODY_ELEMENT.appendChild(form);
        return this;
    }

    /* private */
    withDeckPreviewImage(document, form) {
        form
            .appendChild(new ElementBuilder(document)
                .withTag(H3_TAG).build()
                .appendChild(new ElementBuilder(document)
                    .withTag(SPAN_TAG)
                    .withInnerText('Deck Preview').build()))
            .appendChild(new ElementBuilder(document)
                .withTag(IMAGE_TAG).build());
        return this;
    }

    /* private */
    withGameOptionsSubmit(document, form) {
        form
            .appendChild(new ElementBuilder(document)
                .withTag(SPAN_TAG).build()
                .appendChild(new ElementBuilder(document)
                    .withTag(INPUT_TAG)
                    .withClass(this.gameOptionsSubmitButtonClass)
                    .withAttribute("type", "button")
                    .withAttribute("value", "Play!").build()));
        return this;
    }

    /* private */
    withNumberOfCardsInput(document, form) {
        form
            .appendChild(new ElementBuilder(document).withTag(DIV_TAG).build()
                .appendChild(new ElementBuilder(document)
                    .withTag(SPAN_TAG)
                    .withInnerText('How many cards?').build())
                .appendChild(new ElementBuilder(document).withTag(INPUT_TAG)
                    .withAttribute("type", "text")
                    .withAttribute("name", this.numberOfCardsToUseName)
                    .withAttribute("size", "2").build()));
        return this;
    }

    /* private */
    withDeckTypeSelect(document, form) {
        let deckTypeSelect = new ElementBuilder(document)
                .withTag(SELECT_TAG)
                .withClass(this.deckTypeSelectorClass).build()
            .appendChild(new ElementBuilder(document)
                .withTag(OPTION_TAG)
                .withAttribute('value', 'playing')
                .withInnerText('Playing Deck').build())
            .appendChild(new ElementBuilder(document)
                .withTag(OPTION_TAG)
                .withAttribute('value', 'picture')
                .withInnerText('Picture Deck').build());

        form
            .appendChild(new ElementBuilder(document).withTag(DIV_TAG).build()
                .appendChild(new ElementBuilder(document)
                    .withTag(SPAN_TAG)
                    .withInnerText('What type of deck?').build())
                .appendChild(deckTypeSelect));
        return this;
    }

    /* private */
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
            .appendChild(new ElementBuilder(document).withTag(DIV_TAG).build()
                .appendChild(new ElementBuilder(document)
                    .withTag(SPAN_TAG)
                    .withInnerText('How many players?').build())
                .appendChild(numPlayersSelect))
        return this;
    }

    /* private */
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
