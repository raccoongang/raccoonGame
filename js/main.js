window.onload = function () {
    "use strict";
    
    var id = Math.random(),
       
        game = new Phaser.Game(1200, 800, Phaser.CANVAS, 'game-container'),
        cursors,
        playGame = function (game) {},

        stumpSizeX = 102,
        stumpSizeY = 52,
        stumpSpaceX = 14,
        stumpSpaceY = 25,
        myRaccoonStumpStartX = 150,
        myRaccoonStumpStartY = 440,

        bulletTime = 0,

        raccoonSizeX = 756,
        raccoonSizeY = 516,
        
        enemyStumpSizeX = 51,
        enemyStumpSizeY = 26,
        enemyStumpSpaceX = 36,
        enemyStumpSpaceY = 22,
        enemyStumpStartX = 260,
        enemyStumpStartY = 390,
        
        raccoonScale = 0.3,
        raccoonStartX = myRaccoonStumpStartX + stumpSizeX / 2 - (raccoonSizeX * raccoonScale) / 2,
        raccoonStartY = myRaccoonStumpStartY + stumpSizeY / 2 - raccoonSizeY * raccoonScale,
        raccoonStepX = stumpSpaceX + stumpSizeX,
        raccoonStepY = stumpSizeY + stumpSpaceY,

        enemyScale = 0.1,
        enemyStartX = enemyStumpStartX + enemyStumpSizeX / 2 - (raccoonSizeX * enemyScale) / 2,
        enemyStartY = enemyStumpStartY + enemyStumpSizeY / 2 - raccoonSizeY * enemyScale,
        enemyStepX = enemyStumpSpaceX + enemyStumpSizeX,
        enemyStepY = enemyStumpSpaceY + enemyStumpSizeY,

        stumpIndent = [0, 8, 16, 24, 24, 16, 8, 0],
        fireIndent = [285, 372, 459, 546, 633, 720, 807, 894],
        enemyStumpIndent = [0, -8, -16, -24, -24, -16, -8, 0],

        _id = localStorage.getItem('_id');
    //if (_id == null) {
    //    _id = localStorage.setItem('_id', new String(IP + new Date()).hashCode());
    //}

    var hit;
    var wash;

    playGame.prototype = {

        preload: function () {
            game.load.spritesheet('landscape', './assets/landscape.jpg');
            game.load.spritesheet('raccoon', './assets/raccoon.png', raccoonSizeX, raccoonSizeY);
            game.load.spritesheet('explosion', './assets/explosion.png');
            game.load.spritesheet('clothes', './assets/clothes.png', 226, 212);
            game.load.spritesheet('stump', './assets/stump.png');
            game.load.spritesheet('splash', './assets/splash_Sprites.png', 64, 64);
            game.load.spritesheet('bucket', './assets/bucket.png');
            game.load.spritesheet('wet_fiber', './assets/wet_fiber.png');
            game.load.spritesheet('waves', './assets/waves.png');
            game.load.spritesheet('live', './assets/live_logo.png');
            game.load.spritesheet('clouds', './assets/clouds.png');
            game.load.spritesheet('sign', './assets/sign.png');

            game.load.audio('hit', './assets/audio/hit.mp3');
            game.load.audio('wash', './assets/audio/wash.mp3');

            game.sound.setDecodedCallback([ hit, wash ], game.start, this);
            
            try {
                this.sock = new WebSocket("wss://rtc-game.raccoongang.com/ws");
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

                this.sock._send = function (message, callback) {
                    self.waitForConnection(function () {
                        self.sock.send(message);
                        if (typeof callback !== 'undefined') {
                            callback();
                        }
                    }, 1000);
                };
            } catch (err) {
                console.log("Якась ... з вашими сокетами.");
                this.sock = undefined;
            }
            this.isUp = true;
        },

        create: function () {
            this.stumpsArray = this.arrageStumps();
            game.world.bounds = new Phaser.Rectangle(50, 50, 1100, 700);
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.physics.setBoundsToWorld();


            this.landscape = game.add.sprite(0, 0, 'landscape');
            this.clouds = game.add.sprite(-900, 0, 'clouds');
            this.waves = game.add.sprite(-1500, 330, 'waves');
            this.bucket = game.add.sprite(10, 650, 'bucket');

            game.add.tween(this.waves).to({x: 1000}, 100000, 'Linear', true, 0, -1);
            game.add.tween(this.clouds).to({x: 1000}, 100000, 'Linear', true, 0, -1);
            
            this.tap = false;

            hit = game.add.audio('hit');
            wash = game.add.audio('wash');

            game.input.onTap.add(function() {
              this.tap = true;
            }.bind(this));
            
            this.clouds.scale.setTo(0.8, 0.8);
            this.bucket.scale.setTo(0.2, 0.2);
            this.physics.arcade.enable(this.bucket);
            this.clothesGroup = game.add.physicsGroup();
            this.enemyGroup = game.add.physicsGroup();
            this.livesGroup = game.add.physicsGroup();
            this.enemyLivesGroup = game.add.physicsGroup();
            this.BucketGroup = game.add.physicsGroup();
            this.EnemyBucketGroup = game.add.physicsGroup();
            this.drawStumps(this.stumpsArray);
            this.raccoon = game.add.sprite(raccoonStartX, raccoonStartY + 3 * raccoonStepY, 'raccoon', 1);
            this.raccoon.state = 'right';
            this.physics.arcade.enable(this.raccoon);

            this.bullets = game.add.physicsGroup();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.bullets.createMultiple(1, 'wet_fiber');
            this.bullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetBullet, this);
            this.bullets.setAll('checkWorldBounds', true);
                        
            this.raccoon.body.collideWorldBounds = true;
            this.raccoon.body.setSize(310, 516, 71, 0);
            this.raccoon.scale.setTo(raccoonScale, raccoonScale);
            this.raccoon.positionX = 0;
            this.raccoon.positionY = 3;
            this.raccoon.raccoonLives = 5;

            this.clothVelocity = 100;

            this.is_washing = false;
            this.score = 0;
            this.clothes_bullet = 0;
            var style = { font: "32px Arial", fill: "#ffffff", align: "center"};
            this.score_text = game.add.text(game.world.width - 80, game.world.height + 45, "Score: " + this.score, style);
            this.clothes_bullet_text = game.add.text(this.bucket.x, this.bucket.y + 100, "Wet clothes: " + this.clothes_bullet, style)
            this.drawLives();
            this.sign = game.add.sprite(310, 655, 'sign', 0);
            this.sign.scale.setTo(0.5, 0.5);

            var initMessage = this.composeInitMessage();
            if (this.sock !== undefined) {
                this.sock._send(initMessage);

                this.sock.onmessage = function (message) {
                    var data = JSON.parse(message.data);
                    if (data.type === 'init' && data.id !== id && this.enemy === undefined) {
                        console.log('<<<<<<>>>>>>>>>start');
                        console.log(data);
                        this.enemy = game.add.sprite(enemyStartX, enemyStartY - 3 * enemyStepY + enemyStumpIndent[0], 'raccoon', 3);
                        this.enemyBucket = game.add.sprite(1100, 210, 'bucket', 0);
                        this.physics.arcade.enable(this.enemy);
                        this.physics.arcade.enable(this.enemyBucket);
                        this.enemy.body.collideWorldBounds = true;
                        this.enemy.body.setSize(310, 516, 71, 0);
                        this.enemy.scale.setTo(enemyScale, enemyScale);
                        this.enemyBucket.scale.setTo(0.1, 0.1);
                        this.enemy.raccoonLive = data.lives;
                        this.enemy.id = data.id;
                        // Draw stumps
//                        var invertedStumps = [];
//                        for (i = data.stumps.length; i >= 0; i--) {
//                            if (invertedStumps[0] === undefined) {
//                                invertedStumps[0] = data.stumps[i];
//                            }
//                            else {
//                                invertedStumps.push(data.stumps[i]);
//                            }
//
//                        }
                        this.drawEnemyStumps(data.stumps);
                        this.drawEnemyLives();
                        this.sock._send(initMessage);
                    }
                    if (data.type === 'fiber' && data.id !== id && this.enemy !== undefined && data.id === this.enemy.id) {
                        console.log(data);
                        this.goEnemyFiber(data.line, data.velocity);
                    }
                    if (data.type === 'lives' && data.id !== id && this.enemy !== undefined && data.id === this.enemy.id) {
                        console.log(data);
                        this.enemy.raccoonLives = data.lives;
                        this.drawEnemyLives();
                    }
                    if (data.type === 'enemy_fire' && data.id !== id && this.enemy !== undefined && data.id === this.enemy.id) {

                        hit.play();
                        var explosion = game.add.sprite(game.world.width/2, game.world.height/2, 'wet_fiber');
                        explosion.scale.setTo(7, 7);
                        explosion.anchor.setTo(0.5, 0.5);

                        var tween = game.add.tween(explosion.scale).to(
                            {y: 1, x: 1},
                            500,
                            Phaser.Easing.Linear.None,
                            true
                        );

                        tween.onStart.add(function () {
                            tween.delay(0);
                        }, this);
                        tween.onComplete.add(function () {
                            explosion.kill();
                        }, this);
                        console.log(data);
                    }
                    if ( data.type === "enemy_throw" && data.id !== id && this.enemy !== undefined && data.id === this.enemy.id) {
                        if ( this.EnemyBucketGroup.children.length > 0) {
                            this.EnemyBucketGroup.children[0].destroy();
                        }
                    }
                    if (data.type === 'update' && data.id !== id && this.enemy !== undefined && data.id === this.enemy.id) {
                        console.log(id, data.id);
                        console.log('>>>>>>>', data.x, data.y);
                        this.enemy.positionX = data.x;
                        this.enemy.positionY = data.y;
                        this.enemy.state = data.state;
                        if (data.state === 'right') {
                            this.enemy.loadTexture('raccoon', 1);
                        } else if (data.state === 'left') {
                            this.enemy.loadTexture('raccoon', 0);
                        } else if (data.state === 'down') {
                            this.enemy.loadTexture('raccoon', 2);
                        } else if (data.state === 'up') {
                            this.enemy.loadTexture('raccoon', 3);
                        }
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
            var direction, difX, difY;
            game.physics.arcade.collide(this.bucket, this.clothesGroup, this.collisionHandler, this.processHandlerBucket, this);
            game.physics.arcade.collide(this.enemyBucket, this.clothesGroup, this.collisionHandler, this.processHandlerEnemyBucket, this);
            game.physics.arcade.collide(this.enemy, this.clothesGroup, this.collisionHandler, this.processHandlerEnemyRaccoon, this);
            game.physics.arcade.collide(this.bullets, this.enemy, this.collisionHandler, this.fireCollision, this);
            this.clothesGroup.forEach(function(cloth)
                {
                    if (cloth.body.x >= 1100 && !cloth.isEnemy) {
                        cloth.kill();
                        this.clothesGroup.remove(cloth);
                        this.raccoon.raccoonLives -= 1;
                        this.drawLives();
                        if (this.raccoon.raccoonLives === 0) {
                            this.create();
                        }
                    }
                }.bind(this)); 
            if (Math.floor((Math.random() * 3000)) < 10) {
                this.goFiber();
            }
            
            if (!this.is_washing) {
                 if (this.tap) {
                     difX = game.input.x - (this.raccoon.x + (raccoonSizeX*raccoonScale)/2);
                     difY = game.input.y - (this.raccoon.y + (raccoonSizeY*raccoonScale)/2);
                     
                     if (Math.abs(difX) > this.raccoon.body.halfWidth || Math.abs(difY) > this.raccoon.body.halfHeight) {
                         if (Math.abs(difX) > Math.abs(difY)) {
                             if (difX > 0) { 
                                direction = 'right';
                             }
                             else {
                                 direction = 'left';
                             }
                         } else {
                             if (difY > 0) { 
                                direction = 'down';
                             }
                             else {
                                 direction = 'up';
                             }
                         }
                     }
                     else {
                         direction = 'space';
                     }
                     this.tap = false;
                 }
                
                game.physics.arcade.collide(this.raccoon, this.clothesGroup, this.collisionHandler, this.processHandlerRaccoon, this);
                if ((cursors.left.isDown  && this.isUp) || direction === 'left') {
                    if (this.raccoon.state !== 'left') {
                        this.raccoon.state = 'left';
                        this.raccoon.loadTexture('raccoon', 0);
                    } else {
                        this.raccoon.positionX -= this.canGoToDirection('left');
                    }
                    this.drawRaccoon();
                    this.isUp = false;
                    setTimeout(function () {
                        this.isUp = true;
                    }.bind(this), 200);
                    this.sendToWS(this.getPos(this.raccoon));

                } else if ((cursors.right.isDown && this.isUp) || direction === 'right') {
                    if (this.raccoon.state !== 'right') {
                        this.raccoon.loadTexture('raccoon', 1);
                        this.raccoon.state = 'right';
                    } else {
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

                else if ((cursors.up.isDown && this.isUp) || direction === 'up') {
                    if (this.raccoon.state != 'up') {
                        this.raccoon.loadTexture('raccoon', 3);
                        this.raccoon.state = 'up';
                    } else {
                        this.raccoon.positionY -= this.canGoToDirection('up');
                    }
                    this.drawRaccoon();
                    this.isUp = false;
                    setTimeout(function () {
                        this.isUp = true;
                    }.bind(this), 200);
                    this.sendToWS(this.getPos(this.raccoon));
                } else if ((cursors.down.isDown && this.isUp) || direction === 'down') {
                    if (this.raccoon.state !== 'down') {
                        this.raccoon.loadTexture('raccoon', 2);
                        this.raccoon.state = 'down';
                    } else {
                        this.raccoon.positionY += this.canGoToDirection('down');
                    }
                    this.drawRaccoon();
                    this.isUp = false;
                    setTimeout(function () {
                        this.isUp = true;
                    }.bind(this), 200);
                    this.sendToWS(this.getPos(this.raccoon));
                }
                else if ((this.spaceKey.isDown && this.isUp) || direction === 'space') {
                    this.throwClothes(false);
                    this.isUp = false;
                    setTimeout(function () {
                        this.isUp = true;
                    }.bind(this), 200);
                }
            }
        },

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
            ], i, j, temp;
            for (i = 0; i < stumpsArray.length; i++) {
                j = Math.floor(Math.random() * (i + 1));
                temp = stumpsArray[i];
                stumpsArray[i] = stumpsArray[j];
                stumpsArray[j] = temp;
            }
            return stumpsArray;
        },

        drawStumps: function (stumpsArray) {
            var i, j;
            for (i = 0; i < stumpsArray.length; i++) {
                for (j = 0; j < 3; j++) {
                    if (stumpsArray[i][j] === 1) {
                        game.add.image(myRaccoonStumpStartX + i * (stumpSizeX + stumpSpaceX), myRaccoonStumpStartY + j * (stumpSizeY + stumpSpaceY) + stumpIndent[i], "stump");
                    }
                }
            }
        },

        drawEnemyStumps: function (stumpsArray) {
            var i, j, stump;
            for (i = 0; i < stumpsArray.length; i++) {
                for (j = 0; j < 3; j++) {
                    if (stumpsArray[i][j] === 1) {
                        stump = this.enemyGroup.create(enemyStumpStartX + i * (enemyStumpSizeX + enemyStumpSpaceX), enemyStumpStartY - j * (enemyStumpSizeY + enemyStumpSpaceY) + enemyStumpIndent[i], "stump");
                        stump.scale.setTo(0.5, 0.5);
                    }
                }
            }
        },
        
        drawLives: function () {
            var i, oneLive;
            this.livesGroup.forEach(function (live) {
                live.kill();
                this.livesGroup.remove(live);
            }.bind(this));
            for (i = 1; i <= this.raccoon.raccoonLives; i++){
                oneLive = this.livesGroup.create(550 - 50 * i, 750, 'live');
                oneLive.scale.setTo(0.3, 0.3);
            }
            this.sock._send(this.composeLives());
        },
        
        drawEnemyLives: function () {
            var i, oneLive;
            this.enemyLivesGroup.forEach(function (live) {
                if (live.enemy == true){
                    live.kill();
                    this.enemyLivesGroup.remove(live);
                }
           }.bind(this));
           console.log(this.enemy.raccoonLives);
          for (i = 1; i <= this.enemy.raccoonLives; i++) {
                oneLive = this.livesGroup.create(600 + 50*i, 750, 'live');
                oneLive.enemy = true;
                oneLive.tint = 0x000000;
                oneLive.scale.setTo(0.3, 0.3);
            }
        },

        canGoToDirection: function (direction) {
            switch (direction) {
                case 'up':
                if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY - 1] == 1) {
                    return 1;
                }
                    else if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY - 2] == 1) {
                        return 2;
                }
                    else {
                        return 0;
                    }
                    break;
                case 'down':
                    if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY + 1] == 1) {
                        return 1;
                    }
                    else if (this.stumpsArray[this.raccoon.positionX][this.raccoon.positionY + 2] == 1) {
                        return 2;
                    }
                    else {
                        return 0;
                    }
                    break;
                case 'right':
                    if (this.stumpsArray[this.raccoon.positionX + 1] && this.stumpsArray[this.raccoon.positionX + 1][this.raccoon.positionY] == 1) {
                        return 1;
                    }
                    else if (this.stumpsArray[this.raccoon.positionX + 2] && this.stumpsArray[this.raccoon.positionX + 2][this.raccoon.positionY] == 1) {
                        return 2;
                    }
                    else {
                        return 0;
                    }
                    break;
                case 'left':
                    if (this.stumpsArray[this.raccoon.positionX - 1] && this.stumpsArray[this.raccoon.positionX - 1][this.raccoon.positionY] == 1) {
                        return 1;
                    }
                    else if (this.stumpsArray[this.raccoon.positionX - 2] && this.stumpsArray[this.raccoon.positionX - 2][this.raccoon.positionY] == 1) {
                        return 2;
                    }
                    else {
                        return 0;
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
            cloth.scale.setTo(0.3, 0.3);
            cloth.body.velocity.x = this.clothVelocity;
            this.sock._send(this.composeFiber(cloth.line, this.clothVelocity));
        },
        
        goEnemyFiber: function (line, velocity) {
            var clothType = Math.floor((Math.random() * 5) + 1)
            var cloth = this.clothesGroup.create(-50, 350 - (enemyStumpSizeY + 5)*line, 'clothes', clothType);
            cloth.line = 2 - line;
            this.physics.arcade.enable(cloth);
            cloth.scale.setTo(0.2, 0.2);
            cloth.body.velocity.x = velocity;
            cloth.isEnemy = true;
            console.log('fiber', cloth.line, cloth.body.velocity.x);
        },

        drawRaccoon: function () {
            this.raccoon.x = raccoonStartX + this.raccoon.positionX * raccoonStepX;
            this.raccoon.y = raccoonStartY + this.raccoon.positionY * raccoonStepY + stumpIndent[this.raccoon.positionX];
        },

        drawEnemy: function () {
            this.enemy.x = enemyStartX + this.enemy.positionX * enemyStepX;
            this.enemy.y = enemyStartY - this.enemy.positionY * enemyStepY + enemyStumpIndent[this.enemy.positionX];
        },

        processHandlerRaccoon: function (raccoon, cloth) {
            if (this.raccoon.positionY == cloth.line && !cloth.isEnemy) {
                this.score += 3;
                this.clothes_bullet++;
                this.clothes_bullet_text.text = "Wet clothes: " + this.clothes_bullet
                this.score_text.text = "Score: " + this.score;
                this.clothVelocity += this.score % 3;
                cloth.line = 100;
                var splash = this.clothesGroup.create(cloth.body.x, cloth.body.y, 'splash');
                splash.scale.setTo(1.2, 1.2);
                splash.animations.add('splash');
                splash.animations.play('splash', 15, false);
                splash.animations.currentAnim.onComplete.add(function () {
                    splash.kill();
                }, this);
                if (cloth.body.x > raccoon.body.x) {
                    this.raccoon.loadTexture('raccoon', 1);
                    this.raccoon.state = 'right';
                }
                else {
                    this.raccoon.loadTexture('raccoon', 0);
                    this.raccoon.state = 'left';
                }
                this.drawRaccoon();
                wash.play();
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
            if (((this.enemy.positionY == cloth.line) || 
                (this.enemy.positionY == 0 &&  cloth.line == 2) ||
                (this.enemy.positionY == 2 &&  cloth.line == 0)) && cloth.isEnemy)  {
                cloth.line = 100;
                var splash = this.clothesGroup.create(cloth.body.x, cloth.body.y, 'splash');
                splash.scale.setTo(0.5, 0.5)
                splash.animations.add('splash');
                splash.animations.play('splash', 15, false);
                splash.animations.currentAnim.onComplete.add(function () {
                    splash.kill();
                }, this);
                if (cloth.body.x > raccoon.body.x) {
                    this.enemy.loadTexture('raccoon', 1);
                    this.enemy.state = 'right';
                }
                else {
                    this.enemy.loadTexture('raccoon', 0);
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
                    game.add.tween(cloth).to({x: 1100,y: 210}, 1000, 'Linear', true, 0);
                    this.enemy.angle = 0;
                    splash.kill();
                }.bind(this), 300);

            }
            return false;

        },

        processHandlerBucket: function (bucket, cloth) {
            cloth.kill();

            var wet = game.add.sprite(40 + Math.floor((Math.random() * 25) + 1), 675 + Math.floor((Math.random() * 10) + 1), 'wet_fiber');
            wet.scale.setTo(0.2, 0.2);

            this.BucketGroup.add(wet);

            return false;

        },
        processHandlerEnemyBucket: function (bucket, cloth) {
            cloth.kill();

            var wet = game.add.sprite(1110 + Math.floor((Math.random() * 15) + 1), 220 + Math.floor((Math.random() * 5) + 1), 'wet_fiber');
            wet.scale.setTo(0.1, 0.1);

            this.EnemyBucketGroup.add(wet);

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

        composeFire: function () {
            var fireMessage = JSON.stringify({
                id: id,
                type: 'enemy_fire'
            });
            return fireMessage;
        },

        composeThrow: function () {
            var throwMessage = JSON.stringify({
                id: id,
                type: 'enemy_throw'
            });
            return throwMessage;
        },

        throwClothes: function (enemy_fire) {
            console.log("throw clothes");

            if ( this.BucketGroup.children.length > 0) {
                this.BucketGroup.children[0].destroy();
            }

            if (this.clothes_bullet > 0){
                this.clothes_bullet -= 1;
                this.sendToWS(this.throwClothes());
                this.clothes_bullet_text.text = "Wet clothes: " + this.clothes_bullet;
                if (game.time.now > bulletTime) {
                    this.raccoon.state = 'up';
                    this.raccoon.loadTexture('raccoon', 3);
                    var bullet = this.bullets.getFirstExists(false);
                    var bullet_velocity = 600;

                    if (bullet) {
                        bullet.scale.setTo(0.4, 0.4);
                        bullet.reset(this.raccoon.x + (raccoonSizeX*raccoonScale)/2, this.raccoon.body.y);
                        bullet.body.velocity.y = 0;
                        bullet.anchor.setTo(0.5, 0.5);
                        game.add.tween(bullet).to(
                            {angle: 360},
                            bullet_velocity + (this.raccoon.positionY * (bullet_velocity / this.raccoon.positionY ? this.raccoon.positionY : 1)),
                            Phaser.Easing.Cubic.In,
                            true
                        );
                        game.add.tween(bullet.scale).to(
                            {x: 0.1, y: 0.1},
                            bullet_velocity + (this.raccoon.positionY * ((bullet_velocity * 2) / this.raccoon.positionY ? this.raccoon.positionY : 1)),
                            Phaser.Easing.Linear.None,
                            true
                        );
                        var tween = game.add.tween(bullet).to(
                            {y: 235, x: enemyStartX + this.raccoon.positionX * enemyStepX + (raccoonSizeX*enemyScale)/2 - 20},
                            bullet_velocity + (this.raccoon.positionY * (bullet_velocity / this.raccoon.positionY ? this.raccoon.positionY : 1)),
                            Phaser.Easing.Linear.None,
                            true
                        );
                        tween.onStart.add(function () {
                            tween.delay(0);
                        }, this);
                        tween.onComplete.add(function () {
                            this.resetBullet(bullet);
                        }, this);
                    }
                }
            }
        },

        resetBullet: function (bullet) {
            bullet.kill();
        },

        fireCollision: function(){
            console.log("fire callback");
            hit.play();
            this.enemy.state = 'up';
            this.enemy.loadTexture('raccoon', 2);
            var explosion = game.add.sprite(this.enemy.x, this.enemy.y, 'wet_fiber');
            explosion.scale.setTo(0.01, 0.01);
            explosion.anchor.setTo(-1, -1);
            explosion.width = 10
            explosion.height = 10

            var tween = game.add.tween(explosion.scale).to(
                {y: 0.1, x: 0.1},
                500,
                Phaser.Easing.Linear.None,
                true
            );

            tween.onStart.add(function () {
                tween.delay(0);
            }, this);
            tween.onComplete.add(function () {
                explosion.kill();
                this.sendToWS(this.composeFire());
            }, this);

            return false;
        },
        

    render: function() {

        // game.debug.bodyInfo(this.raccoon, 32, 32);

        // game.debug.body(this.raccoon);
        // game.debug.body(this.enemy);

    }

    }
    ;
    game.state.add("PlayGame", playGame);
    game.state.start("PlayGame");
};
