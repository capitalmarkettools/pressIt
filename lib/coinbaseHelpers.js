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
                var client = new coinbase.Client({
                    'apiKey': coinbaseApiKey,
                    'apiSecret': coinbaseApiSecret
                });

                if (client === null) {
                    console.log('Error in new coinbase.Client()')
                    throw new Meteor.Error('error-newCoinbaseClient')
                }

                var future = new Future();

                //account id is from PressIt account. Find Id via logic above to go through all accts
                client.getAccount(coinbasePressItAccount, function (err, account) {
                    if (err) {
                        console.log('Error in getAccount()\n'+err);
                        throw new Meteor.Error(err);
                    }

                    account.createAddress(null, function (err, result) {
                        if (err){
                            console.log('Error in createAddress()');
                            throw new Meteor.Error(err);
                        }

                        var obj = JSON.parse(result);
                        var btcAddress = obj['address'];

                        future.return(btcAddress);
                    });
                });

                return future.wait();
        },

        //checks if bitcoin payment has been received. Then, allow player to play (sets mongodb record)
        //has to be on the server as timer does not work on client
        //function will spawn a process that checks every minute transaction for 24 hours
        hasBTCCleared: function () {
            console.log('In hasBTCCleared() method');

            var isPlayerOne = isPlayer1();
            var currentGame = getCurrentGame();

            if (currentGame === null) {
                console.log('Out hasBTCCleared() method. Current game is null. No updates done');
                return;
            }

            var counter = 1;
            console.log('Meteor.setInterval function spawned to check if BTC has cleared.');
            var intervalId = Meteor.setInterval(function () {
                if (isPlayerOne)
                    console.log('SetInterval function to check if BTC has cleared for player 1 ' + counter + ' times');
                else
                    console.log('SetInterval function to check if BTC has cleared for player 2 ' + counter + ' times');

                counter++;

                var client = new coinbase.Client({
                    'apiKey': coinbaseApiKey,
                    'apiSecret': coinbaseApiSecret
                });
                if (client === null) {
                    console.log('Error in new coinbase.Client()');
                    throw new Meteor.Error('error-newCoinbaseClient');
                }

                client.getAccount(coinbasePressItAccount, Meteor.bindEnvironment( function (err, account) {
                    if (err) {
                        console.log('Out hasBTCCleared() method. Error in client.getAccount(). No updates done. ' + err);
                        throw new Meteor.Error('error-getAccount');
                    }

                    account.getTransactions(null, Meteor.bindEnvironment(function (err, transactions) {
                        if (err) {
                            console.log('Out hasBTCCleared() method. Error in getTransactions(). No updates done. ' + err);
                            throw new Meteor.Error('error-getTransactions')
                        }

                        transactions.forEach(Meteor.bindEnvironment(function (transaction) {
                            //console.log(transaction);
                            var jsonTransaction = JSON.parse(transaction);
                            //console.log('*******\n'+jsonTransaction);
                            //setTimeout(function(){pass},2000000);
                            var coinbaseToAddress = null;
                            if (jsonTransaction.hasOwnProperty('address')) {
                                if (jsonTransaction['address'].hasOwnProperty('id')) {
                                    account.getAddress(jsonTransaction['address']['id'],
                                        Meteor.bindEnvironment(function (err, coinbaseToAddress) {
                                            /*                               console.log('Transaction: \n' + dump(transaction));
                                             console.log('Game: \n' + dump(currentGame));
                                             console.log('Transaction vs Game comparison:');
                                             console.log('transaction id: ' + jsonTransaction['id']);
                                             console.log('type: ' + jsonTransaction['type']);
                                             console.log('status: ' + jsonTransaction['status']);
                                             console.log('Transaction amount: ' + jsonTransaction['amount']['amount']);
                                             console.log('Game amount: ' + currentGame.btcAmount);
                                             console.log('Transaction to id: ' + jsonTransaction['address']['id']);
                                             console.log('Transaction to: ' + coinbaseToAddress['address']);
                                             console.log('Player 1 Game Deposit address: ' + currentGame.player1GameBTCAddress);
                                             console.log('Player 2 Game Deposit address: ' + currentGame.player2GameBTCAddress);

                                             if(jsonTransaction['status'] === 'completed')
                                             console.log('Condition1 OK');
                                             if(equalBTC(jsonTransaction['amount']['amount'], currentGame.btcAmount))
                                             console.log('Condition2 OK');
                                             if(isPlayerOne && coinbaseToAddress['address'] === currentGame.player1GameBTCAddress)
                                             console.log('Condition3a OK');
                                             if((!isPlayerOne) && coinbaseToAddress['address'] === currentGame.player2GameBTCAddress)
                                             console.log('Condition3b OK');
                                             */
                                            if ((jsonTransaction['status'] === 'completed') &&
                                                (equalBTC(jsonTransaction['amount']['amount'], currentGame.btcAmount))) {
                                                if (isPlayerOne && coinbaseToAddress['address'] === currentGame.player1GameBTCAddress) {
                                                    Games.update({_id: currentGame._id}, {
                                                        $set: {
                                                            player1Status: 'readyToPlay',
                                                            player1BTCTransaction: jsonTransaction['id']
                                                        }
                                                    });
                                                    console.log('Updating Player 1 to readyToPlay as transaction has cleared');
                                                    Meteor.clearInterval(intervalId);
                                                }
                                                else if ((!isPlayerOne) && coinbaseToAddress['address'] === currentGame.player2GameBTCAddress) {
                                                    Games.update({_id: currentGame._id}, {
                                                        $set: {
                                                            player2Status: 'readyToPlay',
                                                            player2BTCTransaction: jsonTransaction['id']
                                                        }
                                                    });
                                                    console.log('Updating Player 2 to readyToPlay as transaction has cleared');
                                                    Meteor.clearInterval(intervalId);
                                                }
                                            }
                                        }));
                                }
                            }
                        }));
                    }));
                }));
                if (counter === 60) {
                    console.log("Out hasBTCCleared() method. Cleared intervalId but only because it timed out after 1 hour");
                    Meteor.clearInterval(intervalId);
                }
              }, 60000); // every minute
            console.log('Out hasBTCCleared() method.');
        },

        //Should only be called for games that are completed and winner was determined
        //At this point the pressIt account must have had two payments already received
        //So, you can send the two amounts to the winner or reimburse both when tied
        sendBTCToWinner: function(){
            console.log('In sendBTCToWinner() method.');

            var currentGame = getCurrentGame();
            if (currentGame === null){
                console.log('getCurrentGame() returns null');
                throw new Meteor.Error('assert', 'getCurrentGame() returns null');
            }

            if (currentGame.status != 'played'){
                console.log('current Game is not in played status. Nothing done');
                console.log('Out sendBTCToWinner() method.');
                return;
            }

            var client = new coinbase.Client({
                'apiKey': coinbaseApiKey,
                'apiSecret': coinbaseApiSecret
            });

            if (client === null) {
                console.log('Error in new coinbase.Client()')
                throw new Meteor.Error('assert', 'new coinbase.Client() returns null');
            }

            client.getAccount(coinbasePressItAccount, Meteor.bindEnvironment( function (err, account) {
                if (err) {
                    console.log('Error in client.getAccount. Err:\n' + err);
                    throw new Meteor.Error('error-getAccount', err);
                }

                if (currentGame.winner === 'tie') {
                    console.log('Game was tied. Sending ' + currentGame.btcAmount + ' btc to both ' +
                        currentGame.player1BTCAddress + ' and ' + currentGame.player2BTCAddress + '.');
                    account.sendMoney({
                            'to': currentGame.player1BTCAddress,
                            'amount': currentGame.btcAmount,
                            'currency': 'BTC',
                            'idem': currentGame.player1BTCAddress
                        }, Meteor.bindEnvironment( function (err, tx) {
                            if (err) {
                                console.log('Error in sendMoney() to player 1\n' + err);
                                throw new Meteor.Error('coinbaseError', 'account.sendMoneyFailed');
                            }
                            account.sendMoney({
                                'to': currentGame.player2BTCAddress,
                                'amount': currentGame.btcAmount,
                                'currency': 'BTC',
                                'idem': currentGame.player2BTCAddress
                            }, Meteor.bindEnvironment( function (err, tx) {
                                if (err) {
                                    console.log('Error in sendMoney() to player 2\n' + err);
                                    throw new Meteor.Error('coinbaseError', 'account.sendMoneyFailed');
                                }
                                Meteor.call('setCurrentGameToCompleted', function (err, result) {
                                    if (err) {
                                        console.log('Error in setCurrentGameToCompleted');
                                        throw new Meteor.Error('error-setCurrentGameToCompleted', err);
                                    }
                                })
                            }));
                        }));
                }
                else if (currentGame.winner === 'player1') {
                    console.log('Game was won by Player 1. Sending ' + 2 * currentGame.btcAmount + ' to ' +
                        currentGame.player1BTCAddress + '.');
                    account.sendMoney({
                        'to': currentGame.player1BTCAddress,
                        'amount': 2 * currentGame.btcAmount,
                        'currency': 'BTC',
                        'idem': currentGame.player1BTCAddress
                    }, Meteor.bindEnvironment( function (err, tx) {
                        if (err) {
                            console.log('Error in sendMoney()\n' + err);
                            throw new Meteor.Error('coinbaseError', 'account.sendMoneyFailed');
                        }
                        Meteor.call('setCurrentGameToCompleted', function (err, result) {
                            if (err) {
                                console.log('Error in setCurrentGameToCompleted');
                                throw new Meteor.Error('error-setCurrentGameToCompleted', err);
                            }
                        })
                    }));
                }
                else if (currentGame.winner === 'player2') {
                    console.log('Game was won by Player 2. Sending ' + 2 * currentGame.btcAmount + ' to ' +
                        currentGame.player2BTCAddress + '.');
                    account.sendMoney({
                        'to': currentGame.player2BTCAddress,
                        'amount': 2 * currentGame.btcAmount,
                        'currency': 'BTC',
                        'idem': currentGame.player2BTCAddress
                    }, Meteor.bindEnvironment( function (err, tx) {
                        if (err) {
                            console.log('Error in sendMoney()\n' + err);
                            throw new Meteor.Error('coinbaseError', 'account.sendMoneyFailed');
                        }
                        Meteor.call('setCurrentGameToCompleted', function (err, result) {
                            if (err) {
                                console.log('Error in setCurrentGameToCompleted');
                                throw new Meteor.Error('error-setCurrentGameToCompleted', err);
                            }
                        })
                    }));
                }
                else {
                    console.log('Game must be in tie, player1 or player2 winner state but is' + currentGame.winner);
                    throw new Meteor.Error('assert',
                        'Game must be in tie, player1 or player2 winner state but is' + currentGame.winner);
                }
            }))

            console.log('Out sendBTCToWinner() method.');
        }
    })
}

