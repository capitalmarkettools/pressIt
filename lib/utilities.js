/**
 * Created by cmt on 10/20/16.
 */

cl = function (string) {
    //from http://stackoverflow.com/questions/280389/how-do-you-find-out-the-caller-function-in-javascript
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
    //console.log('a='+a);
    //console.log('b='+b)
    return(a===b);
};
