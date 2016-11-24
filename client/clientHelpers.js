/**
 * Created by cmt on 8/23/15.
 */

Template.applicationLayout.helpers({
    userStatus : function(){
        return getUserStatus();
    },

    currentBetAmount: function(){
        var game = getCurrentGame();
        if (game === null){
            return 0;
        }
        else{
            return game.btcAmount;
        }
    }
});

Template.listGames.helpers({
    games : function(){
        return Games.find({status: {$ne: 'completed'}}, {sort: {btcAmount: 1}});
        //return Games.find({status: {$ne: 'completed'}}, {sort: {btcAmount:1}});
    }
});

Template.rules.helpers({
    userBTCAddress: function () {
        return Meteor.user().profile.btcAddress;
    },
    isBTCAddressSetForUser: function () {
        return isBTCAddressSetForUser();
    }
});

Template.payment.helpers({
    BTCURI : function(){
        cl('In BTCURI() payment.helpers')
        var user = Meteor.user();
        var isPlayerOne = isPlayer1();
        cl('IsPlayer1() returns '+isPlayerOne);

        if (user === null)
            throw new Meteor.Error('UserIsNull');

        if (isUserPartOfACurrentGame(user)) {
            var game = getCurrentGame()
            if (game === null)
                throw new Meteor.Error('getCurrentGameIsNull');

            var gameAddress = '';
            if (isPlayerOne){
                gameAddress = game.player1GameBTCAddress;
            }
            else{
                gameAddress = game.player2GameBTCAddress;
            }
            uri = 'bitcoin:' + gameAddress + '?amount=' + game.btcAmount;
            console.log('Out BTCURI() returns: ' + uri);
            return uri;
        }
        else{
            throw new Meteor.Error('UserIsNotPartOfCurrentGame');
        }
    }
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
});

//Does not work for some odd reason: Meteor.subscribe("userBTCAddress");
//Does not work for some odd reason: Meteor.subscribe("games");