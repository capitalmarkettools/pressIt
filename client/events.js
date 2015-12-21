/**
 * Created by cmt on 8/22/15.
 */

Template.home.events({
    'click #home': function () {
        Router.go('/home');
    },
    'click #rules': function () {
        Router.go('/rules');
    },
    'click #listGames': function () {
        Router.go('/listGames');
    },
    'click #newGame': function () {
        Router.go('/newGame');
    },
    'click #practiceGame': function () {
        Router.go('/game');
    }
});

Template.rules.events({
    'click #home': function () {
        Router.go('/home');
    },
    'click #rules': function () {
        Router.go('/rules');
    },
    'click #listGames': function () {
        Router.go('/listGames');
    },
    'click #newGame': function () {
        Router.go('/newGame');
    },
    'click #practiceGame': function () {
        Router.go('/game');
    },
    'submit .btcAddress': function(event){
        //Prevent default browser form submit
        event.preventDefault();

        Meteor.call('setBTCAddress', event.target.btcAddress.value);

        Router.go('/home');
    }
});

Template.newGame.events({
    'click #home': function () {
        Router.go('/home');
    },
    'click #rules': function () {
        Router.go('/rules');
    },
    'click #listGames': function () {
        Router.go('/listGames');
    },
    'click #newGame': function () {
        Router.go('/newGame');
    },
    'click #practiceGame': function () {
        Router.go('/game');
    },
    'submit .newGame': function (event){
        // Prevent default browser form submit
        event.preventDefault();

        Meteor.call('addGame', event.target.btcAmount.value);

        Router.go('/listGames');
    }
});

Template.listGames.events({
    'click #home': function () {
        Router.go('/home');
    },
    'click #rules': function () {
        Router.go('/rules');
    },
    'click #listGames': function () {
        Router.go('/listGames');
    },
    'click #newGame': function () {
        Router.go('/newGame');
    },
    'click #practiceGame': function () {
        Router.go('/game');
    },
    'click #joinGame': function(event) {
        // Prevent default browser form submit
        event.preventDefault();

        /* Algorithm is as follows:
         1. Get BTC Amount which defines the game (for active games; completed games should be ignored)
         2. Use URI to send BTC to game bitcoin address
         3. Find game in Mongo and update: In Progress
         window.location = "bitcoin:175tWpb8K1S7NmH4Zx6rewF9WQrcZv245W?amount=20.3&label=Luke-Jr"
         */
        //console.log('In click listGames.#joinGame**********')

        Meteor.call('joinGame', this);
        //console.log('Out click listGames.#joinGame**********')
    }
});


/*
Template.about.events({
    'click #home': function () {
        Router.go('/home');
    }
});
*/

Template.game.events({
    'click #home': function () {
        Router.go('/home');
    },
    'click #rules': function () {
        Router.go('/rules');
    },
    'click #listGames': function () {
        Router.go('/listGames');
    },
    'click #newGame': function () {
        Router.go('/newGame');
    },
    'click #practiceGame': function () {
        Router.go('/game');
    }
});

Template.navigation.events({
    'click #home': function () {
        Router.go('/home');
    },
    'click #rules': function () {
        Router.go('/rules');
    },
    'click #listGames': function () {
        Router.go('/listGames');
    },
    'click #newGame': function () {
        Router.go('/newGame');
    },
    'click #practiceGame': function () {
        Router.go('/game');
    }
});