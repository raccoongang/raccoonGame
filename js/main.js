  window.onload = function() {

    var game = new Phaser.Game(1200, 800, Phaser.CANVAS, 'game-container');
    var cursors;
    var playGame = function(game){}

    var stumpSizeX = 102;
    var stumpSizeY = 52;
    var stumpSpaceX = 14;
    var stumpSpaceY = 25;      
    var myRaccoonStumpStartX = 150;
<<<<<<< HEAD
    var myRaccoonStumpStartY = 440;
      
      
    var raccoonStartX = 100;
    var raccoonStartY = 330; 
    var raccoonStepX = 116;  
    var raccoonStepY = 77;
    var stumpIndent = [0, 8, 16, 24, 24, 16, 8, 0]  
    
    var clothesGroup

   
=======
    var myRaccoonStumpStartY = 480;
    var stumpIndent = [0, 8, 16, 24, 24, 16, 8, 0]
    var ip = "127.0.0.1";
    var sock = new WebSocket("ws://" + ip + ":5678/ws");


>>>>>>> ebc751fbc9f5e3cb286c57ab92cd929b5fa48166
    playGame.prototype = {

         preload: function() {
            game.load.spritesheet('landscape', '/assets/landscape.jpg');
<<<<<<< HEAD
            game.load.spritesheet('raccoon_side', '/assets/raccoon_side.png', 510, 509) 
            game.load.spritesheet('raccoon_front', '/assets/raccoon_front.png', 465, 511) 
            game.load.spritesheet('clothes', '/assets/clothes.png', 226, 212);

=======
            game.load.spritesheet('raccoon_side', '/assets/raccoon_side.png', 159, 153)
>>>>>>> ebc751fbc9f5e3cb286c57ab92cd929b5fa48166
            game.load.spritesheet('stump', '/assets/stump.png');
             
            this.isUp = true;this.isDown = true;this.isLeft = true;this.isRight = true;
//           game.load.atlasJSONHash('bot', '/assets/running_bot.png', '/assets/running_bot.json');
//            game.load.spritesheet('mummy', '/assets/metalslug_mummy37x45.png', 37, 45, 18);
        },



         create: function() {
<<<<<<< HEAD
            this.stumpsArray = this.arrageStumps();
            game.world.bounds = new Phaser.Rectangle(50, 50, 1100, 700); 
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.physics.setBoundsToWorld();
            
          
            game.add.sprite(0, 0, 'landscape'); 
            this.clothesGroup = game.add.physicsGroup(); 
            this.drawStumps(this.stumpsArray); 
            this.raccoon = game.add.sprite(raccoonStartX, raccoonStartY+3*raccoonStepY, 'raccoon_side', 0);
            this.raccoon.state = 'right' 
            this.physics.arcade.enable(this.raccoon);
            this.raccoon.body.collideWorldBounds = true;
            this.raccoon.scale.x = 0.3; 
            this.raccoon.scale.y = 0.3; 
            this.raccoon.positionX = 0;
            this.raccoon.positionY = 3; 

            
=======
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


>>>>>>> ebc751fbc9f5e3cb286c57ab92cd929b5fa48166
//            this.bot.animations.add('run');
//            this.bot.animations.play('run', 15, true);

//            this.input.onDown.addOnce(this.changeMummy, this);
             cursors = game.input.keyboard.createCursorKeys();

        },

        update: function(){
            if (cursors.left.isDown && this.isLeft)
            {
                if (this.raccoon.state != 'left'){
                    this.raccoon.state = 'left';
                    this.raccoon.loadTexture('raccoon_side', 1);
                }
                else {
                    this.raccoon.positionX -= this.canGoToDirection('left');
                }
                this.drawRaccoon();
                this.isLeft = false; 
            }
             else if (cursors.right.isDown && this.isRight)
            {
<<<<<<< HEAD
                if (this.raccoon.state != 'right'){
                    this.raccoon.loadTexture('raccoon_side', 0);
                    this.raccoon.state = 'right';
                }    
                else {
                    this.raccoon.positionX += this.canGoToDirection('right');
                }
                this.drawRaccoon();
                this.isRight = false; 
=======
                //  Move to the left
                this.raccoon.loadTexture('raccoon_side', 0);
                this.raccoon.body.velocity.x = -step;
                this.sendToWS(this.getPos(this.raccoon));
//                this.raccoon.animations.play('run');
>>>>>>> ebc751fbc9f5e3cb286c57ab92cd929b5fa48166
            }
            
            else if (cursors.up.isDown && this.isUp)
            {
<<<<<<< HEAD
              if (this.raccoon.state != 'up'){
                  this.raccoon.loadTexture('raccoon_front', 1);
                  this.raccoon.state = 'up';
              }
              else {
                  this.raccoon.positionY -= this.canGoToDirection('up');
              }
              this.drawRaccoon();    
              this.isUp = false;        
            }
            
            else if (cursors.down.isDown && this.isDown)
            {
              this.goFiber();
              if (this.raccoon.state != 'down'){
                  this.raccoon.loadTexture('raccoon_front', 0);
                  this.raccoon.state = 'down';
              }
              else {
                  this.raccoon.positionY += this.canGoToDirection('down');
              }
              this.drawRaccoon();
              this.isDown = false;         
=======
                //  Move to the right
                this.raccoon.loadTexture('raccoon_side', 1);
                this.raccoon.body.velocity.x = step;
                this.sendToWS(this.getPos(this.raccoon));
//                this.raccoon.animations.play('run');
>>>>>>> ebc751fbc9f5e3cb286c57ab92cd929b5fa48166
            }
//            else
//            {
//                //  Stand still
//                this.bot.animations.stop();
//
//                this.bot.frame = 4;
//            }
            
            if (cursors.up.isUp){this.isUp = true;}
            if (cursors.down.isUp){this.isDown = true;}
            if (cursors.left.isUp){this.isLeft = true;}
            if (cursors.right.isUp){this.isRight = true;}

        },

        arrageStumps: function() {
            var stumpsArray = [
                [1, 0, 0, 1],
                [0, 0, 1, 1],
                [0, 1, 0, 1],
                [0, 0, 1, 1],
                [0, 1, 1, 1],
                [1, 1, 0, 1],
                [1, 0, 1, 1],
                [1, 1, 1, 1]
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
<<<<<<< HEAD
=======

>>>>>>> ebc751fbc9f5e3cb286c57ab92cd929b5fa48166
                    }
                }
            }
        },
<<<<<<< HEAD
        
        canGoToDirection: function(direction){
          switch(direction) {
              case 'up':
                  if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY-1] == 1) 
                    {return 1}
                  else if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY-2] == 1)
                    {return 2}
                  else {return 0}   
                  break;
              case 'down':
                  if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY+1] == 1) 
                    {return 1}
                  else if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY+2] == 1)
                    {return 2}
                  else {return 0}   
                  break;
              case 'right':
                  if (this.stumpsArray[this.raccoon.positionX+1] && this.stumpsArray[this.raccoon.positionX+1][this.raccoon.positionY] == 1) 
                    {return 1}
                  else if (this.stumpsArray[this.raccoon.positionX+2] && this.stumpsArray[this.raccoon.positionX+2][this.raccoon.positionY] == 1)
                    {return 2}
                  else {return 0} 
                  break;
              case 'left':
                  if (this.stumpsArray[this.raccoon.positionX-1] && this.stumpsArray[this.raccoon.positionX-1][this.raccoon.positionY] == 1) 
                    {return 1}
                  else if (this.stumpsArray[this.raccoon.positionX-2] && this.stumpsArray[this.raccoon.positionX-2][this.raccoon.positionY] == 1)
                    {return 2}
                  else {return 0} 
                  break;
          }
            
        },
        
        goFiber: function(){
            var cloth = this.clothesGroup.create(-73, 560, 'clothes', 5); 
            console.log(cloth);
            this.physics.arcade.enable(cloth);
            cloth.scale.x = 0.3; 
            cloth.scale.y = 0.3; 
            cloth.body.velocity.x = 100;
//            clothesGroup.add(cloth);

            
        },
        
        drawRaccoon: function(){
            var leftCorrect = this.raccoon.state == 'left' ? 70 : 0;  
            var upCorrect = this.raccoon.state == 'up'  || this.raccoon.state == 'down' ? 55 : 0;
            this.raccoon.body.x = raccoonStartX + this.raccoon.positionX * raccoonStepX + leftCorrect + upCorrect;
            console.log(this.raccoon.state);
            console.log(raccoonStartY + this.raccoon.positionY * raccoonStepY);
            this.raccoon.body.y = raccoonStartY + this.raccoon.positionY * raccoonStepY;
        },
        
        
=======

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

>>>>>>> ebc751fbc9f5e3cb286c57ab92cd929b5fa48166
//function render() {
//
//    game.debug.body(bot);
//
//}

    };
    game.state.add("PlayGame", playGame);
    game.state.start("PlayGame");
};
