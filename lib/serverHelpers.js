/**
 * Created by cmt on 12/17/15.
 */

if (Meteor.isServer){
    Accounts.onCreateUser(function(options, user){
    //    console.log("In onCreateUser")
        if(options.profile) {
            user.profile = options.profile;
        }
        profile = {btcAddress: ''};
        user.profile = profile;

        return user;
    });
}