/**
 * Class that represents a playing card.
 */
class PlayingCard extends Card {
    constructor(rank, suit, x, y, clickableClass) {
        super(rank + '-' + suit,
            x,
            y,
            0,
            4,
            100,
            146,
            PlayingCardDeck.PLAYING_CARD_IMAGE, clickableClass);
        this.rank = rank;
        this.suit = suit;
    }

    /**
     * Determines if the other card is a match with this card.
     * @param otherCard the other card to compare to this card for a match
     */
    isMatch(otherCard) {
        return this.rank === otherCard.rank && this.isBlackSuit() === otherCard.isBlackSuit();
    }

    /* private */
    isBlackSuit() {
        return this.suit === CLUBS || this.suit === SPADES;
    }
}
