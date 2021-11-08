/**
 * Class that models a deck of playing cards.
 */
const PLAYING_CARD_DECK_SUITS = [SPADES, HEARTS, DIAMONDS, CLUBS];
const PLAYING_CARD_RANKS = [TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, K, Q, J, A];

let cards = [];
for (let suit of PLAYING_CARD_DECK_SUITS) {
    for (let rank of PLAYING_CARD_RANKS) {
        let id = rank + '-' + suit;
        let x = -1 * IMAGE_OFFSETS[id]['x'] * CARD_WIDTH;
        let y = -1 * IMAGE_OFFSETS[id]['y'] * CARD_HEIGHT;
        let card = new PlayingCard(rank, suit, x, y, PLAYING_CARD_IMAGE);
        cards.push(card);
    }
}
const PLAYING_CARDS = cards;

class PlayingCardDeck extends Deck {
    constructor(image) {
        super(PLAYING_CARDS, image);
        this.image = image;
    }
}
