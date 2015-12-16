import log from 'server/log';
import GameStatus from 'common/constants/game-status';
import socketService from 'server/services/socket';
import gameService from 'server/services/game';
import authService from 'server/services/authentication';
import gameplayService from 'server/services/gameplay';

function start() {
    startRealtimeLobbyUpdate();
    startRunningGamesRealtimeUpdate();
}

function startRealtimeLobbyUpdate() {
    log.info('STARTING REALTIME UPDATES FOR LOBBY');
    gameService.onLobbyUpdate(games => {
        socketService.broadcastActionToRoom('lobby', {
            type: 'UPDATE_GAMES',
            games
        });
    });
}

function startGameRealtimeUpdate(gameId) {
    log.info('STARTING REALTIME UPDATES FOR GAME', gameId);
    return gameplayService.listenToGameplayUpdates(gameId, onGameUpdate);
}

function onGameUpdate(newGame, oldGame, end) {
    if (!newGame || (newGame.status === GameStatus.ENDED)) {
        return end();
    }

    log.info('GAME UPDATE', newGame.status);
    const shouldSendResolutionSteps = (newGame.status === GameStatus.SOLVED)
        && oldGame.status !== newGame.status,
        shouldSendUpdate = newGame.status !== GameStatus.SOLVED;
    // When game is solved, send a special game object
    // With details as to how to solve the game
    // So that we can play super duper animations
    if (shouldSendResolutionSteps) {
        const hybridGame = Object.assign({}, oldGame, {
            status: GameStatus.SOLVED,
            resolutionSteps: newGame.resolutionSteps
        });

        return broadcastGameUpdate(hybridGame, true);
    } else if (shouldSendUpdate) {
        broadcastGameUpdate(newGame);
    }

    gameplayService.resolveTurn(newGame.id);
}

function broadcastGameUpdate(game, withResolutionSteps) {
    const interestedSockets = socketService.getRoomSocketsIds(game.id);

    Promise.all(interestedSockets.map(authService.getPlayerFromSocket))
        .then(players => {
            players.forEach((player, idx) => {
                const socketId = interestedSockets[idx];
                socketService.emitAction(socketId, {
                    type: 'UPDATE_CURRENT_GAME',
                    game: gameplayService.transformGameplayForPlayer(player.id, game, withResolutionSteps)
                });
            });
        });
}

function startRunningGamesRealtimeUpdate() {
    return gameService.getCurrentGames()
        .then(games => {
            games.forEach(game => startGameRealtimeUpdate(game.id));
        });
}

export default {
    start,
    startGameRealtimeUpdate
};
