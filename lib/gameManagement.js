/**
 * Created by cmt on 8/22/15.
 */
Games = new Mongo.Collection("games");

/*Games.insert({
    btcAmount: 10,
    createdAt: new Date(),
    winner: ''
});*/
//Games.remove({});
if (Meteor.isClient){

//    games = $meteor.collection(Games);

  //  $scope.addGame = function(btcAmount){
  //      $meteor.call('addGame', btcAmount);
  //  };
};

Meteor.methods({
    addGame: function(btcAmount){
        Games.insert({
            btcAmount: btcAmount,
            createdAt: new Date(),
            winner: ''
        })
    }
});

