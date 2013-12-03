var Invaders = function()
{
    var ALIEN_ROWS_0 = [2, 4, 4, 0, 0];
    var ALIEN_ROWS_1 = [3, 5, 5, 1, 1];

    var ALIEN_ROWS_POINTS = [20, 10, 10, 5, 5];

    var BARRIER_INDEXES = [[0, 4, 4, 4, 1], [4, 4, 4, 4, 4], [4, 3, -1, 2, 4]];

    var BOTTOM_HEIGHT = 30;
    var TOP_HEIGHT = 30;

    var HEIGHT = 400 + BOTTOM_HEIGHT + TOP_HEIGHT;
    var LEFT = -1;
    var RIGHT = 1;
    var STILL = 0;
    var WIDTH = 400;

    var ALIEN = 0;
    var BULLET = 1;
    var BARRIER = 2;
    var SAUCER = 3;
    var TANK = 4;

	var self = this;

	var Rect = function(x, y, width, height)
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		
		this.intersect = function(rect)
		{
			var ret = false;
			
			if (rect != null) ret = !(this.x > rect.x + rect.width ||  this.x + this.width < rect.x ||  this.y > rect.y + rect.height || this.y + this.width < rect.y);
			
			return ret;
		};
		
		this.toString = function()
		{
			return this.x + ", " + this.width + ", " + this.y + ", " + this.y;
		};
	};

	this.alienCycle = 0;
	this.alienDirection = RIGHT;
	this.alienDrop = false;
	this.alienRows = ALIEN_ROWS_0;
	this.aliens = [];
    this.aliensBoxes = [];
    this.aliensPointValues = [];

	this.barriers = [];
	this.barriersBoxes = [];
	this.barriersParts = [];
	this.barriersStates = [];
	this.barrierTextures = [];

	this.bullet = null;
	this.bulletBox = null;
	this.bulletFiring = false;
	this.bulletStep = 3;

	this.frames = 0;

	this.nextFrame = 25;
	
    this.playerRemainingLives = 3;
    this.playerScore = 0;
    this.playerScoreText;
    this.playerLivesText = null;
	// create a renderer instance.
	this.renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);

	this.saucer = null;
	this.saucerBox = null;

    
	this.spriteContainer = new PIXI.DisplayObjectContainer();

	this.stage = new PIXI.Stage(0x000000, true);

	this.tank = null;
	this.tankBox = null;
	this.tankDirection = STILL;
	this.tankLives = 3;

	this.textures = [];

	this.time = 0;
	
	this.addPointsToPlayerScore = function(points)
	{
	    var leadingZeros = "";
	    
	    this.playerScore += points;
	    
	    for (var i = 0, j = (5 - this.playerScore.toString().length); i < j; i++)
	    {
	        leadingZeros += "0";
	    }
	    
	    this.playerScoreText.setText("score "+leadingZeros+ this.playerScore.toString());
	};

	this.checkBulletForCollision = function()
	{
		var collision = false;
		
		// check saucer
		if (this.saucer != null)
		{
			if (this.bulletBox.intersect(this.saucerBox))
			{
				collision = true;
			}
		}
		
		if (!collision)
		{
			// check barriers
			for(var i=0,j=this.barriersBoxes.length; i<j && !collision; i++)
			{
				if (this.barriers[i] != null)
				{
					if (this.bulletBox.intersect(this.barriersBoxes[i]))
					{
						collision = true;
						
						this.barriersStates[i] += 1;
						
						if (this.barriersStates[i] > 3)
						{
							this.spriteContainer.removeChild(this.barriers[i]);
							this.barriers[i] = null;
						}
						else
						{
							this.barriers[i].setTexture(this.barrierTextures[this.barriersParts[i]][this.barriersStates[i]]);
						}
					}
				}			
			}
		}
		
		if (!collision)
		{
			// check aliens
			for(var i=0,j=this.aliensBoxes.length; i<j && !collision; i++)
			{
				if (this.aliens[i] != null)
				{
					if (this.bulletBox.intersect(this.aliensBoxes[i]))
					{
						collision = true;
						
						this.spriteContainer.removeChild(this.aliens[i]);
						
						this.addPointsToPlayerScore(this.aliensPointValues[i]);
						
						this.aliens[i] = null;
					}
				}			
			}
		}
		
		return collision;	
	};

	this.checkSaucerForCollision = function()
	{

	};

	this.checkTankForCollision = function()
	{

	};

	this.cycleAliens = function()
	{
		if (this.alienCyle == 0)
		{
			this.alienCyle = 1;
			this.alienRows = ALIEN_ROWS_1;
		}
		else
		{
			this.alienCyle = 0;
			this.alienRows = ALIEN_ROWS_0;
		}
	};

	//
	// debug
	//
	this.debug = function(duration)
	{
		var direction;
		var fps;

		$('#debug [data="bullet"]').html(this.bulletFiring);

		fps = 1000 / (duration / self.frames);
		$('#debug [data="fps"]').html(fps);
		$('#debug [data="mouse"]').html(this.stage.getMousePosition().x + ", " + this.stage.getMousePosition().y);

		self.frames = 0;

		switch(this.tankDirection)
		{
			case LEFT:
				direction = 'left';
				break;
			//
			case STILL:
				direction = 'still';
				break;
			//
			case RIGHT:
				direction = 'right';
				break;
			//
		}
        $('#debug [data="direction"]').html(direction);

        $('#debug [data="score"]').html(this.playerScore);
	};

	this.fireBullet = function()
	{
		var inCollision;

		if (this.bulletFiring != true)
		{
			this.bulletFiring = true;
			this.bullet.position.x = this.tank.position.x;
			this.bulletBox = this.makeBoxFromSprite(this.bullet);

			this.spriteContainer.addChild(this.bullet);

			this.checkBulletForCollision();
		}
	};

	this.gameOver = function()
	{
	};
	
	this.loadSprites = function()
	{
		// create an array of assets to load
		var assetsToLoader = ["img/game/invaders/spritestrip.json"];

		// create a new loader
		var loader = new PIXI.AssetLoader(assetsToLoader);

		// use callback
		loader.onComplete = onAssetsLoaded;

		//begin load
		loader.load();
	};

	this.makeBoxFromSprite = function(sprite)
	{
		var rect = new Rect(sprite.position.x - (sprite.width * sprite.anchor.x), sprite.position.y - (sprite.height * sprite.anchor.y), sprite.width, sprite.height);

		return rect;
	};

	this.moveAliens = function(dx, dy)
	{
		var index = 0;
		var x = WIDTH / 2;

		for (var n = 0; n < this.alienRows.length; n++)
		{
			texture = this.textures[this.alienRows[n]];

			for (var i = 0; i < 10; i++)
			{
				if (this.aliens[index] != null)
				{
					this.aliens[index].setTexture(texture);
	
					this.aliens[index].position.x += dx;
					this.aliens[index].position.y += dy;
	
					this.aliensBoxes[index].x += dx;
					this.aliensBoxes[index].y += dy;
	
					if (this.alienDirection == RIGHT && this.aliens[index].position.x > WIDTH - 20)
					{
						x = this.aliens[index].position.x;
					}
                    else if (this.alienDirection == LEFT && this.aliens[index].position.x < 20)
					{
						x = this.aliens[index].position.x;
					}
				}

				index++;
			}
		}

		return x;
	};

	this.ready = function()
	{
		// add the renderer view element to the DOM
		$('#game').append(this.renderer.view);

		this.loadSprites();

		this.spriteContainer.position.x = 0;
		this.spriteContainer.position.y = 0;

		this.stage.click = function(iData)
		{
			self.fireBullet();
		};

		this.stage.addChild(this.spriteContainer);

		this.time = new Date().getTime();

        //
        // score text
        self.playerScoreText = new PIXI.Text("score 00000", {align: "left", fill: "#FFFFFF", font : "normal 12pt Courier", stroke: "#FFFFFF"});
        self.playerScoreText.position.x = WIDTH;
        self.playerScoreText.position.y = 2;
        self.playerScoreText.anchor.x = 1.0;
        //
        self.stage.addChild(self.playerScoreText);
        
        //
        // lives
        self.playerLivesText = new PIXI.Text("lives "+this.playerRemainingLives, {align: "left", fill: "#FFFFFF", font : "normal 12pt Courier", stroke: "#FFFFFF"});
        self.playerLivesText.position.x = 2;
        self.playerLivesText.position.y = 2;
        self.playerLivesText.anchor.x = 0.0;
        //
        self.stage.addChild(self.playerLivesText);
        
		//requestAnimFrame(animate);
	};
	
	this.removeBullet = function()
	{
		this.bulletFiring = false;
		this.spriteContainer.removeChild(this.bullet);
		this.bullet.position.y = HEIGHT - BOTTOM_HEIGHT - 32;
		
	};

	this.updateAliens = function()
	{
		this.cycleAliens();

		if (this.alienDrop)
		{
			this.moveAliens(0, 4);
			this.alienDrop = false;
		}
		else
		{
			x = this.moveAliens(this.alienDirection * 4, 0);

			if (x > WIDTH - 20 || x < 20)
			{
				this.alienDirection *= -1;
				this.alienDrop = true;
			}
		}
	};

	this.updateBullet = function()
	{
		this.bullet.position.y -= this.bulletStep;
		this.bulletBox.y -= this.bulletStep;
	};

	this.updateTank = function()
	{
		self.tank.position.x += self.tankDirection;

		if (self.stage.getMousePosition().x < self.tank.position.x)
		{
			self.tankDirection = LEFT;
		}
		else if (self.stage.getMousePosition().x > self.tank.position.x)
		{
			self.tankDirection = RIGHT;
		}
		else
		{
			self.tankDirection = STILL;
		}

		this.checkTankForCollision();
	};

	function animate()
	{
		var duration;
		var time;

		requestAnimFrame(animate);

		time = new Date().getTime();

		duration = time - self.time;

		//
		//
		if (duration > self.nextFrame)
		{
			if (self.bulletFiring == true)
			{
				if (self.checkBulletForCollision())
				{
					self.removeBullet();
				}
				else
				{
					self.updateBullet();
					
					if (self.bullet.position.y < -4)
					{
						self.removeBullet();
					}
				}
			}
			
			self.updateTank();
			self.nextFrame += 20;

			// self.checkSaucerForCollision();
			// self.checkTankForCollision();
			// 
			if (this.tankLives == 0)
			{
				this.gameOver();
			}
		}
		//
		//

		if (duration > 999)
		{
			self.debug(duration);

			self.updateAliens();

			self.time = new Date().getTime();
			self.nextFrame = 20;
		}

		// render the stage
		self.renderer.render(self.stage);

		self.frames++;
	}

	function onAssetsLoaded()
	{
		var barrier;
		var frameName;
		var height;
		var index;
		var pointValue;
		var sprite;
		var texture;
		var width;
		var x;
		var y;

		//
		// the aliens
		//
		// load textures
		for (var i = 0; i < 3; i++)
		{
			self.textures.push(PIXI.Texture.fromFrame("alien" + i + "_1.png"));
			self.textures.push(PIXI.Texture.fromFrame("alien" + i + "_0.png"));
		}
		//
		// add the alien sprites
		for (var n = 0; n < self.alienRows.length; n++)
		{
		    pointValue = ALIEN_ROWS_POINTS[n];
			texture = self.textures[self.alienRows[n]];

			for (var i = 0; i < 10; i++)
			{
				sprite = new PIXI.Sprite(texture);

				sprite.position.x = 56 + (i * 36);
				sprite.position.y = (n * 24) + TOP_HEIGHT + 32;
				sprite.anchor.x = 0.5;
				sprite.anchor.y = 0.5;
				
				self.aliensPointValues.push(pointValue);

				self.aliens.push(sprite);
				self.aliensBoxes.push(self.makeBoxFromSprite(sprite));

				self.spriteContainer.addChild(sprite);
			}
		}
		//
		// bullet sprite
		sprite = PIXI.Sprite.fromFrame("bullet.png");

		sprite.position.x = 0;
		sprite.position.y = HEIGHT - BOTTOM_HEIGHT - 32;
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;

		self.bullet = sprite;
		self.bulletBox = self.makeBoxFromSprite(sprite);

		//
		// the tank
		sprite = PIXI.Sprite.fromFrame("tank.png");

		sprite.position.x = WIDTH / 2;
		sprite.position.y = HEIGHT - BOTTOM_HEIGHT - 16;
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;

		self.tank = sprite;
		self.tankBox = self.makeBoxFromSprite(sprite);

		self.spriteContainer.addChild(sprite);

		//
		// the barriers
		for (var i = 0; i < 5; i++)
		{
			barrier = [];
			for (var n = 0; n < 4; n++)
			{
				barrier.push(PIXI.Texture.fromFrame("barrier" + i + "_" + n + ".png"));
			}
			self.barrierTextures.push(barrier);
		}

		x = WIDTH / 4;

		for (var i = 0; i < 3; i++)
		{
			for (var n = 0; n < BARRIER_INDEXES.length; n++)
			{
				for (var l = 0; l < BARRIER_INDEXES[n].length; l++)
				{
					index = BARRIER_INDEXES[n][l];

					if (index != -1)
					{
						sprite = new PIXI.Sprite(self.barrierTextures[index][0]);

						sprite.position.x = (x * (i + 1)) + (l * 8) - 20;
						sprite.position.y = HEIGHT - BOTTOM_HEIGHT - 64 + (n * 8);
						sprite.anchor.x = 0.5;
						sprite.anchor.y = 0.5;

						self.barriers.push(sprite);
						self.barriersBoxes.push(self.makeBoxFromSprite(sprite));
						self.barriersParts.push(index);
						self.barriersStates.push(0);

						self.spriteContainer.addChild(sprite);
					}
				}
			}
		}

		//
		// the saucer
		sprite = PIXI.Sprite.fromFrame("saucer.png");

		sprite.position.x = WIDTH / 2;
		sprite.position.y = TOP_HEIGHT;
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;

		self.saucer = sprite;
		self.saucerBox = self.makeBoxFromSprite(sprite);

		self.spriteContainer.addChild(sprite);
        
		// start animating
		requestAnimFrame(animate);
	}

};

$(document).ready(function()
{
	var invaders = new Invaders();

	invaders.ready();
});
