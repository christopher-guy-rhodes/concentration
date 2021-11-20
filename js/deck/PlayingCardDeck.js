const A = 'A';
const TWO = 'TWO';
const THREE = 'THREE';
const FOUR = 'FOUR';
const FIVE = 'FIVE';
const SIX = 'SIX';
const SEVEN = 'SEVEN';
const EIGHT = 'EIGHT';
const NINE = 'NINE';
const TEN = 'TEN';
const J = 'J';
const K = 'K';
const Q = 'Q';

const SPADES = 'SPADES';
const HEARTS = 'HEARTS';
const DIAMONDS = 'DIAMONDS';
const CLUBS = 'CLUBS';

/**
 * Class that models a deck of playing cards.
 */
class PlayingCardDeck extends Deck {
    static PLAYING_CARD_IMAGE = '../images/decks/playing_cards.png';

    constructor(numberOfCards, clickableClass) {
        super(PlayingCardDeck.dealCards(numberOfCards, clickableClass),
            PlayingCardDeck.getNumberOfCardsInDeck(),
            PlayingCardDeck.PLAYING_CARD_IMAGE);
        this.numberOfCards = numberOfCards;
    }

    validateNumberOfCards(numSelected) {
        let numCardsInDeck = PlayingCardDeck.getNumberOfCardsInDeck();
        if (this.numberOfCards !== 2 &&
            (this.numberOfCards / 2 % 2 !== 0 || numSelected < 0 || numSelected > numCardsInDeck)) {
            throw new Error("In order for there to be an even number of matches you must use between 2 and "
                + numCardsInDeck + " cards. There must be an even number of pairs cards.");
        }
    }

    /**
     * Get the deck image
     * @returns {string} the url of the deck image
     */
    static getDeckImage() {
        return PlayingCardDeck.PLAYING_CARD_IMAGE;
    }


    /**
     * Get the maximum number of cards in the deck.
     */
    static getNumberOfCardsInDeck() {
        return PlayingCardDeck.getSuits().length * PlayingCardDeck.getRanks().length;
    }

    static getSuits() {
        return [SPADES, CLUBS, DIAMONDS, HEARTS];
    }

    static getRanks() {
        return [A, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, J, Q, K];
    }

    static dealCards(numberOfCards, clickableClass) {
        let cards = [];
        const suits = this.getSuits();
        const ranks = this.getRanks();

        main_loop:
        for (let y = 0; y < suits.length; y++) {
            let suit = suits[y];
            for (let x = 0; x < ranks.length; x++) {
                let rank = ranks[x];
                let card = new PlayingCard(rank, suit, x, y, clickableClass);
                cards.push(card);

                // We may not be using a full deck

                // Are there any cards left
                if (cards.length >= numberOfCards) {
                    break main_loop;
                }

                // Make sure we only use 1/4 the number of cards from each suit so that there will be matches. For
                // example if there are 4 cards we want to grab two aces and two twos.
                if ((x + 1) * suits.length >= numberOfCards) {
                    break;
                }
            }
        }
        return cards;
    }
}
