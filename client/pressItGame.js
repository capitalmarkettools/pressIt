if (Meteor.isClient) {
    Template.game.phaserGame = function() {
        var game = new Phaser.Game(width = "100", height = "100", Phaser.AUTO, 'pressIt', {
            preload: preload,
            create: create,
            update: update
        });


        var redSquare;
        var yellowRectangle;
        var score = 0.0;

        function preload() {
            game.load.image('redSquare', '/redSquare25x25.png');
            game.load.image('yellowRectangle', '/yellowRectangle100x10.png');
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
            game.input.onDown.add(stopStartSprite, this);

//    var directions = "Distance: " + score;
            //  var style = { font: "30px Arial", fill: "#ff0044", align: "center" };
            text = game.add.text(10, 10, "Distance: " + score, {font: "30px Arial", fill: "#ff0044", align: "center"});
            text.anchor.set(0, 0);
        };

        var move = false;

        function update() {
            if (move) {
                accelerateToObject(redSquare, yellowRectangle, 500);
            }

            if (this.game.physics.arcade.collide(redSquare, yellowRectangle)) {
                alert("collision");
            }
            if (this.game.physics.arcade.overlap(redSquare, yellowRectangle)) {
                alert("overlap");
            }

            game.physics.arcade.collide(redSquare, yellowRectangle, collisionHandler, null, this);

        };


        function accelerateToObject(obj1, obj2, speed) {
            if (typeof speed === 'undefined') {
                speed = 60;
            }
            var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
            obj1.body.rotation = angle + game.math.degToRad(90);  // correct angle of angry bullets (depends on the sprite used)
            obj1.body.force.x = Math.cos(angle) * speed;    // accelerateToObject
            obj1.body.force.y = Math.sin(angle) * speed;
        }

        function collisionHandler(obj1, obj2) {
            text.text = "sdfsadfas";
            game.stage.backgroundColor = '#992d2d';
            alert("coll");
        }

        function stopStartSprite() {
            if (move)
                move = false;
            else
                move = true;
            redSquare.body.velocity.x = 0;
            redSquare.body.velocity.y = 0;

            score = Math.round(game.physics.arcade.distanceBetween(redSquare, yellowRectangle));
            text.text = "Distance: " + score;
        }
    }
}