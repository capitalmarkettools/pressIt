/**
 * Created by cmt on 8/22/15.
 */
Games = new Mongo.Collection("games");
MyStatus = new Mongo.Collection("myStatus");

/* Datamodel of Games
Assumptions:    No 2 games exist that have the same btcAmount. btcAmount can be compared
                directly as it's at most 5 digits after decimal
    player1BTCAddress: string = null
    player2BTCAddress: string = null
    player1Score: double = null
    player2Score: double = null
    player1Status: string = null {'readyToPlay', 'Played', 'Won', 'Lost'}
    player2Status: string = null {'readyToPlay', 'Played', 'Won', 'Lost'}
    btcAmount: double = null
    btcFee: double = null
    createdAt: date&time
    status: string = null {'created', 'live', 'completed'}
 */

/* Datamodel of MyStatus
Assumptions:
    myEmail: string = null (unique id)
    myBTCAddress: string = null
    myStatus: string = null {'active', 'inactive', 'createdGame', 'playedGame', 'joinedGame'}
 */

Meteor.methods({
    addGame: function(btcAmount){
        Games.insert({
            btcAmount: btcAmount,
            createdAt: new Date(),
            winner: '',
            testField: 'testValue'
        })
    },

    setBTCAddress: function(btcAddress){
        user = Meteor.user();
        Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.btcAddress': btcAddress}});
    }
});







