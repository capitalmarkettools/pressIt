/**
 * Created by cmt on 8/22/15.
 */

Template.home.events({
    'click #rules': function () {
        Router.go('/rules');
    },
    'click #listGames': function () {
        Router.go('/listGames');
    },
    'click #newGame': function () {
        Router.go('/newGame');
    }
});

Template.rules.events({
    'click #home': function () {
        Router.go('/home');
    }
});

Template.newGame.events({
    'click #home': function () {
        Router.go('/home');
    },
    'submit .newGame': function (event){
        // Prevent default browser form submit
        event.preventDefault();

        var btcAmount = event.target.btcAmount.value;

//        alert(btcAmount);
        Meteor.call('addGame', btcAmount);
        Router.go('/listGames');
    }
});

Template.listGames.events({
    'click #home': function () {
        Router.go('/home');
    },
    'click #joinGame': function(event){
        alert('Joining Game with bet '+event);
    }
});

Template.about.events({
    'click #home': function () {
        Router.go('/home');
    }
});
