/**
 * Main class to render card game
 */
class GameBoard {
    constructor(numberOfCards, deckType, clickableClass) {
        validateRequiredParams(this.constructor, arguments, 'numberOfCards', 'deckType', 'clickableClass');
        this.numberOfCards = numberOfCards;
        this.deckType = deckType;
        this.clickableClass = clickableClass;


        this.deck = this.getDeckByType(deckType, numberOfCards);
        this.deck.validateNumberOfCards(numberOfCards);

        console.log('the square root is: ' + Math.sqrt(this.numberOfCards));

        // If the cards fit into a square the number of rows will be the sqrt of the number of cards. Use that as the
        // number of rows or the ceiling of that if the cards don't fit into a nice square. If they don't fit into
        // a nice square there will be more cards in the row then the number of rows
        this.numberOfRows = this.getNumberOfRowsThatMaximizesNumberOfCardsPerRow();
        this.numberOfCardsPerRow = this.numberOfCards / this.numberOfRows;
    }

    getNumberOfRowsThatMaximizesNumberOfCardsPerRow() {

        // Let n be the number of cards n = a*b . We want to minimize b - a so that a and b are as large as possible.
        // It follows that a is the largest divisor that is less than or equal to the square root.
        let a = Math.floor(Math.sqrt(this.numberOfCards));
        while(this.numberOfCards % a !== 0) {
            a--;
        }
        return a;
    }

    /**
     * Renders the shuffled deck on the grid.
     * @param document the dom document
     */
    renderGameBoard(document) {
        validateRequiredParams(this.renderGameBoard, arguments, 'document');

        this.setViewPort();
        this.deck.shuffleCards();
        let cards = this.deck.getCards();
        let gridPositions = this.buildGrid();

        let gridPositionIndex = 0;
        console.log('number of cards per row:' + this.numberOfCardsPerRow);
        console.log('number of rows:' + this.numberOfRows);
        console.log('cards:' + cards.length);
        console.log('grid positions: %o', gridPositions);
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
        $('.gameBoard').css('display', 'block');
        console.log('setting width to ' + this.numberOfRows + 'x width');
        console.log('setting height to ' + this.numberOfRows + 'x height');

        $('.gameBoard').css('height', this.numberOfRows * this.deck.getCardHeight());
        $('.gameBoard').css('width', this.numberOfCardsPerRow * this.deck.getCardWidth());
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
        viewportMeta.content = viewportMeta.content.replace(/initial-scale=[^,]+/,
            'initial-scale=' + (scalingDimension / (this.numberOfRows * this.deck.getCardWidth())));

    }
}
