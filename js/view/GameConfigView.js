class GameConfigView {
    constructor(gameOptionsFormClass, gameOptionsSubmitButtonClass, deckTypeSelectorClass,
                playerNameSubmitButtonClass, gameResetClass, numPlayersSelectorClass, numberOfCardsToUseName,
                scoreBoardPlayerPrefixClass, playerNamePrefixClass, nameInputPrefixClass, playerNameForm,
                scoreBoardForm, playOnlineCheckboxName) {
        validateRequiredParams(this.constructor, arguments, 'gameOptionsFormClass', 'gameOptionsSubmitButtonClass',
            'deckTypeSelectorClass', 'playerNameSubmitButtonClass', 'gameResetClass', 'numPlayersSelectorClass',
            'numberOfCardsToUseName', 'scoreBoardPlayerPrefixClass', 'playerNamePrefixClass', 'nameInputPrefixClass',
            'playerNameForm', 'scoreBoardForm', 'playOnlineCheckboxName');
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
        this.playerNameForm = playerNameForm;
        this.scoreBoardForm = scoreBoardForm;
        this.playOnlineCheckboxName = playOnlineCheckboxName;
    }

    /**
     * Generate the forms used to configure the game.
     * @param document the DOM document
     */
    buildGameControlForms(document) {
        validateRequiredParams(this.buildGameControlForms, arguments, 'document');
        this.withTitleTag(document)
            .withNavBar(document)
            .withGameOptionsForm(document)
            .withPlayerForm(document)
            .withScoreBoardContent(document)
            .withCurrentPlayerHiddenInput(document)
            .withAllPlayersReadyHiddenInput(document)
            .withGameLogIndex(document)
            .withGameLogCaughtUp(document)
            .withLocalBrowserTurns(document)
        BODY_ELEMENT.appendChild(GAMEBOARD_ELEMENT);
    }

    withLocalBrowserTurns(document) {
        BODY_ELEMENT.appendChild(new ElementBuilder(document)
            .withTag(INPUT_TAG)
            .withAttribute("name", "localBrowserTurns")
            .withAttribute("type", "hidden").build())
        return this;
    }

    withCurrentPlayerHiddenInput(document) {
        BODY_ELEMENT.appendChild(new ElementBuilder(document)
            .withTag(INPUT_TAG)
            .withAttribute("name", "currentPlayer")
            .withAttribute("type", "hidden").build())
        return this;
    }

    withGameLogCaughtUp(document) {
        BODY_ELEMENT.appendChild(new ElementBuilder(document)
            .withTag(INPUT_TAG)
            .withAttribute("name", "gameLogCaughtUp")
            .withAttribute("value", 0)
            .withAttribute("type", "hidden").build())
        return this;
    }

    withGameLogIndex(document) {
        BODY_ELEMENT.appendChild(new ElementBuilder(document)
            .withTag(INPUT_TAG)
            .withAttribute("name", "gameLogReadIndex")
            .withAttribute("value", -1)
            .withAttribute("type", "hidden").build())
        return this;
    }

    withAllPlayersReadyHiddenInput(document) {
        BODY_ELEMENT.appendChild(new ElementBuilder(document)
            .withTag(INPUT_TAG)
            .withAttribute("name", "allPlayersReady")
            .withAttribute("type", "hidden")
            .withAttribute("value", 0).build());
        return this;
    }

    /* private */
    withScoreBoardContent(document) {
        let div = new ElementBuilder(document)
            .withClass(this.scoreBoardForm)
            .withAttribute('style', 'display: none')
            .withTag(DIV_TAG).build();
        for (let i = 1; i <= MAX_PLAYERS; i++) {
            div.appendChild(new ElementBuilder(document).withTag(DIV_TAG)
                .withClass(this.scoreBoardPlayerPrefixClass + i)
                .withAttribute("style","display: none;")
                .withInnerText('Player ' + i + ': 0 matches').build());
        }

        div.appendChild(new ElementBuilder(document).withTag(DIV_TAG)
            .withAttribute('style', 'display: none')
            .withClass('invitationClass').build());

        let waitingDiv = new ElementBuilder(document)
            .withTag(DIV_TAG)
            .withClass('waiting')
            .withAttribute('style', 'display: none').build()
            .appendChild(new ElementBuilder(document).withTag(STRONG_TAG)
                .withInnerText('Waiting for:').build());

        for (let i = 1; i <= MAX_PLAYERS; i++) {
            waitingDiv.appendChild(new ElementBuilder(document)
                .withTag(SPAN_TAG)
                .withClass('waitingOn' + i).build());
        }

        div.appendChild(waitingDiv);

        let waitLongerDiv = new ElementBuilder(document).withTag(DIV_TAG)
            .withClass('waitLongerContainer')
            .withAttribute('style', 'display: none')
            .withInnerText('Gave up waiting  ').build()
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withClass('waitLonger')
                .withAttribute('type', 'button')
                .withAttribute('value', 'Wait longer').build());

        div.appendChild(waitLongerDiv);

        div.appendChild(new ElementBuilder(document)
            .withTag(DIV_TAG)
            .withClass(this.gameResetClass)
            .withAttribute('style', 'display: none;').build()
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withAttribute('type', 'button')
                .withAttribute('value', 'Play again!').build()));

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
    withNavBar(document) {
        BODY_ELEMENT.appendChild(new ElementBuilder(document).withTag(DIV_TAG)
            .withClass('navBar').build()
            .appendChild(new ElementBuilder(document).withTag(ANCHOR_TAG)
                .withAttribute('href', '/concentration.html')
                .withInnerText('New Game').build()));
        return this;
    }

    /* private */
    withGameOptionsForm(document) {
        validateRequiredParams(this.withGameOptionsForm, arguments, 'document');

        let form = new ElementBuilder(document).withTag(FORM_TAG)
            .withClass(this.gameOptionsFormClass)
            // Force hard coded width that can be used as a reference to scale for mobile viewing
            .withAttribute('style', 'width: ' + PREVIEW_IMG_WIDTH + 'px')
            .build();
        this.withNumberOfPlayersSelect(document, form)
            .withPlayOnlineCheckbox(document, form)
            .withDeckTypeSelect(document, form)
            .withNumberOfCardsInput(document, form)
            .withGameOptionsSubmit(document, form)
            .withDeckPreviewImage(document, form)

        BODY_ELEMENT.appendChild(form);
        return this;
    }

    withPlayOnlineCheckbox(document, form) {
        let div = new ElementBuilder(document)
            .withTag(DIV_TAG).build()
            .appendChild(new ElementBuilder(document)
                .withTag(SPAN_TAG).withInnerText('Play online?').build())
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withAttribute('type', 'checkbox')
                .withAttribute('name', this.playOnlineCheckboxName).build());
        form.appendChild(div);
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
            .withClass(this.playerNameForm)
            // Force hard coded width that can be used as a reference to scale for mobile viewing
            .withAttribute('style', 'display: none; width: ' + PLAYER_FORM_WIDTH + 'px')
            .withTag("form").build();

        for (let i = 1; i <= MAX_PLAYERS; i++) {
            form.appendChild(new ElementBuilder(document)
                .withTag(DIV_TAG)
                .withClass(this.playerNamePrefixClass + i)
                .withAttribute("style", "display: none;").build()
                .appendChild(new ElementBuilder(document).withTag(SPAN_TAG)
                .withInnerText("Player " + i + ' name:').build())
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
