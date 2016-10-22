/**
 * Created by cmt on 8/23/15.
 */

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
    BTCAddressSetForUser: function () {
        return BTCAddressSetForUser();
    }
});

Template.submitPayment.helpers({
    BTCURI : function(){
        return 'NOT YET IMPLEMENTED';
        //TODO: Set URI dynamically
        if (isUserPartOfACurrentGame(Meteor.user())) {
            if (game = getCurrentGame()) {
                console.log('getCurrentGame() returns true');
                uri = 'bitcoin:' + game.gameBTCAddress + '?amount=' + game.btcAmount;
                console.log('Return uri: ' + uri);
                return uri;
            }
        }
        console.log('Return uri: null');
        return null;
    }
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
});

//Does not work for some odd reason: Meteor.subscribe("userBTCAddress");
//Does not work for some odd reason: Meteor.subscribe("games");