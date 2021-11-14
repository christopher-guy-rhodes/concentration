class ScoreBoard {
    constructor(players) {
        this.players = players;
    }

    /**
     * Highlights the player name of the current player.
     * @param player the player that should be highlighted in the score board
     */
    updateStats(highlightedPlayer) {
        for (let player of this.players) {
            let scoreBoardEntry = undefined;
            if (player.getPlayerNumber() === highlightedPlayer.getPlayerNumber()) {
                scoreBoardEntry = '<strong>&gt;&gt;' + player.getPlayerName() + '&lt;&lt;   </strong>';
            } else {
                scoreBoardEntry = player.getPlayerName();
            }
            scoreBoardEntry = scoreBoardEntry + ' ' + player.getScore() + ' matches in ' + player.getNumberOfTries()
                + ' turns';
            $('.player' + player.getPlayerNumber()).html(scoreBoardEntry);
        }
    }

    /**
     * Display the winning player on the scoreboard.
     * @param winningPlayers the array of winning player
     */
    displayWinners(winningPlayers) {
        for (let winningPlayer of winningPlayers) {
            let scoreBoardEntry = winningPlayer.getPlayerName() + ' <strong class="winner" style="color: #00ff00;"> is the winner!</strong> ' +
                winningPlayer.getScore() + ' matches in ' + winningPlayer.getNumberOfTries() + ' turns';
            $('.player' + winningPlayer.getPlayerNumber()).html(scoreBoardEntry);
        }
    }

    /**
     * Hide the scoreboard.
     */
    hideScoreboard() {
        for (let player of this.players) {
            $('.player' + player.getPlayerNumber()).css('display', 'none');
        }
    }
}
