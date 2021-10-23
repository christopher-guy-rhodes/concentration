class Deck {
    constructor() {
        this.cards = [
            new Card(A,     SPADES, 0,  0),
            new Card(TWO,   SPADES, 1,  0),
            new Card(THREE, SPADES, 2,  0),
            new Card(FOUR,  SPADES, 3,  0),
            new Card(FIVE,  SPADES, 4,  0),
            new Card(SIX,   SPADES, 5,  0),
            new Card(SEVEN, SPADES, 6,  0),
            new Card(EIGHT, SPADES, 7,  0),
            new Card(NINE,  SPADES, 8,  0),
            new Card(TEN,   SPADES, 9,  0),
            new Card(J,     SPADES, 10, 0),
            new Card(Q,     SPADES, 11, 0),
            new Card(K,     SPADES, 12, 0),

            new Card(A,     HEARTS, 0,  1),
            new Card(TWO,   HEARTS, 1,  1),
            new Card(THREE, HEARTS, 2,  1),
            new Card(FOUR,  HEARTS, 3,  1),
            new Card(FIVE,  HEARTS, 4,  1),
            new Card(SIX,   HEARTS, 5,  1),
            new Card(SEVEN, HEARTS, 6,  1),
            new Card(EIGHT, HEARTS, 7,  1),
            new Card(NINE,  HEARTS, 8,  1),
            new Card(TEN,   HEARTS, 9,  1),
            new Card(J,     HEARTS, 10, 1),
            new Card(Q,     HEARTS, 11, 1),
            new Card(K,     HEARTS, 12, 1),

            new Card(A,     DIAMONDS, 0,  2),
            new Card(TWO,   DIAMONDS, 1,  2),
            new Card(THREE, DIAMONDS, 2,  2),
            new Card(FOUR,  DIAMONDS, 3,  2),
            new Card(FIVE,  DIAMONDS, 4,  2),
            new Card(SIX,   DIAMONDS, 5,  2),
            new Card(SEVEN, DIAMONDS, 6,  2),
            new Card(EIGHT, DIAMONDS, 7,  2),
            new Card(NINE,  DIAMONDS, 8,  2),
            new Card(TEN,   DIAMONDS, 9,  2),
            new Card(J,     DIAMONDS, 10, 2),
            new Card(Q,     DIAMONDS, 11, 2),
            new Card(K,     DIAMONDS, 12, 2),

            new Card(A,     CLUBS,    0,  3),
            new Card(TWO,   CLUBS,    1,  3),
            new Card(THREE, CLUBS,    2,  3),
            new Card(FOUR,  CLUBS,    3,  3),
            new Card(FIVE,  CLUBS,    4,  3),
            new Card(SIX,   CLUBS,    5,  3),
            new Card(SEVEN, CLUBS,    6,  3),
            new Card(EIGHT, CLUBS,    7,  3),
            new Card(NINE,  CLUBS,    8,  3),
            new Card(TEN,   CLUBS,    9,  3),
            new Card(J,     CLUBS,   10, 3),
            new Card(Q,     CLUBS,   11, 3),
            new Card(K,     CLUBS,   12, 3)
        ];
    }

    getSortedDeck() {
        return this.cards;
    }

    getShuffledDeck() {
        let array = Array.from(this.cards);
        //array[0].setX(1);
        //array[1].setX(0);
        return array;
    }
}
