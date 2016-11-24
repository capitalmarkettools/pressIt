/**
 * Created by cmt on 8/22/15.
 */

Template.rules.events({
    'submit .btcAddress': function(event){
        //Prevent default browser form submit
        event.preventDefault();

        Meteor.call('setBTCAddressOfUser', event.target.btcAddress.value);
        Meteor.call('setBTCAddressOfPlayerInGame', event.target.btcAddress.value);

        Router.go('/rules');
    }
});

Template.newGame.events({
    'submit .newGame': function (event){
        cl('In newGame.events.newGame()');
        // Prevent default browser form submit
        event.preventDefault();

        //browser template checks for bet values
        if(isBTCAddressSetForUser()) {
            if (!isUserPartOfACurrentGame(Meteor.user())) {
                Meteor.call('addGame', event.target.btcAmount.value);
                cl('Calling HasBTCCleared() method');
                Meteor.call('HasBTCCleared');
                Router.go('/listGames');
            }
            else{
                alert('You cannot start a new game as you are part of one that\'s not yet completed.');
                cl('User part of a current game that is not yet completed. Game not inserted');
            }
        }
        else{
            alert('Please set your BTC address in the Rules/Settings window');
            cl('BTC address is not set. Provided alert. Game not inserted');
        }
        cl('Out newGame.events.newGame()');
    }
});

Template.listGames.events({
    'click #joinGame': function(event) {
        cl('In listGames.events.joinGame()');
        // Prevent default browser form submit
        event.preventDefault();

        if(isBTCAddressSetForUser()) {
            if (userAllowedToJoinGame(Meteor.user(), this)) {
                Meteor.call('joinGame', this);
                cl('Calling HasBTCCleared() method');
                Meteor.call('HasBTCCleared');
            }
            else{
                alert('You are not allowed to join this game.');
                cl('User not allowed to join game. Provided alert. Game not joined');
            }
        }
        else{
            alert('Please set your BTC address in the Rules/Settings window');
            cl('BTC address is not set. Provided alert. Game not joined');
        }
        cl('Out listGames.events.joinGame()');
    }
});

Template.payment.events({
    'click #monitorPaymentStatus': function(event){
        // Prevent default browser form submit
        event.preventDefault();

        cl('Calling HasBTCCleared() method');
        Meteor.call('HasBTCCleared');
    }
});

Template.navigation.events({
    'click #home': function () {
        Router.go('/home');
    },
    'click #listGames': function () {
        Router.go('/listGames');
    },
    'click #newGame': function () {
        if (!isUserPartOfACurrentGame(Meteor.user()))
            Router.go('/newGame');
        else
            alert('You cannot start a new game as you are part of one ' +
                'that\'s not yet completed.');
    },
    'click #playGame': function () {
        if (isPlayerReadyToPlay())
            Router.go('/playGame');
        else
            alert('You cannot play a real game yet. You are either still ' +
                'part of one that\'s not yet completed, not part of any or BTC' +
                ' has not settled yet. You can practice though.');
    },
    'click #practiceGame': function () {
        Router.go('/practiceGame');
    },
    'click #payment': function () {
        Router.go('/payment');
    },
    'click #rules': function () {
        Router.go('/rules');
    }
});