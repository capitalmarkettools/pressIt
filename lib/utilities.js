/**
 * Created by cmt on 10/20/16.
 */

cl = function (string) {
    console.log(string);
};

dump = function(obj){
    return(JSON.stringify(obj, null, 2));
};

//checks up to six digits
//equalBTC(1,1.0000001) = true
//equalBTC(1,1.00000001) = false
equalBTC = function(one, two){
    var a = (Math.round(parseFloat(one)*10000000)/10000000);
    var b = (Math.round(parseFloat(two)*10000000)/10000000);
    //cl('a='+a);
    //cl('b='+b)
    return(a===b);
};
