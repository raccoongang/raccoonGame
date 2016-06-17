  window.onload = function() {

    var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'game-container');
    var cursors;
    var playGame = function(game){}
    
    playGame.prototype = {
        
         preload: function() {
            game.load.atlasJSONHash('bot', '/assets/running_bot.png', '/assets/running_bot.json');
            game.load.spritesheet('mummy', '/assets/metalslug_mummy37x45.png', 37, 45, 18);
        },



         create: function() {

            game.physics.startSystem(Phaser.Physics.ARCADE);

            this.bot = game.add.sprite(200, 200, 'bot');
            this.bot.animations.add('run');
            this.bot.animations.play('run', 15, true);

            this.input.onDown.addOnce(this.changeMummy, this);
            cursors = game.input.keyboard.createCursorKeys();
            this.physics.arcade.enable(this.bot);

        },

        changeMummy: function() {
            this.bot.loadTexture('mummy', 0);
            this.bot.animations.add('walk');
            this.bot.animations.play('walk', 30, true);
        },

                
        update: function(){
            this.bot.body.velocity.x = 0;
            if (cursors.left.isDown)
            {
                //  Move to the left
                this.bot.body.velocity.x = -150;

                this.bot.animations.play('run');
            }
             else if (cursors.right.isDown)
            {
                //  Move to the right
                this.bot.body.velocity.x = 150;

                this.bot.animations.play('run');
            }
            else
            {
                //  Stand still
                this.bot.animations.stop();

                this.bot.frame = 4;
            }

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