Template.playGame.rendered = function () {

    //keep width in line with css
    var game = new Phaser.Game(width = 200, height = 200, Phaser.CANVAS, 'phaserGameDom', {
        preload: preload,
        create: create,
        update: update
    });
    return game;

    function preload() {
        game.load.image('redSquare', '/redSquare25x25.png');
        game.load.image('yellowRectangle', '/yellowRectangle100x10.png');
        //game.load.spritesheet('submitButton', '/submitButtonSmallFont10px.png');
        game.load.spritesheet('startButton', '/startButtonFont10px.png');
        game.load.spritesheet('stopButton', '/stopButtonFont10px.png');
        game.load.spritesheet('submitButton', '/submitButtonFont10px.png');
        game.load.spritesheet('startFallButton', '/startFallButton.png');
        game.load.spritesheet('stopFallButton', '/stopFallButton.png');
    }

    function create() {
        game.physics.startSystem(Phaser.Physics.P2JS);

        cursors = game.input.keyboard.createCursorKeys();

        redSquare = game.add.sprite(x = game.world.centerX, y = 35, 'redSquare');
        //redSquare.anchor.set(0.5, 0.5);
        game.physics.p2.enable(redSquare);

        yellowRectangle = game.add.sprite(x = game.world.centerX, y = game.world.height - 10, 'yellowRectangle');
        //yellowRectangle.anchor.set(0.5, 0.5);
        // yellowRectangle.physicsType = Phaser.SPRITE;
        game.physics.p2.enable(yellowRectangle);
        //yellowRectangle.scale.x = 0.1;
        yellowRectangle.body.moves = false;
        yellowRectangle.immovable = true;

        //Start Button drops the red square. Stop stops it and takes score
        //Start also starts the game which will prevent the user from refreshing
        startButton = game.add.button(game.world.width - 65, 10, 'startButton', callback = function () {
            console.log('In startButton click() callback');
            //Check if user has previosuly started game but then stopped.
            // This is not legal and results in 0 score
            if (playerHasAlreadyStartedGamePreviously()) {
                console.log('playerHasAlreadyStartedGamePreviously() = true');
                determineWinnerAndPayout(this);
                Router.go('/listGames');
                alert('You previously had started the game but did not finish. Score is 0.');
            }
            else
                console.log('playerHasAlreadyStartedGamePreviously() = false');

            //SubmitInitialScore initialized game so that user cannot click refresh/back...
            submitInitialScore();
            stopStartSprite();
            startButton.visible = false;
            stopButton.visible = true;
            console.log('Out startButton click() callback');
        }, this);

        stopButton = game.add.button(game.world.width - 65, 10, 'stopButton', callback = function () {
            stopStartSprite();
            stopButton.visible = false;
            submitButton.visible = true;
        }, this);
        stopButton.visible = false;

        submitButton = game.add.button(game.world.width - 65, 10, 'submitButton', callback = function () {
            submitScore(score);
            determineWinnerAndPayout(this);
            Router.go('/listGames');
        }, this);
        submitButton.visible = false;

        //Score text
        text = game.add.text(10, 15, "Score: 0", {font: "10px Arial", fill: "#ffffff", align: "center"});
        text.anchor.set(0, 0);
        originalDistance = Math.round(game.physics.arcade.distanceBetween(redSquare, yellowRectangle));
        console.log('in create(): originalDistance = ' + originalDistance);
        scalarToMakeScore100 = 100 / originalDistance;
        alive = true;
        move = false;
        prevScore = 0;
    }

    function update() {
        //console.log(alive);
        if (alive) {
            //console.log('alive = true');
            if (move)
                accelerateToObject(redSquare, yellowRectangle, 500);

            if (overlaps(redSquare, yellowRectangle)) {
                alive = false;
                score = 0;
            }
            else {
                //console('alive = false');
                score = Math.round(scalarToMakeScore100 *
                    (originalDistance - game.physics.arcade.distanceBetween(redSquare, yellowRectangle)));
                if (prevScore != score) {
                    console.log('in update(): Scaler = ' + (100 / originalDistance));
                }
                prevScore = score;

                text.text = "Score: " + score;
            }
        }
        else {
            text.text = "Score: 0";
            game.stage.backgroundColor = '#992d2d';
//                Phaser.Signal.dispose();
        }
    }

    function accelerateToObject(obj1, obj2, speed) {
        if (typeof speed === 'undefined') {
            speed = 60;
        }
        var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
        obj1.body.rotation = angle + game.math.degToRad(90);
        obj1.body.force.x = Math.cos(angle) * speed;
        obj1.body.force.y = Math.sin(angle) * speed;
    }

    function stopStartSprite() {
        move = move ? false : true;

        redSquare.body.velocity.x = 0;
        redSquare.body.velocity.y = 0;

        //moved score calculation
        // to update() to see if this improves score keeping
        //score = originalDistance - Math.round(game.physics.arcade.distanceBetween(redSquare, yellowRectangle));
        text.text = "Score: " + score;
    }

    function overlaps(spriteA, spriteB) {

        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);
    }
};

