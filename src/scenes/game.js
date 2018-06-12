export class Game extends Phaser.Scene {
  preload() {
    this.load.image('tileset', 'assets/gridtiles.png');
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    // player animations atlas
    this.load.atlas('player', 'assets/player.png', 'assets/player.json');
  }

  create() {
    // Handles the clicks on the map to make the character move
    this.input.on('pointerup',Game.handleClick);

    Game.camera = this.cameras.main;
    Game.camera.setBounds(0, 0, 16*20, 16*20);

    // var hero = this.add.image(16,16,'player');
    var hero = this.add.sprite(48, 48, 'player');
    // this.add.sprite(32, 48, 'player');
    hero.setDepth(1);
    hero.setOrigin(0,0);
    Game.camera.startFollow(hero);
    Game.player = hero;

    // Display map
    Game.map = Game.scene.make.tilemap({ key: 'map'});
    // The first parameter is the name of the tileset in Tiled and the second parameter is the key
    // of the tileset image used when loading the file in preload.
    var tiles = Game.map.addTilesetImage('tiles', 'tileset');
    Game.map.createStaticLayer(0, tiles, 0,0);

    // Marker that will follow the mouse
    Game.marker = this.add.graphics();
    Game.marker.lineStyle(3, 0xffffff, 1);
    Game.marker.strokeRect(0, 0, Game.map.tileWidth, Game.map.tileHeight);

    // ### Pathfinding stuff ###
    // Initializing the pathfinder
    Game.finder = new EasyStar.js();

    // We create the 2D array representing all the tiles of our map
    var grid = [];
    for(var y = 0; y < Game.map.height; y++){
        var col = [];
        for(var x = 0; x < Game.map.width; x++){
            // In each cell we store the ID of the tile, which corresponds
            // to its index in the tileset of the map ("ID" field in Tiled)
            col.push(Game.getTileID(x,y));
        }
        grid.push(col);
    }
    Game.finder.setGrid(grid);

    var tileset = Game.map.tilesets[0];
    var properties = tileset.tileProperties;
    var acceptableTiles = [];

    // We need to list all the tile IDs that can be walked on. Let's iterate over all of them
    // and see what properties have been entered in Tiled.
    for(var i = tileset.firstgid-1; i < tiles.total; i++){ // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
        if(!properties.hasOwnProperty(i)) {
            // If there is no property indicated at all, it means it's a walkable tile
            acceptableTiles.push(i+1);
            continue;
        }
        if(!properties[i].collide) acceptableTiles.push(i+1);
        if(properties[i].cost) Game.finder.setTileCost(i+1, properties[i].cost); // If there is a cost attached to the tile, let's register it
    }
    Game.finder.setAcceptableTiles(acceptableTiles);

    game.anims.create({
    key: 'idle',
    frames: game.anims.generateFrameNames('player', {prefix: 'sprite', start: 1, end: 1}),
    frameRate: 10,

    });

    game.anims.create({
    key: 'walkDown',
    frames: this.anims.generateFrameNames('player', {prefix: 'sprite', start: 1, end: 5}),
    frameRate: 10,

    });

    game.anims.create({
        key: 'walkLeft',
        frames: game.anims.generateFrameNames('player', {prefix: 'sprite', start: 7, end: 11}),
        frameRate: 10,

    });

    game.anims.create({
        key: 'walkRight',
        frames: game.anims.generateFrameNames('player', {prefix: 'sprite', start: 13, end: 17}),
        frameRate: 10,

    });

    game.anims.create({
        key: 'walkUp',
        frames: game.anims.generateFrameNames('player', {prefix: 'sprite', start: 19, end: 23}),
        frameRate: 10,

    });

    // Controls set up
    var cursors = this.input.keyboard.createCursorKeys();
    var controlConfig = {
    camera: this.cameras.main,
    left: cursors.left,
    right: cursors.right,
    up: cursors.up,
    down: cursors.down,
    speed: 0.5
    }
  }
var controls = new Phaser.Cameras.Controls.Fixed(controlConfig);
};

update() {
  var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

  // Rounds down to nearest tile
  var pointerTileX = Game.map.worldToTileX(worldPoint.x);
  var pointerTileY = Game.map.worldToTileY(worldPoint.y);
  Game.marker.x = Game.map.tileToWorldX(pointerTileX);
  Game.marker.y = Game.map.tileToWorldY(pointerTileY);
  Game.marker.setVisible(!Game.checkCollision(pointerTileX,pointerTileY));



  if (controls.left.isDown)
  {
      // this.player.body.setVelocityX(-100);
      Game.player.anims.play('walkLeft', true); // walk left
      Game.handleKeyMove('left');
  }
  else if (controls.right.isDown)
  {
      // player.body.setVelocityX(100);
      Game.player.anims.play('walkRight', true);
      Game.handleKeyMove('right');
  }
  else if (controls.up.isDown)
  {
      // player.body.setVelocityY(-100);
      Game.player.anims.play('walkUp', true);
      Game.handleKeyMove('up');
  }
  else if (controls.down.isDown)
  {
      // player.body.setVelocityY(100);
      Game.player.anims.play('walkDown', true);
      Game.handleKeyMove('down');
  } else {
      // Game.player.anims.play('idle', true);
  }
  // if (game.anims.walkingAnimation === null) {
  //   Game.player.anims.play('idle');
  // }
}

Game.checkCollision = function(x,y){
    var tile = Game.map.getTileAt(x, y);
    return tile.properties.collide == true;
};

Game.getTileID = function(x,y){
    var tile = Game.map.getTileAt(x, y);
    return tile.index;
};

Game.handleKeyMove = function(pointer){
    var x;
    var y;
    if (pointer === 'left') {
      x = Game.player.x - 16;
      y = Game.player.y;
    } else if (pointer === 'right') {
      x = Game.player.x + 16;
      y = Game.player.y;
    } else if (pointer === 'up') {
      x = Game.player.x;
      y = Game.player.y - 16;
    } else if (pointer === 'down') {
      x = Game.player.x;
      y = Game.player.y + 16;
    }
    // x = Game.player.x;
    // y = Game.player.y;
    var toX = Math.floor(x/16);
    var toY = Math.floor(y/16);
    var fromX = Math.floor(Game.player.x/16);
    var fromY = Math.floor(Game.player.y/16);
    console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');

    Game.finder.findPath(fromX, fromY, toX, toY, function( path ) {
        if (path === null) {
            console.warn("Path was not found.");
        } else {
            Game.moveCharacter(path);
        }
    });


    Game.finder.calculate(); // don't forget, otherwise nothing happens
};





Game.handleClick = function(pointer){
    var x = Game.camera.scrollX + pointer.x;
    var y = Game.camera.scrollY + pointer.y;
    var toX = Math.floor(x/16);
    var toY = Math.floor(y/16);
    var fromX = Math.floor(Game.player.x/16);
    var fromY = Math.floor(Game.player.y/16);
    console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');

    Game.finder.findPath(fromX, fromY, toX, toY, function( path ) {
        if (path === null) {
            console.warn("Path was not found.");
        } else {
            Game.moveCharacter(path);
        }
    });


    Game.finder.calculate(); // don't forget, otherwise nothing happens
};

Game.moveCharacter = function(path){

    // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
    var tweens = [];
    var intervalCounter = 0;
    var directionLog = [];

    for(var i = 0; i < path.length-1; i++){
      var ex = path[i+1].x;
      var ey = path[i+1].y;
      tweens.push({
          targets: Game.player,
          x: {value: ex*Game.map.tileWidth, duration: 260},
          y: {value: ey*Game.map.tileHeight, duration: 260}
      });
      intervalCounter++;


      // console.log("this is running on #" + i);
      let directionX;
      let directionY;

      directionX = (path[i].x - path[i+1].x);
      directionY = (path[i].y - path[i+1].y);
      // console.log("Direction X: " + directionX);
      // console.log("Direction Y: " + directionY);
      // console.log("Interval Counter: " + intervalCounter);

      if (directionX > 0) {
        directionLog.push('left');
      } else if (directionX < 0) {
        directionLog.push('right');
      }

      if (directionY > 0) {
        directionLog.push('up');
      } else if (directionY < 0) {
        directionLog.push('down');
      }

    }

    console.table(directionLog);

    // console.log(walkingAnimation);
    // game.anims.create({
    // key: 'walkingAnimation',
    // frames: game.anims.generateFrameNames('player', {prefix: 'sprite', start: 0, end: 0}),
    // frameRate: 14
    // });
    // var walkingAnimation = game.anims.get('walkingAnimation');

    var walkingAnimation;
    var frameRateVar = 15;

    for (var i = 0; i < directionLog.length; i++) {

      if (i === 0) {
        if (directionLog[i] === "up") {

          game.anims.create({
          key: 'walkingAnimation',
          frames: game.anims.generateFrameNames('player', {prefix: 'sprite', start: 20, end: 23}),
          frameRate: frameRateVar
          });
          walkingAnimation = game.anims.get('walkingAnimation');
          // var newFrames = game.anims.generateFrameNames('player', {prefix: 'sprite', start: 19, end: 24});
          // walkingAnimation.addFrame(newFrames);
          console.log("going up");
          i++;
        } else if (directionLog[i] === "down") {

          game.anims.create({
          key: 'walkingAnimation',
          frames: game.anims.generateFrameNames('player', {prefix: 'sprite', start: 2, end: 5}),
          frameRate: frameRateVar
          });
          walkingAnimation = game.anims.get('walkingAnimation');
          // var newFrames = game.anims.generateFrameNames('player', {prefix: 'sprite', start: 1, end: 6});
          // walkingAnimation.addFrame(newFrames);
          console.log("going down");
          i++;
        } else if (directionLog[i] === "left") {

          game.anims.create({
          key: 'walkingAnimation',
          frames: game.anims.generateFrameNames('player', {prefix: 'sprite', start: 8, end: 11}),
          frameRate: frameRateVar
          });
          walkingAnimation = game.anims.get('walkingAnimation');
          // var newFrames = game.anims.generateFrameNames('player', {prefix: 'sprite', start: 7, end: 12});
          // walkingAnimation.addFrame(newFrames);
          console.log("going left");
          i++;
        } else if (directionLog[i] === "right") {

          game.anims.create({
          key: 'walkingAnimation',
          frames: game.anims.generateFrameNames('player', {prefix: 'sprite', start: 14, end: 17}),
          frameRate: frameRateVar
          });
          walkingAnimation = game.anims.get('walkingAnimation');
          // var newFrames = game.anims.generateFrameNames('player', {prefix: 'sprite', start: 13, end: 18});
          // walkingAnimation.addFrame(newFrames);
          console.log("going right");
          i++;
        }

      }

      if (directionLog[i] === "up") {
        console.log("going up");

        var newFrames = game.anims.generateFrameNames('player', {prefix: 'sprite', start: 20, end: 23});
        walkingAnimation.addFrame(newFrames);

      } else if (directionLog[i] === "down") {
        var newFrames = game.anims.generateFrameNames('player', {prefix: 'sprite', start: 2, end: 5});
        walkingAnimation.addFrame(newFrames);
        console.log("going down");

      } else if (directionLog[i] === "left") {
        var newFrames = game.anims.generateFrameNames('player', {prefix: 'sprite', start: 8, end: 11});
        walkingAnimation.addFrame(newFrames);
        console.log("going left");

      } else if (directionLog[i] === "right") {
        var newFrames = game.anims.generateFrameNames('player', {prefix: 'sprite', start: 14, end: 17});
        walkingAnimation.addFrame(newFrames);
        console.log("going right");
      }
    };
    console.log(game.anims);
    // Game.player.play('walkingAnimation');

    Game.player.anims.play('walkingAnimation');


    Game.scene.tweens.timeline(
    {
        tweens: tweens
    });
    console.log(path);
    game.anims.remove('walkingAnimation');

      // console.log("Tweens: " + tweens[0].targets.x)
      // console.log("X Variable Calc: " + (Game.player.x - tweens[0].targets.x));
      // console.log("X Location " + Game.player.x);
      // console.log(Game.scene.tweens);
};
