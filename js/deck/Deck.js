class Deck {
    constructor() {
        this.suits = [SPADES, HEARTS, DIAMONDS, CLUBS];

        this.cards = [];
        for (let suit of this.suits) {
            this.cards = this.cards.concat([
                new Card(A, suit),
                new Card(TWO, suit),
                new Card(THREE, suit),
                new Card(FOUR, suit),
                new Card(FIVE, suit),
                new Card(SIX, suit),
                new Card(SEVEN, suit),
                new Card(EIGHT, suit),
                new Card(NINE, suit),
                new Card(TEN, suit),
                new Card(J, suit),
                new Card(Q, suit),
                new Card(K, suit),
            ]);
        }
    }

    getSortedCards() {
        return this.cards;
    }

    getShuffledCards() {
        let array = Array.from(this.cards);
        let currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    getNumberOfCards() {
        return this.cards.length;
    }
}
