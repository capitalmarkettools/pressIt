Template.game.helpers({
    phaserGame: function() {
        var game = new Phaser.Game(width = 600, height = 300, Phaser.AUTO, 'phaserGameDom', {
            preload: preload,
            create: create,
            update: update
        });
        return game;

        var redSquare;
        var yellowRectangle;
        var score = 0.0;
        var originalDistance = game.world.height - 100 - 35;

        function preload() {
            game.load.image('redSquare', '/redSquare25x25.png');
            game.load.image('yellowRectangle', '/yellowRectangle100x10.png');
            game.load.spritesheet('submitButton', '/submitButton.png');
            game.load.spritesheet('startFallButton', '/startFallButton.png');
            game.load.spritesheet('stopFallButton', '/stopFallButton.png');
        }

        function create() {
            game.physics.startSystem(Phaser.Physics.P2JS);

            cursors = game.input.keyboard.createCursorKeys();

            redSquare = game.add.sprite(x = game.world.centerX, y = 35, 'redSquare');
            //redSquare.anchor.set(0.5, 0.5);
            game.physics.p2.enable(redSquare);

            yellowRectangle = game.add.sprite(x = game.world.centerX, y = game.world.height - 100, 'yellowRectangle');
            //yellowRectangle.anchor.set(0.5, 0.5);
            // yellowRectangle.physicsType = Phaser.SPRITE;
            game.physics.p2.enable(yellowRectangle);
            //yellowRectangle.scale.x = 0.1;
            yellowRectangle.body.moves = false;
            yellowRectangle.immovable = true;

            //with mouse click stop and start the sprite that's falling down
            //only one click allowed
            game.input.onDown.add(stopStartSprite, this);

            //Submit Button

            submitButton = game.add.button(380, 10, 'submitButton', callback=function(){
                submitScore(score);
                determineWinner(this);
                Router.go('/listGames');
            }, this);

            //Score text
            text = game.add.text(10, 10, "Distance: " + score, {font: "30px Arial", fill: "#ff0044", align: "center"});
            text.anchor.set(0, 0);
            originalDistance = Math.round(game.physics.arcade.distanceBetween(redSquare, yellowRectangle));
            text.text = "Score: 0";
        }

        var move = false;

        function update() {
            if (checkOverlap(redSquare, yellowRectangle)){
                text.text = "Score: 0";
                game.stage.backgroundColor = '#992d2d';
//                Phaser.Signal.dispose();
            }

            if (move) {
                accelerateToObject(redSquare, yellowRectangle, 500);
            }

            if (this.game.physics.arcade.collide(redSquare, yellowRectangle)) {
                alert("collision");
            }
            if (this.game.physics.arcade.overlap(redSquare, yellowRectangle)) {
                alert("overlap");
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

            score = originalDistance - Math.round(game.physics.arcade.distanceBetween(redSquare, yellowRectangle));
            text.text = "Score: " + score;
        }

        function checkOverlap(spriteA, spriteB) {

            var boundsA = spriteA.getBounds();
            var boundsB = spriteB.getBounds();

            return Phaser.Rectangle.intersects(boundsA, boundsB);
        }
    }
});
