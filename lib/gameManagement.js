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
 player1BTCAddress: string
 player2BTCAddress: string
 gameBTCAddress: string // Each game has its own BTC address for escrow purposes. Generate when game created
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
    addGame: function(btcAmount){
        //TODO: This condition is also checked in the event handler. Cleanup at some point
        if (!isUserPartOfACurrentGame(Meteor.user())){
            //create new address for game via coinbase API
            //console.log('New game created');
            Meteor.call("createBTCAddress", function (err, btcAddress) {
                if (err) throw err;

                Games.insert({
                    player1Name: Meteor.user().username,
                    player1BTCAddress: Meteor.user().profile.btcAddress,
                    gameBTCAddress: btcAddress,
                    player1Status: 'waitingDeposit',
                    btcAmount: btcAmount,
                    btcFee: 0,
                    createdAt: new Date(),
                    status: 'waiting 2nd player'
                });

                Meteor.call('monitorPaymentStatus');
            });
        }
        else
            alert('You cannot start a new game as you are part of one that\'s not yet completed.');
    },

    joinGame: function(game){
        /*
         console.log('In joinGame **********');
         console.log('game:');
         console.log(game);
         console.log('user:');
         console.log(Meteor.user());
         */

        if (userAllowedToJoinGame(Meteor.user(), game)) {
            Games.update({_id:game._id}, {$set:{
                    player2Name: Meteor.user().username,
                    player2BTCAddress: Meteor.user().profile.btcAddress,
                    player2Status: 'waitingDeposit',
                    status:'live'
            }});

            Meteor.call('monitorPaymentStatus');
            //console.log('Out joinGame **********');
        }
    },

    setBTCAddress: function(btcAddress){
        Meteor.users.update({_id: Meteor.userId()}, {$set: {
            'profile.btcAddress': btcAddress
        }})
    },

    /* Monitors the payment status using Coinbase API. When Payment has cleared then the
    function will set the Game player status to 'readyToPlay'.
    Input: None */
    //NOT USED
    monitorPaymentStatus: function() {
        var a = 1;
        //if (isUserPartOfACurrentGame(Meteor.user())) {
        //    game = getCurrentGame();
        //    counter = 0;
        //    intervalId = Meteor.setInterval(function () {
        //        counter += 1;
        //        cl('Monitoring payment status ...');
        //        client.getAccount('2bbf394c-193b-5b2a-9155-3b4732659ede', function (err, account) {
        //            account.getTransactions(function (err, txs) {
        //                console.log(txs);
        //            });
        //        });
        //        if (counter > 10) {
        //            Meteor.clearInterval(intervalId);
        //            if (isPlayer1())
        //                Games.update({_id: game._id}, {$set: {player1Status: 'readyToPlay'}});
        //            else
        //                Games.update({_id: game._id}, {$set: {player2Status: 'readyToPlay'}});
        //        }
        //    }, 10000);
        //}
    }
});

getCurrentGame = function(){
    user = Meteor.user();
    game = null;
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
    if (Games.findOne({player1Name: user.username, status: {$ne: 'completed'}})) {
        console.log('isUserPartOfACurrentGame returns true for player1');
        return true;
    }
    if (Games.findOne({player2Name: user.username, status: {$ne: 'completed'}})) {
        console.log('isUserPartOfACurrentGame returns true for player2');
        return true;
    }
    return false;
};

//Check if user can join game as the second player
//At this point the game already exists
userAllowedToJoinGame = function(user, game) {
    //console.log('In userAllowedToJoinGame');
    //console.log(user);
    //console.log(game);

    //User cannot join its own game
    if (user.username == game.player1Name)
        return false;

    //User cannot join if he is part of another not completed game
    if (isUserPartOfACurrentGame(user))
        return false;

    //User cannot join if game status is not waiting for 2nd player
    if (game.status != "waiting 2nd player")
        return false;

    //console.log('Returns true');
    //console.log('Out userAllowedToJoinGame');
    return true;
};

//Defines if user is player 1 or player 2 in game
isPlayer1 = function(){
    user = Meteor.user();
    if (Games.findOne({player1Name: user.username, status: {$ne: 'completed'}})){
        return true;
    }
    else if (Games.findOne({player2Name: user.username, status: {$ne: 'completed'}})){
        return false;
    }
    else{
        console.log("Error in isPlayer1");
        return false;
    }
};

//Called from StartButton() to make sure we keep track that game started
submitInitialScore = function () {
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
};

submitScore = function(score){
    console.log('in submitScore');
    console.log(Meteor.user());
    console.log(score);

    if(isPlayer1()){
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
            alert('You already submitted score before.');
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
            alert('You already submitted score before.');
    }
    console.log('out submitScore');
};

//Determines winner and updates the game
determineWinner = function(){
    var winner = function(score1, score2){
        if (score1 > score2)
            return 'player1';
        else if (score1 < score2)
            return 'player2';
        else
            return 'tie';

    };

    //update game if both players have played or started playing
    var updateGame = function (game) {
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
    console.log('In determineWinner()');

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
    user = Meteor.user();
    if (Games.findOne({
            player1Name: user.username,
            $or: [
                {player1Status: 'readyToPlay'}, {player1Status: 'startedGame'}
            ]
        })) {
        return true;
    }
    else if (Games.findOne({
            player2Name: user.username,
            $or: [
                {player2Status: 'readyToPlay'}, {player2Status: 'startedGame'}
            ]
        })) {
        return true;
    }
    else{
        return false;
    }
};

//Determines if user has started the game already but is again in StartButton callback
//This indicates that user did something he was not supposed to do (refresh/back/shut down..)
//Should only be used in startButton callback. TODO: Move to callback of button
playerHasAlreadyStartedGamePreviously = function () {
    user = Meteor.user();
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
