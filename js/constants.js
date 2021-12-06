// Online game S3 config
const COGNITO_IDENTITY_POOL_ID = 'us-east-1:5c67bf62-755c-41f2-8ddf-a0a0ceea6a18';
const S3_REGION = 'us-east-1';
const S3_BUCKET_NAME = 'concentrationgame';
const S3_ONLINE_GAMEPLAY_DIR = 'state';

// Online game config
const AWS_SDK_API_VERSION = '2006-03-01';
const POLL_PLAYERS_DELAY = 5000;
const POLL_PLAYERS_ITERATIONS = 60;
const MAX_GAME_LOG_POLL_ITERATIONS = 30;
const GAME_LOG_POLL_SLEEP_MS = 5000;
const GAME_LOG_CARD_FLIP_SLEEP_MS = 2000;
const GAME_LOG_CATCH_UP_SLEEP_MS = 2000;
const LOG_CARD_FLIP_RETRIES = 20;
const LOG_CARD_FLIP_RETRY_DELAY = 100;
const GAME_WRAP_UP_DELAY_MS = 5000;
const GAME_WRAP_UP_ITERATIONS = 100;
const GAME_RESET_NON_OWNER_DELAY = 10000;

// Game config
const CARD_FLIP_DELAY_MS = 1500;
const MAX_PLAYERS = 4;
const PREVIEW_IMG_WIDTH = 1300;
const PLAYER_FORM_WIDTH = 1000;
const CARD_FLIP_ANIMATION_TIME_MS = 500;
const VIEW_PORT_SCALING_FUDGE_FACTOR = 50;


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
