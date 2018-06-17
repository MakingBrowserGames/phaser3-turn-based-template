import makeAnimations from '../animations/heroAnimations';


class TBS extends Phaser.Scene {
  constructor(test) {
      super({
          key: 'TBS'
      });
  }

  //TODO: Implement a boot scene similar to nkholski's Bootscene. Ensure all files loaded

  preload() {
    console.log('preload, this:');
    console.log(this);
    this.load.image('tileset', '../assets/images/gridtiles.png');
    this.load.tilemapTiledJSON('map', '../assets/tilemaps/map.json');
    // player animations atlas
    this.load.atlas('player', '../assets/images/player.png', '../assets/images/player.json');

    // Makes sure all
    this.load.on('complete', () => {
    // prepare all animations, defined in a separate file
      makeAnimations(this);
    });



  }

  create() {
    var collisionObjects;

    // Handles the clicks on the map to make the character move
    this.input.on('pointerup',this.handleClick);


    // TODO: Update bounds to a variable set to the map or other built-in function
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, 16*20, 16*20);


    var hero = this.add.sprite(48, 48, 'player');

    hero.setDepth(1);
    hero.setOrigin(0,0);
    this.camera.startFollow(hero);
    this.player = hero;

    // Display map
    this.map = this.make.tilemap({
      key: 'map'
    });
    // The first parameter is the name of the tileset in Tiled and the second parameter is the key
    // of the tileset image used when loading the file in preload.
    var tiles = this.map.addTilesetImage('tiles', 'tileset');
    this.map.createStaticLayer(0, tiles, 0,0);


    // Custom collisionObjects
    collisionObjects = this.physics.add.staticGroup;



    // Marker that will follow the mouse, defines a line and places it a 0,0
    this.marker = this.add.graphics();
    this.marker.lineStyle(3, 0xffffff, 1);
    this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);

    // ### Pathfinding stuff ###
    // Initializing the pathfinder
    this.finder = new EasyStar.js();

    // We create the 2D array representing all the tiles of our map
    var grid = [];
    for(var y = 0; y < this.map.height; y++){
        var col = [];
        for(var x = 0; x < this.map.width; x++){
            // In each cell we store the ID of the tile, which corresponds
            // to its index in the tileset of the map ("ID" field in Tiled)
            col.push(this.getTileID(x,y));
        }
        grid.push(col);
    }
    this.finder.setGrid(grid);
    console.table(grid);

    var tileset = this.map.tilesets[0];
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
        if(properties[i].cost) this.finder.setTileCost(i+1, properties[i].cost); // If there is a cost attached to the tile, let's register it
    }
    this.finder.setAcceptableTiles(acceptableTiles);

    console.log(acceptableTiles);

    // // Controls set up
    // var cursors = this.input.keyboard.createCursorKeys();
    // var controlConfig = {
    // camera: this.cameras.main,
    // left: cursors.left,
    // right: cursors.right,
    // up: cursors.up,
    // down: cursors.down,
    // speed: 0.5
    // }
    // var controls = new Phaser.Cameras.Controls.Fixed(controlConfig);

    this.keys = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
    };

    //
    this.player.anims.play('walkDown', true); // walk down

  }



  update() {
    var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

    // Rounds down to nearest tile
    var pointerTileX = this.map.worldToTileX(worldPoint.x);
    var pointerTileY = this.map.worldToTileY(worldPoint.y);
    this.marker.x = this.map.tileToWorldX(pointerTileX);
    this.marker.y = this.map.tileToWorldY(pointerTileY);
    this.marker.setVisible(!this.checkCollision(pointerTileX,pointerTileY));

    if (this.keys.left.isDown) {

        this.player.anims.play('walkLeft', true); // walk left
        this.handleKeyMove('left');
    };
    if (this.keys.right.isDown) {

        this.player.anims.play('walkRight', true);
        this.handleKeyMove('right');
    };
    if (this.keys.up.isDown) {

        this.player.anims.play('walkUp', true);
        this.handleKeyMove('up');
    };
    if (this.keys.down.isDown) {

        this.player.anims.play('walkDown', true);
        this.handleKeyMove('down');
    };

    // if (this.keys.left.isUp) {
    //
    //     this.snapGridPosition()
    // } else if (this.keys.right.isUp) {
    //     this.snapGridPosition()
    //
    // } else if (this.keys.up.isUp) {
    //
    //     this.snapGridPosition()
    // } else if (this.keys.down.isUp) {
    //
    //     this.snapGridPosition()
    // } else {
    //     // this.player.anims.play('idle', true);
    // }

  };

  checkCollision(x,y) {
      var tile = this.map.getTileAt(x, y);
      if (tile == null) {
      } else {
        return tile.properties.collide;
      }


  };

  getTileID(x,y) {
      var tile = this.map.getTileAt(x, y);
      return tile.index;
  };

  handleClick(pointer) {
        var x = this.scene.camera.scrollX + pointer.position.x;
        var y = this.scene.camera.scrollY + pointer.position.y;
      // TODO: Confirm this.scene and pointer.position are correct, figure out why I need to add scene and not just reference this. It has to do with scoping somehow, but unsure why create, preload, and update don't have this issue.
      var currentScene = this.scene;

      var toX = Math.floor(x/16);
      var toY = Math.floor(y/16);
      var fromX = Math.floor(this.scene.player.x/16);
      var fromY = Math.floor(this.scene.player.y/16);
      console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');

      this.scene.finder.findPath(fromX, fromY, toX, toY, path => {
          if (path === null) {
              console.warn("Path was not found.");
          } else {

              currentScene.moveCharacter(path);
              console.log('Path found!!')
          }
      });
      this.scene.finder.calculate(); // don't forget, otherwise nothing happens
  };

  moveCharacter(path){
    var mainCharacterTweens = this.tweens.getTweensOf(this.player);

    if (mainCharacterTweens.length > 0) {
      return
    } else {
      var currentScene = this;
      // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
      var tweens = [];
      var intervalCounter = 0;
      var directionLog = [];

      for(var i = 0; i < path.length-1; i++){
        var ex = path[i+1].x;
        var ey = path[i+1].y;
        tweens.push({
            targets: currentScene.player,
            x: {value: ex*this.map.tileWidth, duration: 260},
            y: {value: ey*this.map.tileHeight, duration: 260}
        });
        intervalCounter++;

        let directionX;
        let directionY;

        directionX = (path[i].x - path[i+1].x);
        directionY = (path[i].y - path[i+1].y);

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
      var walkingAnimation;
      var frameRateVar = 15;

      for (var i = 0; i < directionLog.length; i++) {
        if (i === 0) {
          if (directionLog[i] === "up") {
            this.anims.create({
            key: 'walkingAnimation',
            frames: this.anims.generateFrameNames('player', {prefix: 'sprite', start: 20, end: 23}),
            frameRate: frameRateVar
            });
            walkingAnimation = this.anims.get('walkingAnimation');
            i++;
          } else if (directionLog[i] === "down") {
            this.anims.create({
            key: 'walkingAnimation',
            frames: this.anims.generateFrameNames('player', {prefix: 'sprite', start: 2, end: 5}),
            frameRate: frameRateVar
            });
            walkingAnimation = this.anims.get('walkingAnimation');
            i++;
          } else if (directionLog[i] === "left") {
            this.anims.create({
            key: 'walkingAnimation',
            frames: this.anims.generateFrameNames('player', {prefix: 'sprite', start: 8, end: 11}),
            frameRate: frameRateVar
            });
            walkingAnimation = this.anims.get('walkingAnimation');
            i++;
          } else if (directionLog[i] === "right") {
            this.anims.create({
            key: 'walkingAnimation',
            frames: this.anims.generateFrameNames('player', {prefix: 'sprite', start: 14, end: 17}),
            frameRate: frameRateVar
            });
            walkingAnimation = this.anims.get('walkingAnimation');
            i++;
          }
        }

        if (directionLog[i] === "up") {
          // var newFrames = this.anims.get('walkUp');
          var newFrames = this.anims.generateFrameNames('player', {prefix: 'sprite', start: 20, end: 23});
          walkingAnimation.addFrame(newFrames);
        } else if (directionLog[i] === "down") {
          // var newFrames = this.anims.get('walkDown');
          var newFrames = this.anims.generateFrameNames('player', {prefix: 'sprite', start: 2, end: 5});
          walkingAnimation.addFrame(newFrames);
        } else if (directionLog[i] === "left") {
          // var newFrames = this.anims.get('walkLeft');
          var newFrames = this.anims.generateFrameNames('player', {prefix: 'sprite', start: 8, end: 11});
          walkingAnimation.addFrame(newFrames);
        } else if (directionLog[i] === "right") {
          // var newFrames = this.anims.get('walkRight');
          var newFrames = this.anims.generateFrameNames('player', {prefix: 'sprite', start: 14, end: 17});
          walkingAnimation.addFrame(newFrames);
        }
      };
      this.player.anims.play('walkingAnimation', true);

      currentScene.tweens.timeline({
          tweens: tweens
      });
      this.anims.remove('walkingAnimation');
    };
  }

  handleKeyMove(pointer) {
    var x;
    var y;
    var currentScene = this;
    if (pointer === 'left') {
      x = this.player.x - 16;
      y = this.player.y;
    } else if (pointer === 'right') {
      x = this.player.x + 16;
      y = this.player.y;
    } else if (pointer === 'up') {
      x = this.player.x;
      y = this.player.y - 16;
    } else if (pointer === 'down') {
      x = this.player.x;
      y = this.player.y + 16;
    }
    var toX = Math.floor(x/16);
    var toY = Math.floor(y/16);
    var fromX = Math.floor(this.player.x/16);
    var fromY = Math.floor(this.player.y/16);
    console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');

    if (pointer === 'left') {
      console.log('left');
      toX++;
      var collision = this.checkCollision(toX, toY);
      if (collision !== true) {
        this.player.x = this.player.x - 1;
      } else {
        console.log('collision detected!!');
      }
    } else if (pointer === 'right') {
      var collision = this.checkCollision(toX, toY);
      if (collision !== true) {
        this.player.x = this.player.x + 1;
      } else {
        console.log('collision detected!!');
      }
    } else if (pointer === 'up') {
      toY++;
      var collision = this.checkCollision(toX, toY);
      if (collision !== true) {
        this.player.y = this.player.y - 1;
      } else {
        console.log('collision detected!!');
      }

    } else if (pointer === 'down') {
      var collision = this.checkCollision(toX, toY);
      if (collision !== true) {
        this.player.y = this.player.y + 1;
      } else {
        console.log('collision detected!!');
      }
    }


    // console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');
    //
    // this.finder.findPath(fromX, fromY, toX, toY, path => {
    //     if (path === null) {
    //         console.warn("Path was not found.");
    //     } else {
    //         this.moveCharacterKeyboard(path, pointer);
    //     }
    // });
    // this.finder.calculate(); // don't forget, otherwise nothing happens
  };

  snapGridPosition () {
    var mainCharacterTweens = this.tweens.getTweensOf(this.player);

    if (mainCharacterTweens.length > 0) {
      return
    } else {
      var currentScene = this;
      var currentPositionX = this.player.x;
      var currentPositionY = this.player.y;
      var toCalculateX = (Math.floor(this.player.x/16) * 16);
      var toCalculateY = (Math.floor(this.player.y/16) * 16);

      var toX = Math.floor(currentPositionX/16);
      var toY = Math.floor(currentPositionY/16);
      var fromX = Math.floor(this.player.x/16);
      var fromY = Math.floor(this.player.y/16);

      var tweens = [];

      if (currentPositionX !== toCalculateX) {
        console.log('X not aligned!!');
        console.log(this.player.x);
        console.log(toCalculateX);
        tweens.push({
            targets: this.player,
            x: {value: toCalculateX, duration: 150}
        });

      }
      if (currentPositionY !== toCalculateY) {
        console.log('Y not aligned!!');
      }

      this.tweens.timeline({
          tweens: tweens
      });
    }


  }

  moveCharacterKeyboard(path, pointer){
    //solution 1
    var mainCharacterTweens = this.tweens.getTweensOf(this.player);

    if (mainCharacterTweens.length > 0) {
      return
    } else {
      var tweens = [];
      var ex = path[1].x;
      var ey = path[1].y;
      tweens.push({
          targets: this.player,
          x: {value: ex*this.map.tileWidth, duration: 260},
          y: {value: ey*this.map.tileHeight, duration: 260}
      });

      this.tweens.timeline({
          tweens: tweens
      });
    }

  }

};

export default TBS;
