/**
 * Created by cmt on 8/22/15.
 */
Games = new Mongo.Collection("games");
MyStatus = new Mongo.Collection("myStatus");

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

userAllowedToJoinGame = function(user, game) {
    //User cannot join its own game
    if (user.username === game.player1Name){
        return false;
    }
    //User cannot join game if another game exists where he is part and
    //it's not complete
    if (Games.find({player1Name: user.username, status: 'live'})){
        return false;
    }
    return true;
}

Meteor.methods({
    addGame: function(btcAmount){
        Games.insert({
            player1Name: Meteor.user().username,
            player1BTCAddress: Meteor.user().profile.btcAddress,
            player1Status: 'readyToPlay',
            btcAmount: btcAmount,
            btcFee: 0,
            createdAt: new Date(),
            status: 'waiting 2nd player'
        })
    },

    joinGame: function(game){
        //console.log('In joinGame **********');
        //console.log('game:');
        //console.log(game);
        //console.log('user:');
        //console.log(Meteor.user());

        if (userAllowedToJoinGame(user=Meteor.user(), game=game)) {
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







