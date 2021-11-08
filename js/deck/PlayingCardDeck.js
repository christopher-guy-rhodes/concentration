/**
 * Class that models a deck of playing cards.
 */
class PlayingCardDeck extends Deck {
    static PLAYING_CARD_IMAGE = '../images/decks/playing_cards.png';

    constructor() {
        super(PlayingCardDeck.getCards(), PlayingCardDeck.PLAYING_CARD_IMAGE);
    }

    static getCards() {
        let cards = [];
        const suits = [SPADES, HEARTS, DIAMONDS, CLUBS];
        const ranks = [A, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, J, Q, K];
        for (let y = 0; y < suits.length; y++) {
            let suit = suits[y];
            for (let x = 0; x < ranks.length; x++) {
                let rank = ranks[x];
                let xImageOffset = -1 * x * CARD_WIDTH;
                let yImageOffset = -1 * y * CARD_HEIGHT;
                let card = new PlayingCard(rank, suit, xImageOffset, yImageOffset, PlayingCardDeck.PLAYING_CARD_IMAGE);
                cards.push(card);
            }
        }
        return cards;
    }
}
