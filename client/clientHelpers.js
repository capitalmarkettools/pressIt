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
        console.log('In BTCURI() payment.helpers')
        var isPlayerOne = isPlayer1();

        var user = Meteor.user();
        if (user === null)
            throw new Meteor.Error('assert', 'UserIsNull');

        var uri = null;
        if (isUserPartOfACurrentGame(user)) {
            var game = getCurrentGame()
            if (game === null)
                throw new Meteor.Error('assert', 'getCurrentGameIsNull');

            var gameAddress = '';
            if (isPlayerOne){
                gameAddress = game.player1GameBTCAddress;
            }
            else{
                gameAddress = game.player2GameBTCAddress;
            }
            uri = 'bitcoin:' + gameAddress + '?amount=' + game.btcAmount;
        }
        else{
            uri = '';
        }

        console.log('Out BTCURI(). Returns ' + uri);
        return uri;
    }
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
});

//Does not work for some odd reason: Meteor.subscribe("userBTCAddress");
//Does not work for some odd reason: Meteor.subscribe("games");