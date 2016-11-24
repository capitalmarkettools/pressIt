/**
 * Created by cmt on 8/22/15.
 */
Games = new Mongo.Collection("games");

//TODO: Add Schema
/* Datamodel of Games
 Assumptions/Rules:
 1) No 2 games exist that have the same btcAmount. btcAmount can be compared
 directly as it's at most 5 digits after decimal
 2) Assumes there is at most one game per player that's not completed

 player1Name: string
 player2Name: string
 player1BTCAddress: string // Player address that will receive the win amount
 player2BTCAddress: string // Player address that will receive the win amount
 player1GameBTCAddress: string // Each game has its own BTC address per player for escrow purposes.
 player2GameBTCAddress: string // Each game has its own BTC address per player for escrow purposes.
 player1Score: double
 player2Score: double
 player1Status: string = {'waitingDeposit', 'waitingBTCCleared', 'readyToPlay', 'startedGame', 'Played'}
 player2Status: string = {'waitingDeposit', 'waitingBTCCleared', 'readyToPlay', 'startedGame', 'Played'}
 btcAmount: double
 btcFee: double
 createdAt: date&time
 status: string = {'waiting 2nd player', 'live', 'completed'}
 winner: string = {'player1', 'player2', 'tie'}
 */

Meteor.methods({
    // creates new game. Called from UI
    addGame: function (btcAmount) {
        cl('In addGame(' + btcAmount + ')');

        //createBTCAddress is synchronous using Futures
        Meteor.call("createBTCAddress", function (err, btcAddress) {
            if (err) {
                throw Meteor.Error('coinbaseError', 'Error in createBTCAddress(). Game not inserted');
            }
            else {
                Games.insert({
                    player1Name: Meteor.user().username,
                    player1BTCAddress: Meteor.user().profile.btcAddress,
                    player1GameBTCAddress: btcAddress,
                    player1Status: 'waitingDeposit',
                    btcAmount: btcAmount,
                    btcFee: 0,
                    createdAt: new Date(),
                    status: 'waiting 2nd player'
                });
            }
        });
    },

    joinGame: function(game){
        cl('In joinGame() method');

        //createBTCAddress is synchronous using Futures
        Meteor.call("createBTCAddress", function (err, btcAddress) {
            if (err) {
                throw Meteor.Error('coinbaseError', 'Error in createBTCAddress(). Game not inserted');
            }
            else {
                Games.update({_id: game._id}, {
                    $set: {
                        player2Name: Meteor.user().username,
                        player2BTCAddress: Meteor.user().profile.btcAddress,
                        player2GameBTCAddress: btcAddress,
                        player2Status: 'waitingDeposit',
                        status: 'live'
                    }
                });
            }
            console.log('Out joinGame()');
        });
    },

    setBTCAddressOfUser: function(btcAddress){
        Meteor.users.update({_id: Meteor.userId()},
            {$set: {'profile.btcAddress': btcAddress}});
    },

    //Finds the current game of the player and updates the btc address of the player on game
    setBTCAddressOfPlayerInGame: function(btcAddress) {
        cl('In setBTCAddressOfPlayerInGame() function');
        if (isPlayer1()) {
            if (game = Games.findOne({
                    player1Name: Meteor.user().username,
                    status: {$ne: 'completed'}
                })) {
                Games.update({_id: game._id}, {
                    $set: { 'player1BTCAddress': btcAddress }
                });
            }
        }
        else {
            if (game = Games.findOne({
                    player2Name: Meteor.user().username,
                    status: {$ne: 'completed'}
                })) {
                Games.update({_id: game._id}, {
                    $set: { 'player2BTCAddress': btcAddress }
                });
            }
        }
        cl('Out setBTCAddressOfPlayer() function');
    }
});

isPlayer1 = function () {
    cl('Inside isPlayer1() function');
    var user = Meteor.user();
    //cl('Meteor.user() returned ' + dump(user));
    if (Games.findOne({player1Name: user.username, status: {$ne: 'completed'}})) {
        cl('isPlayer1() function returns: true');
        return true;
    }
    else if (Games.findOne({player2Name: user.username, status: {$ne: 'completed'}})) {
        cl('isPlayer1() function returns: false');
        return false;
    }
    else {
        cl('No game found. IsPlayer1() function returns: false');
        return false;
    }
};

getUserStatus = function(){
    var currentGame = getCurrentGame();
    if (currentGame === null){
        return 'Not part of a game.';
    }
    else{
        if(isPlayer1())
            return currentGame.player1Status;
        else
            return currentGame.player2Status;
    }
};

getCurrentGame = function(){
    var user = Meteor.user();
    var game = null;
    if (game = Games.findOne({player1Name: user.username, status: {$ne: 'completed'}})) {
        return game;
    }
    if (game = Games.findOne({player2Name: user.username, status: {$ne: 'completed'}})) {
        return game;
    }
    return null;
};

isUserPartOfACurrentGame = function(user){
    //User cannot join game if another game exists where he is part and
    //it's not complete
    cl('Inside isUserPartOfACurrentGame(' + user + ') function');
    if (Games.findOne({player1Name: user.username, status: {$ne: 'completed'}})) {
        console.log('isUserPartOfACurrentGame() returns true for Player1');
        return true;
    }
    if (Games.findOne({player2Name: user.username, status: {$ne: 'completed'}})) {
        console.log('isUserPartOfACurrentGame() returns true for Player2');
        return true;
    }
    console.log('isUserPartOfACurrentGame() returns false');
    return false;
};

//Check if user can join game as the second player
//At this point the game already exists
userAllowedToJoinGame = function(user, game) {
    //User cannot join its own game
    if (user.username === game.player1Name)
        return false;

    //User cannot join if he is part of another not completed game
    if (isUserPartOfACurrentGame(user))
        return false;

    //User cannot join if game status is not waiting for 2nd player
    if (game.status != "waiting 2nd player")
        return false;

    return true;
};

//Called from StartButton() to make sure we keep track that game started
submitInitialScore = function () {
    cl('In submitInitialScore() function');
    if (isPlayer1()) {
        if (game = Games.findOne({
                player1Name: Meteor.user().username,
                //it can happen that front-end allows to submit multiple times
                player1Status: 'readyToPlay',
                status: {$ne: 'completed'}
            })) {
            Games.update({_id: game._id}, {
                $set: {
                    'player1Score': 0.0,
                    'player1Status': 'startedGame'
                }
            });
        }
    }
    else {
        if (game = Games.findOne({
                player2Name: Meteor.user().username,
                //it can happen that front-end allows to submit multiple times
                player2Status: 'readyToPlay',
                status: {$ne: 'completed'}
            })) {
            Games.update({_id: game._id}, {
                $set: {
                    'player2Score': 0.0,
                    'player2Status': 'startedGame'
                }
            });
        }
    }
    cl('Out submitInitialScore() function')
};

submitScore = function(score){
    console.log('Inside submitScore(' + score + ') function');

    console.log('********Start *** Check if isPlayer1() function works');
    cl('cl() test');
    console.log('isPlayer function returns ' + isPlayer1());
    console.log('********End *** Check if isPlayer1() function works');

    var isPlayerOne = isPlayer1();
    //Meteor.call('isPlayer1', function(err,ret) {
    //    if (err) throw err;
    //    cl('inside callback isPlayer1: ' + ret);
    //    isPlayer1 = ret;
    //});
    //cl('outside isPlayer1: ' + isPlayer1);
    if (isPlayerOne) {
        console.log('isPlayer1 returns true');
        if (game = Games.findOne({
                player1Name: Meteor.user().username,
                //it can happen that front-end allows to submit multiple times
                $or: [
                    {player1Status: 'readyToPlay'}, {player1Status: 'startedGame'}
                ],
                status: {$ne: 'completed'}
            })) {
            console.log('Games.find returns:');
            console.log(game);
            Games.update({_id: game._id}, {
                $set: {
                    'player1Score': score,
                    'player1Status': 'played'
                }
            });
        }
        else
            alert('Hi player 1, you already submitted score before.');
    }
    else{
        console.log('isPlayer1 returns false');
        if (game = Games.findOne({
                player2Name: Meteor.user().username,
                //it can happen that front-end allows to submit multiple times
                $or: [
                    {player2Status: 'readyToPlay'}, {player2Status: 'startedGame'}
                ],
                status: {$ne: 'completed'}
            })) {
            console.log('Games.find returns:');
            console.log(game);
            Games.update({_id: game._id}, {
                $set: {
                    'player2Score': score,
                    'player2Status': 'played'
                }
            });
        }
        else
            alert('Hi player 2, you already submitted score before.');
    }
    console.log('submitScore() function returns no value');
};

//Determines winner and updates the game
determineWinner = function(){
    cl('In determineWinner()');

    //Local function that returns 'player1' or 'player2 or 'tie'
    //Used to save winner result on game record
    var winner = function(score1, score2){
        cl('In winner('+score1+','+score2+')');
        if (score1 > score2)
            return 'player1';
        else if (score1 < score2)
            return 'player2';
        else
            return 'tie';

    };

    //update game if both players have played or started playing
    var updateGame = function (game) {
        cl('In updateGame('+game+')');
        if ((game.player1Status == 'played' || game.player1Status == 'startedGame') &&
            (game.player2Status == 'played' || game.player2Status == 'startedGame') &&
            game.status == 'live') {
            console.log('Updating game');
            Games.update({_id: game._id}, {
                $set: {
                    status: 'completed',
                    winner: winner(game.player1Score, game.player2Score)
                }
            });
        }
        else
            console.log('Not updating game');
    };

    //does not matter how to look for game as I need both anyway
    if (game = Games.findOne({player1Name: Meteor.user().username, status: {$ne: 'completed'}})) {
        updateGame(game);
    }
    else if (game = Games.findOne({player2Name: Meteor.user().username, status: {$ne: 'completed'}})) {
        updateGame(game);
    }

    console.log('Out determineWinner()');
};

//Determines if user is allowed to play game. We need to check as it needs to be clear
//to which game score is assigned to. Later on we need to check also that Bitcoin has
//cleared.
isPlayerReadyToPlay = function(){
    var user = Meteor.user();
    var isPlayerReadyToPlay = false;
    if (Games.findOne({
            player1Name: user.username,
            $or: [
                {player1Status: 'readyToPlay'}, {player1Status: 'startedGame'}
            ]
        })) {
        isPlayerReadyToPlay = true;
    }
    else if (Games.findOne({
            player2Name: user.username,
            $or: [
                {player2Status: 'readyToPlay'}, {player2Status: 'startedGame'}
            ]
        })) {
        isPlayerReadyToPlay = true;
    }
    else{
        isPlayerReadyToPlay = false;
    }
    cl('isPlayerReadyToPlay() returns ' + isPlayerReadyToPlay);
    return isPlayerReadyToPlay;
};

isBTCAddressSetForUser = function () {
    //TODO: Write or get validation function
    if (Meteor.user().profile.btcAddress === '')
        return false;
    else
        return true;
};

//Determines if user has started the game already but is again in StartButton callback
//This indicates that user did something he was not supposed to do (refresh/back/shut down..)
//Should only be used in startButton callback. TODO: Move to callback of button
playerHasAlreadyStartedGamePreviously = function () {
    var user = Meteor.user();
    if (isPlayer1()) {
        if (Games.findOne({
                player1Name: user.username,
                player1Status: 'startedGame',
                status: {$ne: 'completed'}
            })) {
            return true;
        }
    }
    else if (Games.findOne({
            player2Name: user.username,
            player2Status: 'startedGame',
            status: {$ne: 'completed'}
        })) {
        return true;
    }
    else {
        return false;
    }
};
