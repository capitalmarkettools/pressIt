/**
 * Created by cmt on 8/22/15.
 */
Games = new Mongo.Collection("games");
//MyStatus = new Mongo.Collection("myStatus");

/* Datamodel of Games
Assumptions:    No 2 games exist that have the same btcAmount. btcAmount can be compared
                directly as it's at most 5 digits after decimal
    player1Name: string
    player2Name: string
    player1BTCAddress: string
    player2BTCAddress: string
    player1Score: double
    player2Score: double
    player1Status: string = {'readyToPlay', 'Played', 'Won', 'Lost'}
    player2Status: string = {'readyToPlay', 'Played', 'Won', 'Lost'}
    btcAmount: double
    btcFee: double
    createdAt: date&time
    status: string = {'waiting 2nd player', 'live', 'completed'}
    winner: string = {'player1', 'player2'}
 */

/* Datamodel of MyStatus
Assumptions:
    myEmail: string = null (unique id)
    myBTCAddress: string = null
    myStatus: string = null {'active', 'inactive', 'createdGame', 'playedGame', 'joinedGame'}
 */

Meteor.methods({
    addGame: function(btcAmount){
        if (!isUserPartOfACurrentGame(Meteor.user())){
            Games.insert({
                player1Name: Meteor.user().username,
                player1BTCAddress: Meteor.user().profile.btcAddress,
                player1Status: 'readyToPlay',
                btcAmount: btcAmount,
                btcFee: 0,
                createdAt: new Date(),
                status: 'waiting 2nd player'
            })
        }
    },

    joinGame: function(game){
        //console.log('In joinGame **********');
        //console.log('game:');
        //console.log(game);
        //console.log('user:');
        //console.log(Meteor.user());

        if (userAllowedToJoinGame(Meteor.user(), game)) {
            Games.update({_id:game._id}, {$set:{
                    player2Name: Meteor.user().username,
                    player2BTCAddress: Meteor.user().profile.btcAddress,
                    player2Status: 'readyToPlay',
                    status:'live'
            }});
            //console.log('Out joinGame **********');
        }
    },

    setBTCAddress: function(btcAddress){
        Meteor.users.update({_id: Meteor.userId()}, {$set: {
            'profile.btcAddress': btcAddress
        }})
    }
});


isUserPartOfACurrentGame = function(user){
    //User cannot join game if another game exists where he is part and
    //it's not complete
    if (Games.findOne({player1Name: user.username, status: {$ne: 'completed'}})) {
        //console.log('Returns false 2');
        return true;
    }
    if (Games.findOne({player2Name: user.username, status: {$ne: 'completed'}})) {
        //console.log('Returns false 3');
        return true;
    }
    return false;
};

userAllowedToJoinGame = function(user, game) {
    //User cannot join its own game
    //console.log('In userAllowedToJoinGame');
    //console.log(user);
    //console.log(game);
    if (user.username === game.player1Name) {
        //console.log('Returns false 1');
        return false;
    }

    if (isUserPartOfACurrentGame(user)){
        return false;
    }

    //console.log('Returns true');
    //console.log('Out userAllowedToJoinGame');
    return true;
};

//Defines if user is player 1 or player 2 in game
//Assumes there is at most one game per player that's not completed
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

submitScore = function(score){
    console.log('in submitScpre');
    console.log(Meteor.user());

    if(isPlayer1()){
        console.log('isPlayer1 returns true')
        game = Games.findOne({player1Name: Meteor.user().username, status: {$ne: 'completed'}});
        //console.log('Games.find returns:');
        //console.log(game);
        Games.update({_id: game._id}, {$set: {
            'player1Score': score,
            'player1Status': 'played',
        }});
    }
    else{
        console.log('isPlayer1 returns false')
        game = Games.findOne({player2Name: Meteor.user().username, status: {$ne: 'completed'}});
        //console.log('Games.find returns:');
        //console.log(game);
        Games.update({_id: game._id}, {$set: {
            'player2Score': score,
            'player2Status': 'played',
        }});
    }
    console.log('out submitScpre');
};

determineWinner = function(){
    console.log('In determineWinner()');

    //does not matter how to look for game as I need both anyway
    if (game = Games.findOne({player1Name: Meteor.user().username, status: {$ne: 'completed'}})) {
        //TODO Add logic
        if (game.player1Status == 'played' && game.player2Status == 'played' && game.status == 'live') {
            console.log('Updating game');
            Games.update({_id: game._id}, {$set: {
                status: 'completed',
                winner: 'player1'
            }})
        }
    }
    else if (game = Games.findOne({player2Name: Meteor.user().username, status: {$ne: 'completed'}})) {
        //TODO Add logic
        if (game.player1Status == 'played' && game.player2Status == 'played' && game.status == 'live') {
            console.log('Updating game');
            Games.update({_id: game._id}, {$set: {
                status: 'completed',
                winner: 'player1'
            }})
        }
    }

    console.log('Out determineWinner()');
};

//Defines if user is player 1 or player 2 in game
//Assumes there is at most one game per player that's not completed
isPlayerReadyToPlay = function(){
    user = Meteor.user();
    if (Games.findOne({player1Name: user.username, player1Status: 'readyToPlay'})){
        return true;
    }
    else if (Games.findOne({player2Name: user.username, player2Status: 'readyToPlay'})){
        return true;
    }
    else{
        return false;
    }
};


