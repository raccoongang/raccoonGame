window.onload = function () {

    var id = Math.random();
    var game = new Phaser.Game(1200, 800, Phaser.CANVAS, 'game-container');
    var cursors;
    var playGame = function (game) {
    }

    var stumpSizeX = 102;
    var stumpSizeY = 52;
    var stumpSpaceX = 14;
    var stumpSpaceY = 25;
    var myRaccoonStumpStartX = 150;
    var myRaccoonStumpStartY = 440;

    var bulletTime = 0

    var enemyStumpSizeX = 81;
    var enemyStumpSizeY = 36;
    var enemyStumpSpaceX = 6;
    var enemyStumpSpaceY = 12;
    var enemyStumpStartX = 260;
    var enemyStumpStartY = 390;


    var raccoonStartX = 100;
    var raccoonStartY = 330;
    var raccoonStepX = 116;
    var raccoonStepY = 77;
    var stumpIndent = [0, 8, 16, 24, 24, 16, 8, 0]

    var enemyStartX = 263;
    var enemyStartY = 345;
    var enemyStepX = 86;
    var enemyStepY = 53;

    var stumpIndent = [0, 8, 16, 24, 24, 16, 8, 0]
    var enemyStumpIndent = [0, -8, -16, -24, -24, -16, -8, 0]


    var clothesGroup;

    var ip = "192.168.0.109";



    var _id = localStorage.getItem('_id');
    //if (_id == null) {
    //    _id = localStorage.setItem('_id', new String(IP + new Date()).hashCode());
    //}

    playGame.prototype = {

        preload: function () {
            game.load.spritesheet('landscape', '/assets/landscape.jpg');
            game.load.spritesheet('raccoon_side', '/assets/raccoon_side.png', 510, 509)
            game.load.spritesheet('raccoon_front', '/assets/raccoon_front.png', 465, 511)
            game.load.spritesheet('clothes', '/assets/clothes.png', 226, 212);
            game.load.spritesheet('stump', '/assets/stump.png');
            // game.load.spritesheet('splash', '/assets/splash.png');
            game.load.spritesheet('splash', '/assets/splash_Sprites.png', 64, 64);
            game.load.spritesheet('bucket', '/assets/bucket.png');
            game.load.spritesheet('wet_fiber', '/assets/wet_fiber.png');
            game.load.spritesheet('waves', '/assets/waves.png');
            game.load.spritesheet('live', '/assets/live_logo.png');

            try {
                this.sock = new WebSocket("ws://" + ip + ":5678/ws");

                var self = this;

                this.waitForConnection = function (callback, interval) {
                    if (this.sock.readyState === 1) {
                        callback();
                    } else {
                        var that = this;
                        // optional: implement backoff for interval here
                        setTimeout(function () {
                            that.waitForConnection(callback, interval);
                        }, interval);
                    }
                };

                this.sock._send = function(message, callback){
                    self.waitForConnection(function () {
                        self.sock.send(message);
                        if (typeof callback !== 'undefined') {
                            callback();
                        }
                    }, 1000);
                };
            }
            catch (err) {
                console.log("Якась ... з вашими сокетами.");
                this.sock = undefined;
            }
            this.isUp = true;
//           game.load.atlasJSONHash('bot', '/assets/running_bot.png', '/assets/running_bot.json');
//            game.load.spritesheet('mummy', '/assets/metalslug_mummy37x45.png', 37, 45, 18);
        },


        create: function () {
            this.stumpsArray = this.arrageStumps();
            game.world.bounds = new Phaser.Rectangle(50, 50, 1100, 700);
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.physics.setBoundsToWorld();


            this.landscape = game.add.sprite(0, 0, 'landscape');
            this.waves = game.add.sprite(-1500, 330, 'waves');
            this.bucket = game.add.sprite(10, 650, 'bucket');
            

            game.add.tween(this.waves).to({x: 1000}, 100000, 'Linear', true, 0, -1);
            this.bucket.scale.x = 0.2;
            this.bucket.scale.y = 0.2;
            this.physics.arcade.enable(this.bucket);
            this.clothesGroup = game.add.physicsGroup();
            this.enemyGroup = game.add.physicsGroup();
            this.livesGroup = game.add.physicsGroup();
            this.enenyLivesGroup = game.add.physicsGroup();
            this.drawStumps(this.stumpsArray);
            this.raccoon = game.add.sprite(raccoonStartX, raccoonStartY + 3 * raccoonStepY, 'raccoon_side', 0);
            this.raccoon.state = 'right'
            this.physics.arcade.enable(this.raccoon);
                        
            this.raccoon.body.collideWorldBounds = true;
            this.raccoon.scale.x = 0.3;
            this.raccoon.scale.y = 0.3;
            this.raccoon.positionX = 0;
            this.raccoon.positionY = 3;
            this.raccoon.raccoonLives = 5;
            
            this.clothVelocity = 100;

            this.bullets = game.add.physicsGroup();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.bullets.createMultiple(1, 'wet_fiber');
            this.bullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetBullet, this);
            this.bullets.setAll('checkWorldBounds', true);

            this.is_washing = false;
            this.score = 0;
            var style = { font: "32px Arial", fill: "#ff0044", align: "center", };
            this.score_text = game.add.text(20, 20, "Score: "+this.score, style);
            this.drawLives();

            var initMessage = this.composeInitMessage();    
            if (this.sock !== undefined) {
                this.sock._send(initMessage);

                this.sock.onmessage = function (message) {
                    var data = JSON.parse(message.data);
                    if (data.type == 'init' && data.id !== id && this.enemy == undefined) {
                        console.log('start');
                        console.log(data);
                        this.enemy = game.add.sprite(enemyStartX, enemyStartY - 3 * enemyStepY + enemyStumpIndent[0], 'raccoon_front', 0);
                        this.physics.arcade.enable(this.enemy);
                        this.enemy.body.collideWorldBounds = true;
                        this.enemy.scale.x = 0.1;
                        this.enemy.scale.y = 0.1;
                        this.enemy.raccoonLive = data.lives;
                        this.enemy.id = data.id;
                        // Draw stumps
//                        var invertedStumps = [];
//                        for (i = data.stumps.length; i >= 0; i--) {
//                            if (invertedStumps[0] == undefined) {
//                                invertedStumps[0] = data.stumps[i];
//                            }
//                            else {
//                                invertedStumps.push(data.stumps[i]);
//                            }
//
//                        }
                        this.drawEnemyStumps(data.stumps);
                        this.drawEnemyLives();
                        this.sock.send(initMessage);
                    }
                    if (data.type == 'fiber' && data.id !== id && this.enemy !== undefined) {
                        console.log(data);
                        this.goEnemyFiber(data.line, data.velocity);
                    }
                    if (data.type == 'lives' && data.id !== id && this.enemy !== undefined) {
                        console.log(data);
                        this.enemy.raccoonLives = data.lives;
                        this.drawEnemyLives();
                    }
                    if (data.type == 'update' && data.id !== id && this.enemy !== undefined) {
                        console.log(id, data.id);
                        console.log('>>>>>>>', data.x, data.y);
                        this.enemy.positionX = data.x;
                        this.enemy.positionY = data.y;
                        this.enemy.state = data.state;
                        if (data.state == 'right') {
                            this.enemy.loadTexture('raccoon_side', 0);
                        }
                        else if (data.state == 'left') {
                            this.enemy.loadTexture('raccoon_side', 1);
                        }
                        else if (data.state == 'down') {
                            this.enemy.loadTexture('raccoon_front', 1);
                        }
                        else if (data.state == 'up') {
                            this.enemy.loadTexture('raccoon_front', 0);
                        }
                        this.enemy.scale.x = 0.1;
                        this.enemy.scale.y = 0.1;
                        console.log('update ', this.enemy);
                        console.log(data.x, data.y);

                        this.drawEnemy();
                    }

                }.bind(this);
            }


//            this.bot.animations.add('run');
//            this.bot.animations.play('run', 15, true);

//            this.input.onDown.addOnce(this.changeMummy, this);
            cursors = game.input.keyboard.createCursorKeys();

            this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
            cursors = game.input.keyboard.createCursorKeys();

        }
        ,

        update: function () {
            game.physics.arcade.collide(this.bucket, this.clothesGroup, this.collisionHandler, this.processHandlerBucket, this);
            game.physics.arcade.collide(this.ememy, this.clothesGroup, this.collisionHandler, this.processHandlerEnemyRaccoon, this);
            this.clothesGroup.forEach(function(cloth){
                if (cloth.body.x >= 1100 && !cloth.isEnemy){
                       cloth.kill();
                       this.clothesGroup.remove(cloth);    
                       this.raccoon.raccoonLives -= 1;
                       this.drawLives();
                    }    
            }.bind(this)); 
            if (Math.floor((Math.random() * 3000)) < 10 ){
                this.goFiber();
            }
            
            if (!this.is_washing) {
                game.physics.arcade.collide(this.raccoon, this.clothesGroup, this.collisionHandler, this.processHandlerRaccoon, this);
                if (cursors.left.isDown && this.isUp) {
                    if (this.raccoon.state != 'left') {
                        this.raccoon.state = 'left';
                        this.raccoon.loadTexture('raccoon_side', 1);
                    }
                    else {
                        this.raccoon.positionX -= this.canGoToDirection('left');
                    }
                    this.drawRaccoon();
                    this.isUp = false;
                    setTimeout(function () {
                        this.isUp = true;
                    }.bind(this), 200);
                    this.sendToWS(this.getPos(this.raccoon));

                }
                else if (cursors.right.isDown && this.isUp) {
                    if (this.raccoon.state != 'right') {
                        this.raccoon.loadTexture('raccoon_side', 0);
                        this.raccoon.state = 'right';
                    }
                    else {
                        this.raccoon.positionX += this.canGoToDirection('right');
                    }
                    this.drawRaccoon();
                    this.isUp = false;
                    setTimeout(function () {
                        this.isUp = true;
                    }.bind(this), 200);
                    this.sendToWS(this.getPos(this.raccoon));
                    //                this.raccoon.animations.play('run');
                }

                else if (cursors.up.isDown && this.isUp) {
                    if (this.raccoon.state != 'up') {
                        this.raccoon.loadTexture('raccoon_front', 1);
                        this.raccoon.state = 'up';
                    }
                    else {
                        this.raccoon.positionY -= this.canGoToDirection('up');
                    }
                    this.drawRaccoon();
                    this.isUp = false;
                    setTimeout(function () {
                        this.isUp = true;
                    }.bind(this), 200);
                    this.sendToWS(this.getPos(this.raccoon));
                }

                else if (cursors.down.isDown && this.isUp) {
                    if (this.raccoon.state != 'down') {
                        this.raccoon.loadTexture('raccoon_front', 0);
                        this.raccoon.state = 'down';
                    }
                    else {
                        this.raccoon.positionY += this.canGoToDirection('down');
                    }
                    this.drawRaccoon();
                    this.isUp = false;
                    setTimeout(function () {
                        this.isUp = true;
                    }.bind(this), 200);
                    this.sendToWS(this.getPos(this.raccoon));
                }
            }
//            else{
//                console.log('is washing');
//                console.log(this.raccoon.angle);
//                this.raccoon.anchor.setTo(0.5, 0.5); 
//                if (angle_inc == 3 && this.raccoon.angle == 30){
//                   angle_inc = -3
//                } else if (angle_inc == -3 && this.raccoon.angle == -30)
//             
//                this.raccoon.angle += angle_inc;
//            }    


            if (this.spaceKey.isDown) {
                this.throwClothes();
            }

        }
        ,

        arrageStumps: function () {
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
        }
        ,

        drawStumps: function (stumpsArray) {
            for (var i = 0; i < stumpsArray.length; i++) {
                for (var j = 0; j < 3; j++) {
                    if (stumpsArray[i][j] == 1) {
                        game.add.image(myRaccoonStumpStartX + i * (stumpSizeX + stumpSpaceX), myRaccoonStumpStartY + j * (stumpSizeY + stumpSpaceY) + stumpIndent[i], "stump");
                    }
                }
            }
        }
        ,

        drawEnemyStumps: function (stumpsArray) {
            for (var i = 0; i < stumpsArray.length; i++) {
                for (var j = 0; j < 3; j++) {
                    if (stumpsArray[i][j] == 1) {
                        var stump = this.enemyGroup.create(enemyStumpStartX + i * (enemyStumpSizeX + enemyStumpSpaceX), enemyStumpStartY - j * (enemyStumpSizeY + enemyStumpSpaceY) + enemyStumpIndent[i], "stump");
                        stump.scale.x = 0.5;
                        stump.scale.y = 0.5;
                    }
                }
            }
        }
        ,
        
        drawLives: function(){
          this.livesGroup.forEach(function(live){
              live.kill();
          });
          for(var i=1; i<=this.raccoon.raccoonLives; i++){
              var oneLive = this.livesGroup.create(550 - 50*i, 750, 'live');
              oneLive.scale.x = 0.3;
              oneLive.scale.y = 0.3;
          }
          this.sock.send(this.composeLives());
        },
        
       drawEnemyLives: function(){
          this.enenyLivesGroup.forEach(function(live){
              if (live.enemy == true){
                live.kill();
              }
          });
           console.log(this.enemy.raccoonLives);
          for(var i=1; i<=this.enemy.raccoonLives; i++){
              var oneLive = this.livesGroup.create(600 + 50*i, 750, 'live');
              oneLive.enemy = true;
              oneLive.tint = 0x000000;
              oneLive.scale.x = 0.3;
              oneLive.scale.y = 0.3;
          }  
        },


        canGoToDirection: function (direction) {
            switch (direction) {
                case 'up':
                    if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY - 1] == 1) {
                        return 1
                    }
                    else if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY - 2] == 1) {
                        return 2
                    }
                    else {
                        return 0
                    }
                    break;
                case 'down':
                    if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY + 1] == 1) {
                        return 1
                    }
                    else if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY + 2] == 1) {
                        return 2
                    }
                    else {
                        return 0
                    }
                    break;
                case 'right':
                    if (this.stumpsArray[this.raccoon.positionX + 1] && this.stumpsArray[this.raccoon.positionX + 1][this.raccoon.positionY] == 1) {
                        return 1
                    }
                    else if (this.stumpsArray[this.raccoon.positionX + 2] && this.stumpsArray[this.raccoon.positionX + 2][this.raccoon.positionY] == 1) {
                        return 2
                    }
                    else {
                        return 0
                    }
                    break;
                case 'left':
                    if (this.stumpsArray[this.raccoon.positionX - 1] && this.stumpsArray[this.raccoon.positionX - 1][this.raccoon.positionY] == 1) {
                        return 1
                    }
                    else if (this.stumpsArray[this.raccoon.positionX - 2] && this.stumpsArray[this.raccoon.positionX - 2][this.raccoon.positionY] == 1) {
                        return 2
                    }
                    else {
                        return 0
                    }
                    break;
            }

        }
        ,

        goFiber: function () {
            var line = Math.floor((Math.random() * 3));
            var clothType = Math.floor((Math.random() * 5) + 1)
            var cloth = this.clothesGroup.create(-73, 560 - (stumpSizeY + 25)*line, 'clothes', clothType);
            cloth.line = 2 - line;
            this.physics.arcade.enable(cloth);
            cloth.scale.x = 0.3;
            cloth.scale.y = 0.3;
            cloth.body.velocity.x = this.clothVelocity;
            this.sock._send(this.composeFiber(cloth.line, this.clothVelocity));
        },
        
        goEnemyFiber: function (line, velocity) {
            var clothType = Math.floor((Math.random() * 5) + 1)
            var cloth = this.clothesGroup.create(-50, 350 - (enemyStumpSizeY + 5)*line, 'clothes', clothType);
            cloth.line = 2 - line;
            this.physics.arcade.enable(cloth);
            cloth.scale.x = 0.2;
            cloth.scale.y = 0.2;
            cloth.body.velocity.x = velocity;
            cloth.isEnemy = true;
            console.log('fiber', cloth.line, cloth.body.velocity.x);
        },

        drawRaccoon: function () {
            var leftCorrect = this.raccoon.state == 'left' ? 70 : 0;
            var upCorrect = this.raccoon.state == 'up' || this.raccoon.state == 'down' ? 55 : 0;
            this.raccoon.body.x = raccoonStartX + this.raccoon.positionX * raccoonStepX + leftCorrect + upCorrect;
            this.raccoon.body.y = raccoonStartY + this.raccoon.positionY * raccoonStepY + stumpIndent[this.raccoon.positionX];
        }
        ,

        drawEnemy: function () {
            var leftCorrect = 0;
            if (this.enemy.state == 'right'){
                leftCorrect = -22;
            } else if (this.enemy.state == 'left'){
                leftCorrect = 22;
            }
            var upCorrect = this.enemy.state == 'up' || this.enemy.state == 'down' ? 18 : 0;

            this.enemy.body.x = enemyStartX + this.enemy.positionX * enemyStepX + leftCorrect + upCorrect;
            this.enemy.x = enemyStartX + this.enemy.positionX * enemyStepX + leftCorrect + upCorrect + enemyStumpIndent[this.enemy.positionX];
            
            this.enemy.body.y = enemyStartY - this.enemy.positionY * enemyStepY;
            this.enemy.y = enemyStartY - this.enemy.positionY * enemyStepY;
            this.enemy.scale.x = 0.1;
            this.enemy.scale.y = 0.1;
        }
        ,


        processHandlerRaccoon: function (raccoon, cloth) {
            if (this.raccoon.positionY == cloth.line && !cloth.isEnemy) {
                this.score++;
                this.score_text.text = "Score: "+this.score;
                this.clothVelocity += this.score % 3;
                cloth.line = 100;
                var splash = this.clothesGroup.create(cloth.body.x, cloth.body.y, 'splash');
                splash.scale.x = 1.2;
                splash.scale.y = 1.2;
                splash.animations.add('splash');
                splash.animations.play('splash', 15, false);
                splash.animations.currentAnim.onComplete.add(function () {
                    splash.kill();
                }, this);
                if (cloth.body.x > raccoon.body.x) {
                    this.raccoon.loadTexture('raccoon_side', 0);
                    this.raccoon.state = 'right';
                }
                else {
                    this.raccoon.loadTexture('raccoon_side', 1);
                    this.raccoon.state = 'left';
                }
                this.drawRaccoon();
                this.is_washing = true;
                var tween = game.add.tween(this.raccoon).to({angle: -30}, 50, 'Linear', true, 0, 5, true);
                tween.onComplete.add(function () { 
                        game.add.tween(this.raccoon).to({angle: 0}, 5, 'Linear', true, 0);
                }, this);
                setTimeout(function () {
                    this.is_washing = false;
                    game.add.tween(cloth).to({x: 10, y: 650}, 1000, 'Linear', true, 0);
                    splash.kill();
                }.bind(this), 300);

            }
            return false;

        },
        
        processHandlerEnemyRaccoon: function (raccoon, cloth) {
            console.log('bang');
            if (this.enemy.positionY == cloth.line && cloth.isEnemy)  {
                cloth.line = 100;
                var splash = this.clothesGroup.create(cloth.body.x, cloth.body.y, 'splash');
                splash.scale.x = 0.5;
                splash.scale.y = 0.5;
                splash.animations.add('splash');
                splash.animations.play('splash', 15, false);
                splash.animations.currentAnim.onComplete.add(function () {
                    splash.kill();
                }, this);
                if (cloth.body.x > raccoon.body.x) {
                    this.enemy.loadTexture('raccoon_side', 0);
                    this.enemy.state = 'right';
                }
                else {
                    this.enemy.loadTexture('raccoon_side', 1);
                    this.enemy.state = 'left';
                }
                this.drawEnemy();
                this.is_washing = true;
                var tween = game.add.tween(this.enemy).to({angle: -30}, 50, 'Linear', true, 0, 5, true);
                tween.onComplete.add(function () {
                        game.add.tween(this.enemy).to({angle: 0}, 5, 'Linear', true, 0);
                }, this);
                setTimeout(function () {
                    this.is_washing = false;
                    game.add.tween(cloth).to({x: 10, y: 650}, 1000, 'Linear', true, 0);
                    this.enemy.angle = 0;
                    splash.kill();
                }.bind(this), 300);

            }
            return false;

        }
        ,

        processHandlerBucket: function (bucket, cloth) {
            cloth.kill();

            var wet = game.add.sprite(40 + Math.floor((Math.random() * 25) + 1), 675 + Math.floor((Math.random() * 10) + 1), 'wet_fiber');
            wet.scale.x = 0.2;
            wet.scale.y = 0.2;
            return false;

        },

        collisionHandler: function (raccoon, cloth) {

        },

        getPos: function (object) {
            var pos = JSON.stringify({
                _id: _id,
                id: id,
                type: 'update',
                x: object.positionX,
                y: object.positionY,
                state: this.raccoon.state
            });
            return pos;
        },

        sendToWS: function (pos) {
            if (this.sock !== undefined) {
                this.sock._send(pos);
            }
        },

        composeInitMessage: function () {
            var initMessage = JSON.stringify({
                id: id,
                type: 'init',
                stumps: this.stumpsArray,
                lives: this.raccoon.raccoonLives
            });
            return initMessage;
        },
        
        composeFiber: function (line, velocity) {
            var fiberMessage = JSON.stringify({
                id: id,
                type: 'fiber',
                line: line,
                velocity: velocity,
            });
            return fiberMessage;
        },
        
        composeLives: function () {
            var livesMessage = JSON.stringify({
                id: id,
                type: 'lives',
                lives: this.raccoon.raccoonLives
            });
            return livesMessage;
        },

        throwClothes: function () {
            if (game.time.now > bulletTime) {
                var bullet = this.bullets.getFirstExists(false);

                if (bullet) {
                    var leftCorrect = this.raccoon.state == 'right' ? 80 : 0;
                    var upCorrect = this.raccoon.state == 'up' || this.raccoon.state == 'down' ? 55 : 0;
                    bullet.scale.x = 0.4;
                    bullet.scale.y = 0.4;
                    bullet.reset(this.raccoon.body.x + leftCorrect + upCorrect, this.raccoon.body.y);
                    bullet.body.velocity.y = 0;
                    bulletTime = game.time.now + 80;
                    bullet.anchor.setTo(0.5, 0.5);
                    game.add.tween(bullet).to({angle: 360}, 200 + (this.raccoon.positionY * 400), Phaser.Easing.Cubic.In, true);
                    game.add.tween(bullet.scale).to({
                        x: 0.1,
                        y: 0.1
                    }, 200 + (this.raccoon.positionY * 400), Phaser.Easing.Linear.None, true);
                    var tween = game.add.tween(bullet).to({y: 255}, 2000 - (this.raccoon.positionY * 400), Phaser.Easing.Linear.None, true);
                    tween.onStart.add(function () {
                        tween.delay(0);
                    }, this);
                    tween.onComplete.add(function () {
                        this.resetBullet(bullet);
                    }, this);
                }
            }
        },

        resetBullet: function (bullet) {
            bullet.kill();
        },
        

//function render() {
//
//    game.debug.body(bot);
//
//}

    }
    ;
    game.state.add("PlayGame", playGame);
    game.state.start("PlayGame");
};
