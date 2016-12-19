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
        console.log('In newGame.events.newGame()');
        // Prevent default browser form submit
        event.preventDefault();

        //browser template checks for bet values
        if(isBTCAddressSetForUser()) {
            if (!isUserPartOfACurrentGame()) {
                Meteor.call('addGame', event.target.btcAmount.value);
                console.log('Calling hasBTCCleared() method');
                //Meteor.call('hasBTCCleared');
                Router.go('/listGames');
            }
            else{
                alert('You cannot start a new game as you are part of one that\'s not yet completed.');
                console.log('User part of a current game that is not yet completed. Game not inserted');
            }
        }
        else{
            alert('Please set your BTC address in the Rules/Settings window');
            console.log('BTC address is not set. Provided alert. Game not inserted');
        }
        console.log('Out newGame.events.newGame()');
    }
});

Template.listGames.events({
    'click #joinGame': function(event) {
        console.log('In listGames.events.joinGame()');
        // Prevent default browser form submit
        event.preventDefault();

        if(isBTCAddressSetForUser()) {
            if (userAllowedToJoinGame(Meteor.user(), this)) {
                Meteor.call('joinGame', this);
                console.log('Calling hasBTCCleared() method');
                //Meteor.call('hasBTCCleared');
            }
            else{
                alert('You are not allowed to join this game.');
                console.log('User not allowed to join game. Provided alert. Game not joined');
            }
        }
        else{
            alert('Please set your BTC address in the Rules/Settings window');
            console.log('BTC address is not set. Provided alert. Game not joined');
        }
        console.log('Out listGames.events.joinGame()');
    }
});

Template.payment.events({
    'click #monitorPaymentStatus': function(event){
        // Prevent default browser form submit
        event.preventDefault();

        console.log('Calling hasBTCCleared() method');
        Meteor.call('hasBTCCleared');
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
        if (!isUserPartOfACurrentGame())
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