/**
 * Class that models a deck of playing cards.
 */
class PlayingCardDeck extends Deck {
    static PLAYING_CARD_IMAGE = '../images/decks/playing_cards.png';

    constructor(numberOfCards) {
        super(PlayingCardDeck.getCards(numberOfCards),
            PlayingCardDeck.getSuits().length * PlayingCardDeck.getRanks().length,
            PlayingCardDeck.PLAYING_CARD_IMAGE);
        this.numberOfCards = numberOfCards;
    }

    static getSuits() {
        return [SPADES, HEARTS, DIAMONDS, CLUBS];
    }

    static getRanks() {
        return [A, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, J, Q, K];
    }

    static getCards(numberOfCards) {
        let cards = [];
        const suits = this.getSuits();
        const ranks = this.getRanks();
        for (let y = 0; y < suits.length; y++) {
            let suit = suits[y];
            for (let x = 0; x < ranks.length; x++) {
                let rank = ranks[x];
                let xImageOffset = -1 * x * CARD_WIDTH;
                let yImageOffset = -1 * y * CARD_HEIGHT;
                let card = new PlayingCard(rank, suit, xImageOffset, yImageOffset, PlayingCardDeck.PLAYING_CARD_IMAGE);
                cards.push(card);

                // We may not be playing with a full deck. Make sure we only use 1/4 the number of cards from each suit
                // so that there will be matches. For example if there are 4 cards we want to grab two aces and two
                // twos.
                if ((x + 1) * 4 >= numberOfCards) {
                    break;
                }
            }
        }
        return cards;
    }
}
