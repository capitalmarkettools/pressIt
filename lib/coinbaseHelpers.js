/**
 * Created by cmt on 9/12/16.
 */
if (Meteor.isServer) {
    const coinbase = Npm.require('coinbase');

    var Future = Npm.require('fibers/future');

//TODO Fix the way function is coded
    Meteor.methods({
        createBTCAddress: function () {
            var client = new coinbase.Client({
                'apiKey': 'vVoAs3E8sbcOgUSy',
                'apiSecret': 'H2meAs5OLTzt5UDjqYpD2IWDJFup173U'
            });

            /*
             console.log('client***************');
             console.log(client);

             client.getAccounts({}, function(err, accounts) {
             accounts.forEach(function(acct) {
             console.log('account from getAccounts() *********************');
             console.log(acct);
             });
             });
             */

            var future = new Future();
            //account id is from PressIt account. Find Id via logic above to go through all accts
            client.getAccount('0d9b9021-f33f-552b-8186-98e68cea28ac', function (err, account) {
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
    });
}