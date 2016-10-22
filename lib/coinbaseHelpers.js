/**
 * Created by cmt on 9/12/16.
 */
if (Meteor.isServer) {
    const coinbase = Npm.require('coinbase');
    const coinbasePressItAccount = '0d9b9021-f33f-552b-8186-98e68cea28ac';

    var Future = Npm.require('fibers/future');

    //TODO Move sensitive information into one file and put it into .gitignore
    //TODO Fix the way function is coded
    Meteor.methods({

        getCoinbaseClient: function(){
          return new coinbase.Client({
              'apiKey': 'vVoAs3E8sbcOgUSy',
              'apiSecret': 'H2meAs5OLTzt5UDjqYpD2IWDJFup173U'
          });
        },
        //This function is synchronous using Futures
        createBTCAddress: function () {
            //Meteor.call('getCoinbaseClient', function (err, client) {
            if (1 == 1) {
                //if (err) throw err;
                client = new coinbase.Client({
                    'apiKey': 'vVoAs3E8sbcOgUSy',
                    'apiSecret': 'H2meAs5OLTzt5UDjqYpD2IWDJFup173U'
                });


                console.log('getCoinbaseClient returns: ' + client);

                /*
                 client.getAccounts({}, function(err, accounts) {
                 if (err) throw err;

                 accounts.forEach(function(acct) {
                 console.log('account from getAccounts()');
                 console.log(acct);
                 });
                 });
                 */

                var future = new Future();
                //account id is from PressIt account. Find Id via logic above to go through all accts
                client.getAccount(coinbasePressItAccount, function (err, account) {
                    if (err) {
                        console.log('Error in getAccount()');
                        console.error(err);
                        throw 'Error in getAccount() from Coinbase';
                    }
                    /*
                     console.log('account from getAccount() *************************');
                     console.log(account);
                     */
                    account.createAddress(null, function (err, result) {
                        if (err) throw err;
                        /*
                         console.log('result from createAddress() *************************');
                         console.log(result);
                         console.log('Parsing*****************');
                         */
                        var obj = JSON.parse(result);
                        btcAddress = obj['address'];
                        /*                 console.log('address from createAddress() *************************');
                         console.log(btcAddress);*/
                        //throw 'Done for now';
                        future.return(btcAddress);
                    });
                });

                return future.wait();
            }
        },

        //checks of bitcoin payment has been received. Then, allow player to play
        //has to be on the server as timer does not work on client
        BTCHasClearedForPlayer1: function () {
            cl('Inside BTCHasClearedForPlayer1() method');
            // TODO: Figure out why Meteor.user() fails in setInterval function
            // TODO: Also, figure out why getCurrentGameId does not work. For now do it outside
            // Decide if it is player 1 or 2 for later updating  of the game
            var isPlayerOne = isPlayer1();
            //Meteor.call('isPlayer1', function (err, ret) {
            //    if (err) throw err;
            //    cl('inside callback isPlayer1: ' + ret);
            //    isPlayer1 = ret;
            //});
            //cl('outside isPlayer1: ' + isPlayer1);

            //Get current Game
            var currentGame = getCurrentGame();
            if (currentGame == null) {
                cl('currentGame is null');
                cl('BTCHasClearedForPlayer1() returns with no value. No updates done');
                return;
            }
            //TODO: Current game might be null
            //cl('Current game: ' + currentGame);
            //cl('Current game id: ' + currentGame._id);

            //console.log('In BTCHasClearedForPlayer1()');
            //cl('Meteor.user check **************** ' + Meteor.user().username);
            //Meteor.call('isPlayer1', function (err, testusername) {
            //    cl('Meteor.user check **' + testusername);
            //});
            var counter = 0;
            intervalId = Meteor.setInterval(function () {
                counter++;
                // cl('Meteor.user check inside setInterval **************** ' + Meteor.user().username);
                // var client = Meteor.call('getCoinbaseClient');
                var client = new coinbase.Client({
                    'apiKey': 'vVoAs3E8sbcOgUSy',
                    'apiSecret': 'H2meAs5OLTzt5UDjqYpD2IWDJFup173U'
                });
                //console.log('coinbase.Client() returned success');
                console.log('coinbase.Client returned: ' + client);

                client.getAccount(coinbasePressItAccount, function (err, account) {
                    if (err) {
                        console.log('Error in client.getAccount');
                        console.log('err: ' + err);
                        throw err;
                    }
                    //console.log('client.getAccount() returned success');
                    console.log('coinbase.Client.getAccount returned: ' + account);

                    //TODO: Better to listen to the address as at most 2 transactions will be there
                    console.log('Calling account.getTransactions()');
                    account.getTransactions(null, function (err, transactions) {
                        if (err) {
                            console.log('Error in account.getTransactions');
                            console.log('err: ' + err);
                            throw err;
                        }
                        //console.log('account.getTransactions() returned success');
                        console.log('Transactions returned: ' + transactions);

                        transactions.forEach(function (transaction) {
                            //console.log(transaction);
                            jsonTransaction = JSON.parse(transaction);
                            console.log('status: ' + jsonTransaction['status']);
                            console.log('amount: ' + jsonTransaction['amount']['amount']);
                            console.log('from: ' + jsonTransaction['from']['id']);
                            console.log('to: ' + jsonTransaction['address']['id']);

                            //if transaction.from = game.player1BTCAddress andClone
                            //check if transaction has game address and correct amount from player btc
                            //if transaction correct then update game and exit out of this function
                        });
                    });
                });
                cl('counter: ' + counter);
                if (counter > 3) {
                    cl("Cleared intervalId but only because it timed out");
                    Meteor.clearInterval(intervalId);
                }
                //TODO: Add real coinbase code. Let it also timeout after 1h
                if (counter == 1) {
                    if (isPlayerOne) {
                        cl('Updating Player 1 to readyToPlay');
                        Games.update({_id: currentGame._id},
                            {$set: {player1Status: 'readyToPlay'}});
                    }
                    else {
                        cl('Updating Player 2 to readyToPlay');
                        Games.update({_id: currentGame._id},
                            {$set: {player2Status: 'readyToPlay'}});
                    }
                    Meteor.clearInterval(intervalId);
                }
            }, 2000);
        }
    })
}
