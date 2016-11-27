/**
 * Created by cmt on 9/12/16.
 */

if (Meteor.isServer) {
    const coinbase = Npm.require('coinbase');
    const coinbasePressItAccount = '0d9b9021-f33f-552b-8186-98e68cea28ac';
    const coinbaseApiKey = process.env.COINBASE_API_KEY;
    const coinbaseApiSecret = process.env.COINBASE_API_SECRET;

    var Future = Npm.require('fibers/future');

    //TODO Move sensitive information into one file and put it into .gitignore
    //TODO Fix the way function is coded
    Meteor.methods({

        //This function is synchronous using Futures
        createBTCAddress: function () {
                cl('In createBTCAddress() method.');

                cl('Call new coinbase.Client()');
                var client = new coinbase.Client({
                    'apiKey': coinbaseApiKey,
                    'apiSecret': coinbaseApiSecret
                });

                if (client === null) {
                    cl('Error in new coinbase.Client()')
                    throw new Meteor.Error('error-newCoinbaseClient')
                }

                var future = new Future();

                //account id is from PressIt account. Find Id via logic above to go through all accts
                cl('Call client.getAccount()');
                client.getAccount(coinbasePressItAccount, function (err, account) {
                    if (err) {
                        cl('Error in getAccount()\n'+err);
                        throw new Meteor.Error(err);
                    }

                    account.createAddress(null, function (err, result) {
                        if (err){
                            cl('Error in createAddress()');
                            throw new Meteor.Error(err);
                        }

                        var obj = JSON.parse(result);
                        var btcAddress = obj['address'];

                        future.return(btcAddress);
                    });
                });

                cl('In createBTCAddress() method.');
                return future.wait();
        },

        //checks if bitcoin payment has been received. Then, allow player to play (sets mongodb record)
        //has to be on the server as timer does not work on client
        //function will spawn a process that checks every minute transaction for 24 hours
        HasBTCCleared: function () {
            cl('Inside HasBTCCleared() method');
            //cl('this: ' + dump(this));
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
            if (currentGame === null) {
                cl('currentGame is null');
                cl('HasBTCCleared() method returns with no value. No updates done');
                return;
            }

            var counter = 0;
            cl('Meteor.setInterval function spawned.');
            var intervalId = Meteor.setInterval(function () {
                cl('Inside Interval function');
                //cl('Interval id: \n' + dump(intervalId));
                cl('Counter: ' + counter);
                counter++;
                // cl('Meteor.user check inside setInterval **************** ' + Meteor.user().username);
                // var client = Meteor.call('getCoinbaseClient');

                var client = new coinbase.Client({
                    'apiKey': coinbaseApiKey,
                    'apiSecret': coinbaseApiSecret
                });
                if (client === null) {
                    cl('Error in new coinbase.Client()');
                    throw new Meteor.Error('error-newCoinbaseClient');
                }
                //console.log('coinbase.Client() returned success');
                //console.log('coinbase.Client returned: ' + client);

                client.getAccount(coinbasePressItAccount, Meteor.bindEnvironment( function (err, account) {
                    if (err) {
                        cl('Error in client.getAccount. Err:\n' + err);
                        cl('HasBTCCleared() method returns with no value. No updates done');
                        throw new Meteor.Error('error-getAccount');
                    }
                    //console.log('client.getAccount() returned success');
                    //console.log('coinbase.Client.getAccount returned: ' + account);

                    //console.log('Calling account.getTransactions()');
                    account.getTransactions(null, Meteor.bindEnvironment(function (err, transactions) {
                        if (err) {
                            cl('Error in account.getTransactions. Err: \n' + err);
                            cl('HasBTCCleared() method returns with no value. No updates done');
                            throw new Meteor.Error('error-getTransactions')
                        }
                        //console.log('account.getTransactions() returned success');
                        //console.log('Transactions: ' + transactions);

                        transactions.forEach(Meteor.bindEnvironment(function (transaction) {
                            //console.log(transaction);
                            var jsonTransaction = JSON.parse(transaction);
                            var coinbaseToAddress = null;
                            account.getAddress(jsonTransaction['address']['id'],
                                Meteor.bindEnvironment(function(err, coinbaseToAddress) {
                                //cl('Transaction: \n' + dump(transaction));
                                //cl('Game: \n' + dump(currentGame));
                                cl('Transaction vs Game comparison:');
                                cl('transaction id: ' + jsonTransaction['id']);
                                //cl('type: ' + jsonTransaction['type']);
                                cl('status: ' + jsonTransaction['status']);
                                cl('Transaction amount: ' + jsonTransaction['amount']['amount']);
                                cl('Game amount: ' + currentGame.btcAmount);
                                //cl('Transaction to id: ' + jsonTransaction['address']['id']);
                                cl('Transaction to: ' + coinbaseToAddress['address']);
                                cl('Player 1 Game Deposit address: ' + currentGame.player1GameBTCAddress);
                                cl('Player 2 Game Deposit address: ' + currentGame.player2GameBTCAddress);

                                if(jsonTransaction['status'] === 'completed')
                                    cl('Condition1 OK');
                                if(equalBTC(jsonTransaction['amount']['amount'], currentGame.btcAmount))
                                    cl('Condition2 OK');
                                if(isPlayerOne && coinbaseToAddress['address'] === currentGame.player1GameBTCAddress)
                                    cl('Condition3a OK');
                                if((!isPlayerOne) && coinbaseToAddress['address'] === currentGame.player2GameBTCAddress)
                                    cl('Condition3b OK');

                                if ((jsonTransaction['status'] === 'completed') &&
                                    (equalBTC(jsonTransaction['amount']['amount'], currentGame.btcAmount))) {
                                    if (isPlayerOne && coinbaseToAddress['address'] === currentGame.player1GameBTCAddress) {
                                        Games.update({_id: currentGame._id}, {
                                            $set: {
                                                player1Status: 'readyToPlay',
                                                player1BTCTransaction: jsonTransaction['id']
                                            }
                                        });
                                        cl('Updating Player 1 to readyToPlay as transaction has cleared');
                                        Meteor.clearInterval(intervalId);
                                        cl('Cleared Interval id ' + intervalId);
                                    }
                                    else if ((!isPlayerOne) && coinbaseToAddress['address'] === currentGame.player2GameBTCAddress) {
                                        Games.update({_id: currentGame._id}, {
                                            $set: {
                                                player2Status: 'readyToPlay',
                                                player2BTCTransaction: jsonTransaction['id']
                                            }
                                        });
                                        cl('Updating Player 2 to readyToPlay as transaction has cleared');
                                        Meteor.clearInterval(intervalId);
                                        cl('Cleared Interval id ' + intervalId);
                                    }
                                }
                            }));
                        }));
                    }));
                }));
                if (counter === 60) {
                    cl("Cleared intervalId but only because it timed out after 1 hour");
                    Meteor.clearInterval(intervalId);
                }
              }, 60000); // every minute
            cl('HasBTCCleared() method returns with no value.');
        }
    })
}

