  window.onload = function() {

    var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'game-container');
    var cursors;
    var playGame = function(game){}
    var step = 220;

    playGame.prototype = {

         preload: function() {
            game.load.spritesheet('landscape', '/assets/landscape.jpg');
            game.load.spritesheet('raccoon_side', '/assets/raccoon_right.png') 
//            game.load.atlasJSONHash('bot', '/assets/running_bot.png', '/assets/running_bot.json');
//            game.load.spritesheet('mummy', '/assets/metalslug_mummy37x45.png', 37, 45, 18);
        },



         create: function() {
            var stumpsArray = this.arrageStumps();
            game.world.bounds = new Phaser.Rectangle(100, 50, 1000, 800); 
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.physics.setBoundsToWorld();

            game.add.sprite(0, 0, 'landscape'); 
             
            this.raccoon = game.add.sprite(350, 730, 'raccoon_side');
            this.raccoon.anchor.setTo(0.5, 0.5);
            this.physics.arcade.enable(this.raccoon);
            this.raccoon.body.collideWorldBounds = true;
             
            
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
                this.raccoon.scale.x = -1;
                this.raccoon.body.velocity.x = -step;
//                this.raccoon.animations.play('run');
            }
             else if (cursors.right.isDown)
            {
                //  Move to the right
                this.raccoon.scale.x = 1;
                this.raccoon.body.velocity.x = step;
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
