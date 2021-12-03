// Game config
const CARD_FLIP_DELAY_MS = 1500;
const MAX_PLAYERS = 4;
const PREVIEW_IMG_WIDTH = 1300;
const PLAYER_FORM_WIDTH = 1000;
const CARD_FLIP_ANIMATION_TIME_MS = 500;
const GAME_WRAP_UP_DELAY_MS = 5000;
const GAME_RESET_NON_OWNER_DELAY = 10000;
const GAME_WRAP_UP_ITERATIONS = 60;
const LOG_CARD_FLIP_RETRIES = 10;
const LOG_CARD_FLIP_RETRY_DELAY = 100;
const MAX_GAME_LOG_POLL_ITERATIONS = 30;
const GAME_LOG_POLL_SLEEP_MS = 2000;

// Online game config
const POLL_PLAYERS_DELAY = 5000;
const POLL_PLAYERS_ITERATIONS = 60;

// DOM constants
const BODY_TAG = 'body';
const HEAD_TAG = 'head';
const FORM_TAG = 'form';
const H2_TAG = 'h2';
const H3_TAG = 'h3';
const DIV_TAG = 'div';
const INPUT_TAG = 'input';
const SELECT_TAG = 'select';
const OPTION_TAG = 'option';
const BREAK_TAG = 'br';
const ANCHOR_TAG = 'a';
const STYLE_TAG = 'style';
const SPAN_TAG = 'span';
const IMAGE_TAG = 'img';
const PARAGRAPH_TAG = 'p';
const STRONG_TAG = 'strong';

// Css constants
const FRONT_ID_SUFFIX = 'FRONT';
const BACK_ID_SUFFIX = 'BACK';

// Top level DOM elements
const GAMEBOARD_ELEMENT = new ElementBuilder(document).withTag(DIV_TAG)
    .withAttribute('style', 'display : none')
    .withClass('gameBoard').build();
const BODY_ELEMENT = new ElementBuilder(document).withTag(BODY_TAG).build();
const HEAD_ELEMENT = new ElementBuilder(document).withTag(HEAD_TAG).build();
