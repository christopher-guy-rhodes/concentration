class GameConfigView {
    constructor(gameOptionsFormClass, gameOptionsSubmitButtonClass, deckTypeSelectorClass,
                playerNameSubmitButtonClass, gameResetClass, numPlayersSelectorClass, numberOfCardsToUseName,
                scoreBoardPlayerPrefixClass, playerNamePrefixClass, nameInputPrefixClass, playerNameForm,
                scoreBoardForm, playOnlineCheckboxName, waitLongerContainerClass, waitLongerButtonClass,
                waitLongerForTurnContainer, waitLongerForTurnButtonClass, waitingContainerClass, waitingOnClass,
                invitationClass, invitationLinkClass) {
        validateRequiredParams(this.constructor, arguments, 'gameOptionsFormClass', 'gameOptionsSubmitButtonClass',
            'deckTypeSelectorClass', 'playerNameSubmitButtonClass', 'gameResetClass', 'numPlayersSelectorClass',
            'numberOfCardsToUseName', 'scoreBoardPlayerPrefixClass', 'playerNamePrefixClass', 'nameInputPrefixClass',
            'playerNameForm', 'scoreBoardForm', 'playOnlineCheckboxName', 'waitLongerContainerClass',
            'waitLongerButtonClass', 'waitLongerForTurnContainer', 'waitLongerForTurnButtonClass',
            'waitingContainerClass', 'waitingOnClass', 'invitationClass', 'invitationLinkClass');
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
        this.waitLongerContainerClass = waitLongerContainerClass;
        this.waitLongerButtonClass = waitLongerButtonClass;
        this.waitLongerForTurnContainer = waitLongerForTurnContainer;
        this.waitLongerForTurnButtonClass = waitLongerForTurnButtonClass;
        this.waitingContainerClass = waitingContainerClass;
        this.waitingOnClass = waitingOnClass;
        this.invitationClass = invitationClass;
        this.invitationLinkClass = invitationLinkClass;
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
        BODY_ELEMENT.appendChild(GAMEBOARD_ELEMENT);
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

        let invitationDiv = new ElementBuilder(document).withTag(DIV_TAG)
            .withAttribute('style', 'display: none')
            .withClass(this.invitationClass).build();

        invitationDiv.appendChild(new ElementBuilder(document).withTag(STRONG_TAG)
            .withInnerText('Invitation Links').build());

        for (let i = 2; i < MAX_PLAYERS; i++) {
            invitationDiv.appendChild(new ElementBuilder(document).withTag(DIV_TAG)
                .withClass(this.invitationLinkClass + i).build())
        }

        div.appendChild(invitationDiv);

        let waitingDiv = new ElementBuilder(document)
            .withTag(DIV_TAG)
            .withClass(this.waitingContainerClass)
            .withAttribute('style', 'display: none').build()
            .appendChild(new ElementBuilder(document).withTag(STRONG_TAG)
                .withInnerText('Waiting for:').build());

        for (let i = 1; i <= MAX_PLAYERS; i++) {
            waitingDiv.appendChild(new ElementBuilder(document)
                .withTag(SPAN_TAG)
                .withClass(this.waitingOnClass + i).build());
        }

        div.appendChild(waitingDiv);

        let waitLongerDiv = new ElementBuilder(document).withTag(DIV_TAG)
            .withClass(this.waitLongerContainerClass)
            .withAttribute('style', 'display: none')
            .withInnerText('Gave up waiting   ').build()
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withClass(this.waitLongerButtonClass)
                .withAttribute('type', 'button')
                .withAttribute('value', 'Wait longer').build());

        div.appendChild(waitLongerDiv);

        let waitLongerForTurnContainer = new ElementBuilder(document).withTag(DIV_TAG)
            .withClass(this.waitLongerForTurnContainer)
            .withAttribute('style', 'display: none')
            .withInnerText('Gave up waiting for turn to be taken   ').build()
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withClass(this.waitLongerForTurnButtonClass)
                .withAttribute('type', 'button')
                .withAttribute('value', 'Wait longer').build());

        div.appendChild(waitLongerForTurnContainer);

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
