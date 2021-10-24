/**
 * Class that models a deck of playing cards.
 */
class Deck {
    constructor() {
        this.suits = [SPADES, HEARTS, DIAMONDS, CLUBS];

        // Keep index from card id to card for random access card lookup by id
        this.cardIndex = {};

        this.cards = [];
        for (let suit of this.suits) {
            this.cards = this.cards.concat([
                this.indexCard(A, suit),
                this.indexCard(TWO, suit),
                this.indexCard(THREE, suit),
                this.indexCard(FOUR, suit),
                this.indexCard(FIVE, suit),
                this.indexCard(SIX, suit),
                this.indexCard(SEVEN, suit),
                this.indexCard(EIGHT, suit),
                this.indexCard(NINE, suit),
                this.indexCard(TEN, suit),
                this.indexCard(J, suit),
                this.indexCard(Q, suit),
                this.indexCard(K, suit),
            ]);
        }
    }

    /**
     * Get a card by id.
     * @param id the unique id for the card
     * @returns {Card} the card with the specified id
     */
    getCardById(id) {
        return this.cardIndex[id];
    }

    /**
     * Deal the cards.
     * @returns {[Card]} the deck of cards
     */
    dealCards() {
        return this.cards;
    }

    /**
     * Shuffle the deck of cards.
     */
    shuffleCards() {
        let currentIndex = this.cards.length;//,  randomIndex;

        // while there remain cards to shuffle
        while (currentIndex != 0) {

            // Pick a remaining card
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

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
    indexCard(rank, suit) {
        let card = new Card(rank, suit);
        this.cardIndex[card.getId()] = card;
        return card;
    }
}
