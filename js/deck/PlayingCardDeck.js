/**
 * Class that models a deck of playing cards.
 */
// Must match order of suit rows in PLAYING_CARD_IMAGE
const PLAYING_CARD_DECK_SUITS = [SPADES, HEARTS, DIAMONDS, CLUBS];
// MuST match order of rank columns in PLAYING_CARD_IMAGE
const PLAYING_CARD_RANKS = [A, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, J, Q, K];

let cards = [];
let i = 0;
let j = 0;
for (let suit of PLAYING_CARD_DECK_SUITS) {
    for (let rank of PLAYING_CARD_RANKS) {
        let id = rank + '-' + suit;
        let xImageOffset = -1 * i * CARD_WIDTH;
        let yImageOffset = -1 * j * CARD_HEIGHT;
        let card = new PlayingCard(rank, suit, xImageOffset, yImageOffset, PLAYING_CARD_IMAGE);
        cards.push(card);
        i++;
    }
    i = 0;
    j++;
}
const PLAYING_CARDS = cards;

class PlayingCardDeck extends Deck {
    constructor(image) {
        super(PLAYING_CARDS, image);
        this.image = image;
    }
}
