/**
 * Created by cmt on 8/23/15.
 */

Template.listGames.helpers({
    games : function(){
        return Games.find({}, {sort: {btcAmount:1}});
    }
});