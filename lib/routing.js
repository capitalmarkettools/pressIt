/**
 * Created by cmt on 8/22/15.
 */
Router.configure({
    //this template is used globally for
    //the app layout
    layoutTemplate: 'applicationLayout'
});

Router.route('/', {
    template: 'home'
});

Router.route('/home');
Router.route('/rules');
Router.route('/newGame');
Router.route('/listGames');
Router.route('/playGame');
Router.route('/practiceGame');
Router.route('/about');

