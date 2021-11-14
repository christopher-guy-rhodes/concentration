/**
 * Main class to render card game
 */
class GameBoard {
    constructor(deckType, numberOfRows, numberOfCardsPerRow, clickableClass) {
        validateRequiredParams(this.constructor, arguments, 'deckType', 'numberOfRows', 'numberOfCardsPerRow',
            'clickableClass');
        this.deckType = deckType;
        this.numberOfRows = numberOfRows;
        this.numberOfCardsPerRow = numberOfCardsPerRow;
        this.clickableClass = clickableClass;

        let numberOfCards = this.numberOfRows * this.numberOfCardsPerRow;
        this.deck = this.getDeckByType(deckType, numberOfCards);
        this.deck.validateNumberOfCards(numberOfCards);
    }

    /**
     * Renders the shuffled deck on the grid.
     * @param document the dom document
     */
    renderGameBoard(document) {
        validateRequiredParams(this.renderGameBoard, arguments, 'document');

        this.setViewPort();
        //this.deck.shuffleCards();
        let cards = this.deck.getCards();
        let gridPositions = this.buildGrid();

        let gridPositionIndex = 0;
        for (let card of cards) {
            card.setFaceDown();
            $('.' + card.getId()).css('display', 'block');
            let x = gridPositions[gridPositionIndex]['x'];
            let y = gridPositions[gridPositionIndex]['y'];
            card.renderCard(document, x, y);
            gridPositionIndex++;
        }
    }

    /**
     * Remove a set of cards from the game board.
     * @param card1 the fist card
     * @param card2 the second matching card
     */
    removeCards(cards) {
        for (let card of cards) {
            $('#' + card.getId()).css('display', 'none');
        }
    }

    /**
     * Get the deck used for the game board.
     * @returns {Deck}
     */
    getDeck() {
        return this.deck;
    }

    /* private */
    getDeckByType(deckType, numberOfCards) {
        let deck = undefined;
        switch(deckType) {
            case 'picture':
                deck = new PictureCardDeck(numberOfCards, this.clickableClass);
                break;
            case 'playing':
            default :
                deck = new PlayingCardDeck(numberOfCards, this.clickableClass);
        }

        return deck;
    }

    /* private */
    buildGrid() {
        let gridPositions = [];
        for (let y = 0; y < this.numberOfRows; y++) {
            for (let x = 0; x < this.numberOfCardsPerRow; x++) {
                gridPositions.push({x : x, y : y});
            }
        }
        return gridPositions;
    }

    /**
     * private
     *
     * Set the scale of the screen for mobile browsers.
     */
    setViewPort() {
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        let width = $(window).width();
        let height = $(window).height();
        let scalingDimension = width;
        let card = this.deck.dealTopCard();
        viewportMeta.content = viewportMeta.content.replace(/initial-scale=[^,]+/,
            'initial-scale=' + (scalingDimension / (this.numberOfRows * card.getCardImage().getWidth())));

    }
}
