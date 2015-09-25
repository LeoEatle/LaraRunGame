var game = new Phaser.Game(320,505,Phaser.AUTO,'game'); //实例化game
game.States = {}; //存放state对象

game.States.boot = function(){
	this.preload = function(){
		if(!game.device.desktop){//移动设备适应
			this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
			this.scale.forcePortrait = true;
			this.scale.refresh();
		}
		game.load.image('loading','assets/preloader.gif');
	};
	this.create = function(){
		game.state.start('preload'); //跳转到资源加载页面
	};
}

game.States.preload = function(){
	this.preload = function(){
		var preloadSprite = game.add.sprite(35,game.height/2,'loading'); //创建显示loading进度的sprite
		game.load.setPreloadSprite(preloadSprite);
		//以下为要加载的资源
    	game.load.image('background', 'assets/lara/lara_run_background.png');//背景
    	game.load.image('ground', 'assets/lara/lara_run_ground.png')//地板
    	game.load.image('title', 'assets/lara/lara_run_title.png');//标题
    	game.load.image('btn_play', 'assets/lara/PLAY.png');//PLAY button
    	game.load.spritesheet("lara_title", 'assets/lara/lara_for_title.png', 89, 142, 2);//标题鬼畜lara
    	game.load.image('mod1', 'assets/lara/lara_run_mod2.png');//mod1
    	game.load.image('mod2', 'assets/lara/lara_run_mod3.png');//mod2
    	game.load.image('lara_jump', 'assets/lara/lara_run_mod_jump.png');//jump图像
    	game.load.image('triangle', 'assets/lara/triangle.png');//障碍
    	game.load.spritesheet('lara_run', 'assets/lara/Lara_run.png',90,143,3);//run图像
    	game.load.image('ready', 'assets/lara/lara_run_ready.png');//ready图像
    	game.load.image('game_over', 'assets/lara/gameover.png');//gameover图像
	}
	this.create = function(){
		game.state.start('menu');
	}
}

game.States.menu = function(){
	this.create = function(){
		game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(-10,0); //背景图
		game.add.tileSprite(0,game.height-112,game.width,112,'ground');//地板
		var titleGroup = game.add.group(); //创建存放标题的组
		titleGroup.create(0,0,'title'); //标题

		
		var lara = game.add.sprite(0, 250, 'lara_title');//添加laraguichu
		lara.animations.add('guichu');//鬼畜起来
		lara.animations.play('guichu', 5, true);//这里5是指频率 true指循环
		
		
		titleGroup.x = 135;
		titleGroup.y = 25;
		game.add.tween(titleGroup).to({ x:80 },500,null,true,0,Number.MAX_VALUE,true); //标题的缓动动画
		var btn = game.add.button(200,280,'btn_play',function(){//开始按钮
			game.state.start('play');
		});
		btn.anchor.setTo(0.5,0.5);//设置中心点/锚点
	}
}

game.States.play = function(){
	this.create = function(){
		this.bg = game.add.tileSprite(0,0,game.width,game.height,'background');//背景图
		this.pipeGroup = game.add.group();
		this.pipeGroup.enableBody = true;
		this.blockGroup = game.add.group();
		this.blockGroup.enableBody = true;

		this.ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground'); //地板
		this.lara = game.add.sprite(55,300,'lara_run'); //lara
		this.lara.animations.add('run',[0,1]);
		this.lara.animations.play('run',5,true);
		this.lara.anchor.setTo(0.5, 0.5);
		game.physics.enable(this.lara,Phaser.Physics.ARCADE); //开启lara的物理系统
		this.lara.body.gravity.y = 0; //lara的重力
		game.physics.enable(this.ground,Phaser.Physics.ARCADE);//地面
		this.ground.body.immovable = true; //固定不动
		var score = 0;
		var scoreText;
		this.scoreText = game.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#ffff'});

		this.readyText = game.add.image(150, 0, 'ready'); //get ready 文字
		this.readyText.anchor.setTo(0.5, 0);
		this.hasStarted = false; //游戏是否已开始
		game.time.events.loop(1800, this.generateBlocks, this);//循环产生blocks
		game.time.events.stop(false);
		
		game.input.onDown.addOnce(this.statrGame, this);
	};
	this.update = function(){
		if(!this.hasStarted) return; //游戏未开始
		game.physics.arcade.collide(this.lara, this.ground, this.hitGround,null, this);//与地板碰撞
		game.physics.arcade.overlap(this.lara, this.blockGroup, this.hitBlock, null, this); //与三角碰撞
	}

	this.statrGame = function(){
		this.gameSpeed = 200; //游戏速度
		this.gameIsOver = false;
		this.hasHitBlock = false;
		this.hasHitGround = false;
		this.hasStarted = true;
		this.score = 0;
		this.bg.autoScroll(-(this.gameSpeed/10),0);
		this.ground.autoScroll(-this.gameSpeed,0);
		this.lara.body.gravity.y = 1050; //lara的重力


		this.readyText.destroy();
		game.input.onDown.add(this.jump, this);
		game.time.events.start();
	}

	this.stopGame = function(){
		this.bg.stopScroll();
		this.ground.stopScroll();
		this.blockGroup.forEachExists(function(block){
			block.body.velocity.x = 0;
		}, this);
		this.lara.animations.stop('run', 0);
		game.input.onDown.remove(this.jump,this);
		game.time.events.stop(true);
	}

	
	this.jump = function(){
		if(this.lara.body.y < 250)//当lara跳起来时，她不能继续飞
		return;
		this.lara.body.velocity.y = -600;
		this.lara.animations.stop('run', 2);
		this.lara.frame = 2;
	}

	this.hitBlock = function(){
		this.gameOver();
	}
	this.hitGround = function(){
		this.lara.animations.play('run', 5, true);
	}
	this.gameOver = function(){
		this.gameIsOver = true;
		this.stopGame();
		this.showGameOverText();
	};

	this.showGameOverText = function(){
		this.scoreText.destroy();
		game.bestScore = game.bestScore || 0;
		if(this.score > game.bestScore) game.bestScore = this.score; //最好分数
		this.gameOverGroup = game.add.group(); //添加一个组
		var gameOverText = this.gameOverGroup.create(game.width/2,0,'game_over'); //game over 文字图片
		var currentScoreText = game.add.text(200, 85, this.score + '', {fontSize: '32px', fill: '#ffff'},this.gameOverGroup); //当前分数,听说加个''就变成string了？
		var bestScoreText = game.add.text(200, 155, game.bestScore + '', {fontSize: '32px', fill: '#ffff'}, this.gameOverGroup); //最好分数
		var replayBtn = game.add.button(game.width/2, 210, 'btn_play', function(){//重玩按钮
			game.state.start('play');
		}, this, null, null, null, null, this.gameOverGroup);
		gameOverText.anchor.setTo(0.5, 0);
		replayBtn.anchor.setTo(0.5, 0);
		this.gameOverGroup.y = 30;
	}
	

	
	this.generateBlocks = function(){
		this.score  = this.score + 100;//分数更新在这里
		this.scoreText.text = 'Score: ' + this.score;
		if(Math.random() > 0.4 )
		var block = game.add.sprite(game.width, game.height - 169, 'triangle', 0 ,this.blockGroup);
		this.blockGroup.setAll('checkWorldBounds',true);
		this.blockGroup.setAll('outOfBoundsKill',true);
		this.blockGroup.setAll('body.velocity.x', -this.gameSpeed);
		
	}
	

}

//添加state到游戏
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('menu',game.States.menu);
game.state.add('play',game.States.play);
game.state.start('boot'); //启动游戏

