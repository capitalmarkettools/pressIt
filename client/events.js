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
    'click #playGame': function () {
        if (isPlayerReadyToPlay())
            Router.go('/playGame');
    },
    'click #practiceGame': function () {
        Router.go('/practiceGame');
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
    'click #playGame': function () {
        if (isPlayerReadyToPlay())
            Router.go('/playGame');
    },
    'submit .btcAddress': function(event){
        //Prevent default browser form submit
        event.preventDefault();

        Meteor.call('setBTCAddress', event.target.btcAddress.value);

        Router.go('/home');
    },
    'click #practiceGame': function () {
        Router.go('/practiceGame');
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
    'click #playGame': function () {
        if (isPlayerReadyToPlay())
            Router.go('/playGame');
    },
    'submit .newGame': function (event){
        // Prevent default browser form submit
        event.preventDefault();

        Meteor.call('addGame', event.target.btcAmount.value);

        Router.go('/listGames');
    },
    'click #practiceGame': function () {
        Router.go('/practiceGame');
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
    'click #playGame': function () {
        if (isPlayerReadyToPlay())
            Router.go('/playGame');
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
    },
    'click #practiceGame': function () {
        Router.go('/practiceGame');
    }
});


/*
Template.about.events({
    'click #home': function () {
        Router.go('/home');
    }
});
*/

Template.playGame.events({
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
    'click #playGame': function () {
        if (isPlayerReadyToPlay())
            Router.go('/playGame');
    },
    'click #practiceGame': function () {
        Router.go('/practiceGame');
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
    'click #playGame': function () {
        if (isPlayerReadyToPlay())
            Router.go('/playGame');
    },
    'click #practiceGame': function () {
        Router.go('/practiceGame');
    }
});