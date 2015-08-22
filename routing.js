/**
 * Created by cmt on 8/22/15.
 */
Router.configure({
    layoutTemplate: 'main'
});

Router.route('/', {
    template: 'home'
});

Router.route('/home');
Router.route('/rules');
Router.route('/createNewGame');
Router.route('/listGames');
Router.route('/game');
Router.route('/about');

