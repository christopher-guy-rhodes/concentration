class Deck {
    constructor(cards, image) {
        this.cards = cards;
        // Keep index from card id to card for random access card lookup by id
        this.cardIndex = {};

        for (let card of PLAYING_CARDS) {
            this.indexCard(card);
        }
        this.cards = PLAYING_CARDS;

        this.image = image;
    }

    /**
     * Get a card by id.
     * @param id the unique id for the card
     * @returns {PlayingCard} the card with the specified id
     */
    getCardById(id) {
        return this.cardIndex[id];
    }

    /**
     * Deal the cards.
     * @returns {[PlayingCard]} the deck of cards
     */
    dealCards() {
        return this.cards;
    }

    /**
     * Shuffle the deck of cards.
     */
    shuffleCards() {
        let currentIndex = this.cards.length;

        // while there remain cards to shuffle
        while (currentIndex != 0) {

            // Pick a remaining card
            let randomIndex = Math.floor(Math.random() * currentIndex--);

            // And swap it with the current card.
            [this.cards[currentIndex], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[currentIndex]];
        }
    }

    /**
     * Get the number of cards in the deck.
     * @returns {number} the number of cards in the deck
     */
    getNumberOfCards() {
        return this.cards.length;
    }


    /* private */
    indexCard(card) {
        this.cardIndex[card.getId()] = card;
    }
}
