/**
 * Created by cmt on 8/23/15.
 */

Template.listGames.helpers({
    games : function(){
        return Games.find({}, {sort: {btcAmount:1}});
    }
});

Template.rules.helpers({
    userBTCAddress: function () {
        return Meteor.user().profile.btcAddress;
    }
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
});

//Does not work for some odd reason: Meteor.subscribe("userBTCAddress");
//Does not work for some odd reason: Meteor.subscribe("games");