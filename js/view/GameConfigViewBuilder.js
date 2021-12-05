class GameConfigViewBuilder {

    constructor() {
        this.gameOptionsSubmitButtonClass = undefined;
        this.gameOptionsFormClass = undefined;
        this.deckTypeSelectorClass = undefined;
        this.playerNameSubmitClass = undefined;
        this.gameResetClass = undefined;
        this.numPlayersSelectorClass = undefined;
        this.numberOfCardsToUseName = undefined;
        this.scoreBoardPlayerPrefixClass = undefined;
        this.playerNamePrefixClass = undefined;
        this.nameInputPrefixClass = undefined;
        this.playerNameForm = undefined;
        this.scoreBoardForm = undefined;
        this.playOnlineCheckboxName = undefined;
        this.waitLongerContainerClass = undefined;
        this.waitLongerButtonClass = undefined;
        this.waitLongerForTurnContainer = undefined;
        this.waitLongerForTurnButtonClass = undefined;
        this.waitingContainerClass = undefined;
        this.waitingOnClass = undefined;
        this.invitationClass = undefined;
        this.invitationLinkClass = undefined;

    }

    withPlayOnlineCheckboxName(playOnlineCheckboxName) {
        this.playOnlineCheckboxName = playOnlineCheckboxName;
        return this;
    }

    withScoreBoardForm(scoreBoardForm) {
        this.scoreBoardForm = scoreBoardForm;
        return this;
    }

    withPlayerNameForm(playerNameForm) {
        this.playerNameForm = playerNameForm;
        return this;
    }

    withNameInputPrefixClass(nameInputPrefixClass) {
        this.nameInputPrefixClass = nameInputPrefixClass;
        return this;
    }

    withPlayerNameSubmitClass(playerNameSubmitClass) {
        this.playerNameSubmitClass = playerNameSubmitClass;
        return this;
    }

    withDeckTypeSelectorClass(deckTypeClass) {
        this.deckTypeSelectorClass = deckTypeClass;
        return this;
    }

    withGameOptionsSubmitButtonClass(gameOptionsSubmitButtonClass) {
        this.gameOptionsSubmitButtonClass = gameOptionsSubmitButtonClass;
        return this;
    }

    withGameOptionsFormClass(gameOptionsFormClass) {
        this.gameOptionsFormClass = gameOptionsFormClass;
        return this;
    }

    withGameResetClass(gameResetClass) {
        this.gameResetClass = gameResetClass;
        return this;
    }

    withNumPlayersClass(numPlayersSelectorClass) {
        this.numPlayersSelectorClass = numPlayersSelectorClass;
        return this;
    }

    withNumberOfCardsToUseName(numberOfCards) {
        this.numberOfCardsToUseName = numberOfCards;
        return this;
    }

    withPlayerPrefixClass(prefix) {
        this.scoreBoardPlayerPrefixClass = prefix;
        return this;
    }

    withPlayerNamePrefixClass(prefix) {
        this.playerNamePrefixClass = prefix;
        return this;
    }

    withWaitLongerContainerClass(waitClass) {
        this.waitLongerContainerClass = waitClass;
        return this;
    }

    withWaitLongerButtonClass(waitButton) {
        this.waitLongerButtonClass = waitButton;
        return this;
    }

    withWaitLongerForTurnContainer(waitClass) {
        this.waitLongerForTurnContainer = waitClass;
        return this;
    }

    withWaitLongerForTurnButtonClass(waitButton) {
        this.waitLongerForTurnButtonClass = waitButton;
        return this;
    }

    withWaitingContainerClass(waitingContainerClass) {
        this.waitingContainerClass = waitingContainerClass;
        return this;
    }

    withWaitingOnClass(waitingOnClass) {
        this.waitingOnClass = waitingOnClass;
        return this;
    }

    withInvitationClass(invitationClass) {
        this.invitationClass = invitationClass;
        return this;
    }

    withInvitationLInkClass(invitationLinkClass) {
        this.invitationLinkClass = invitationLinkClass;
        return this;
    }

    build() {
        return new GameConfigView(this.gameOptionsFormClass, this.gameOptionsSubmitButtonClass,
            this.deckTypeSelectorClass, this.playerNameSubmitClass, this.gameResetClass, this.numPlayersSelectorClass,
            this.numberOfCardsToUseName, this.scoreBoardPlayerPrefixClass, this.playerNamePrefixClass,
            this.nameInputPrefixClass, this.playerNameForm, this.scoreBoardForm, this.playOnlineCheckboxName,
            this.waitLongerContainerClass, this.waitLongerButtonClass, this.waitLongerForTurnContainer,
            this.waitLongerForTurnButtonClass, this.waitingContainerClass, this.waitingOnClass, this.invitationClass,
            this.invitationLinkClass);
    }
}
