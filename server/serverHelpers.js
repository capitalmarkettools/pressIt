/**
 * Created by cmt on 12/17/15.
 */

Accounts.onCreateUser(function(options, user){
//    console.log("In onCreateUser")
    if(options.profile) {
        user.profile = options.profile;
    }
    profile = {btcAddress: ''};
    user.profile = profile;

    return user;
});

// BOTH PUBLISH METHODS DO NOT WORK. NOT SURE WHY. SO, USE AUTOPUBLISH NOW
//Meteor.publish("userBTCAddress", function () {
//    console.log('In publish userBTCAddress');
//    user = Meteor.users.find({_id: this.userId});
//    console.log(user);
//    return user.profile.btcAddress;
//});

//Meteor.publish("games", function(){
//    console.log('In publish games');
//    games = Games.find({}, {sort: {btcAmount:1}});
//    console.log(games);
//    if(typeof games != 'undefined'){
//        return games;
//
//    }
//})



