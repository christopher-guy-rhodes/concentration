/**
 * Main class to render card game
 */
class GameBoard {
    constructor(deckType, numberOfRows, numberOfCardsPerRow) {

        this.deckType = deckType;
        this.numberOfRows = numberOfRows;
        this.numberOfCardsPerRow = numberOfCardsPerRow;

        let numberOfCards = this.numberOfRows * this.numberOfCardsPerRow;

        this.deck = undefined;
        switch(this.deckType) {
            case 'picture':
                this.deck = new PictureCardDeck(numberOfCards);
                break;
            case 'playing':
            default :
                this.deck = new PlayingCardDeck(numberOfCards);
        }

        if (this.numberOfRows * this.numberOfCardsPerRow % 2 !== 0 ||
            numberOfCards < 2 ||
            numberOfCards > this.deck.getMaxNumberOfCards()) {
            let msg = 'There must be an even number of cards. Greater than 1 and less than '
                + this.deck.getMaxNumberOfCards();
            throw new Error(msg);
        }


        // Setup an grid that the cards will be dealt to
        this.gridPositions = [];
        for (let y = 0; y < this.numberOfRows; y++) {
            for (let x = 0; x < this.numberOfCardsPerRow; x++) {
                this.gridPositions.push({x : x, y : y});
            }
        }
    }

    /**
     * Renders the shuffled deck on the screen
     * @param document the dom document
     */
    renderGameBoard(document) {
        this.setViewPort();
        validateRequiredParams(this.renderGameBoard, 'document');
        this.deck.shuffleCards();
        this.cards = this.deck.dealCards();

        let gridPositionIndex = 0;
        for (let card of this.cards) {
            card.setFaceDown();
            $('.' + card.getId()).css('display', 'block');
            let x = undefined;
            let y = undefined;
            try {
                x = this.gridPositions[gridPositionIndex]['x'];
                y = this.gridPositions[gridPositionIndex]['y'];
            } catch (error) {
                console.log('could not find x or y for index %s grid %o cards %o',gridPositionIndex, this.gridPositions, this.cards);
            }
            this.renderCard(document, card, x, y);
            gridPositionIndex++;
        }
    }

    renderCard(document, card, x, y) {
        validateRequiredParams(this.renderCard, arguments, 'document', 'card', 'x', 'y');
        card.getCardImage().renderCssAndHtml(document,
            x * card.getCardImage().getWidth(),
            y * card.getCardImage().getHeight());
    }

    setViewPort() {
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        let width = $(window).width();
        let height = $(window).height();
        let scalingDimension = width;
        let card = this.deck.dealTopCard();
        viewportMeta.content = viewportMeta.content.replace(/initial-scale=[^,]+/,
            'initial-scale=' + (scalingDimension / (this.numberOfRows * card.getCardImage().getWidth())));

    }

    /**
     * Remove a set of cards from the game board.
     * @param card1 the fist card
     * @param card2 the second matching card
     */
    removeCards(cards) {
        for (let card of cards) {
            $('.' + card.getId()).css('display', 'none');
        }
    }

    /**
     * Get the deck used for the game board.
     * @returns {Deck}
     */
    getDeck() {
        return this.deck;
    }
}
