  window.onload = function() {

    var game = new Phaser.Game(1200, 800, Phaser.CANVAS, 'game-container');
    var cursors;
    var playGame = function(game){}
    var step = 220;
    var stumpSizeX = 102;
    var stumpSizeY = 52;
    var stumpSpaceX = 14;
    var stumpSpaceY = 5;
    var myRaccoonStumpStartX = 150;
    var myRaccoonStumpStartY = 480;
    var stumpIndent = [0, 8, 16, 24, 24, 16, 8, 0]
    var ip = "127.0.0.1";
    var sock = new WebSocket("ws://" + ip + ":5678/ws");


    playGame.prototype = {

         preload: function() {
            game.load.spritesheet('landscape', '/assets/landscape.jpg');
            game.load.spritesheet('raccoon_side', '/assets/raccoon_side.png', 159, 153)
            game.load.spritesheet('stump', '/assets/stump.png');
//            game.load.atlasJSONHash('bot', '/assets/running_bot.png', '/assets/running_bot.json');
//            game.load.spritesheet('mummy', '/assets/metalslug_mummy37x45.png', 37, 45, 18);
        },



         create: function() {
            var stumpsArray = this.arrageStumps();
            game.world.bounds = new Phaser.Rectangle(100, 50, 1000, 700);
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.physics.setBoundsToWorld();

            game.add.sprite(0, 0, 'landscape');
            this.drawStumps(stumpsArray);
            this.raccoon = game.add.sprite(350, 650, 'raccoon_side', 0);
            this.raccoon.anchor.setTo(0.5, 0.5);
            this.physics.arcade.enable(this.raccoon);
            this.raccoon.body.collideWorldBounds = true;
            var pos = this.getPos(this.raccoon);

            sock.onopen = function() {
                sock.send(pos);
            };

            sock.onmessage = function(message) {
                console.log(JSON.parse(message.data));
            };


//            this.bot.animations.add('run');
//            this.bot.animations.play('run', 15, true);

//            this.input.onDown.addOnce(this.changeMummy, this);
            cursors = game.input.keyboard.createCursorKeys();

        },

//        changeMummy: function() {
//            this.bot.loadTexture('mummy', 0);
//            this.bot.animations.add('walk');
//            this.bot.animations.play('walk', 30, true);
//        },


        update: function(){
            this.raccoon.body.velocity.x = 0
            if (cursors.left.isDown)
            {
                //  Move to the left
                this.raccoon.loadTexture('raccoon_side', 0);
                this.raccoon.body.velocity.x = -step;
                this.sendToWS(this.getPos(this.raccoon));
//                this.raccoon.animations.play('run');
            }
             else if (cursors.right.isDown)
            {
                //  Move to the right
                this.raccoon.loadTexture('raccoon_side', 1);
                this.raccoon.body.velocity.x = step;
                this.sendToWS(this.getPos(this.raccoon));
//                this.raccoon.animations.play('run');
            }
//            else
//            {
//                //  Stand still
//                this.bot.animations.stop();
//
//                this.bot.frame = 4;
//            }

        },

        arrageStumps: function() {
            var stumpsArray = [
                [1, 0, 0],
                [0, 0, 1],
                [0, 1, 0],
                [0, 0, 1],
                [0, 1, 1],
                [1, 1, 0],
                [1, 0, 1],
                [1, 1, 1]
            ];
            for (i = 0; i < stumpsArray.length; i++) {
                j = Math.floor(Math.random() * (i + 1));
                temp = stumpsArray[i];
                stumpsArray[i] = stumpsArray[j];
                stumpsArray[j] = temp;
            }
            return stumpsArray;
        },

        drawStumps: function(stumpsArray){
            for (var i=0; i < stumpsArray.length; i++){
                for (var j=0; j < 3; j++ ){
                    if (stumpsArray[i][j] == 1){
                    game.add.image(myRaccoonStumpStartX + i * (stumpSizeX + stumpSpaceX), myRaccoonStumpStartY + j * (stumpSizeY + stumpSpaceY) + stumpIndent[i], "stump");

                    }
                }
            }
        },

        getPos: function(object) {
            var pos = JSON.stringify({
                x: object.x,
                y: object.y
            });
            return pos;
        },

        sendToWS: function(pos) {
            sock.send(pos);
        }

//function render() {
//
//    game.debug.body(bot);
//
//}

    };
    game.state.add("PlayGame", playGame);
    game.state.start("PlayGame");
};
