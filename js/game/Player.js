/**
 * Class that handles a player in the game.
 */
class Player {
    constructor(playerName, playerNumber) {
        validateRequiredParams(this.constructor, 'playerName', 'playerNumber');
        // Set of card ids that the player has matched
        this.matches = [];
        this.firstCard = undefined;
        this.playerName = playerName;
        this.playerNumber = playerNumber;
        this.numberOfTries = 0;
    }

    /**
     * Get the player number
     * @returns {Number} the player number
     */
    getPlayerNumber() {
        return this.playerNumber;
    }

    /**
     * Gets the players name.
     * @returns {String}
     */
    getPlayerName() {
        return this.playerName;
    }

    /**
     * Get the number of matches a player has made.
     * @returns {number}
     */
    getNumberOfMatches() {
        return this.matches.length;
    }

    /**
     * Gets the player's current score
     * @returns {number} the current score
     */
    getScore() {
        return this.matches.length / 2;
    }

    getNumberOfTries() {
        return this.numberOfTries;
    }

    /**
     * Takes a turn for the player. Returns the set of cards they have flipped in this turn.
     * @param card the card the player has flipped
     * @returns {[String]} all of the cards the player has flipped in this turn
     */
    takeTurn(card) {
        let selections = undefined;
        if (this.firstCard === undefined || this.firstCard.getId() === card.getId()) {
            this.firstCard = card;
            selections = [card];
        } else {
            console.log('turn with ' + this.firstCard.getId() + ' and ' + card.getId());
            this.numberOfTries++;
            selections = [this.firstCard, card];

            if (this.firstCard.isMatch(card)) {
                this.matches = this.matches.concat([this.firstCard.getId(), card.getId()]);
            }

            // Player has selected two cards, clear state
            this.firstCard = undefined;
        }
        return selections;
    }
}
