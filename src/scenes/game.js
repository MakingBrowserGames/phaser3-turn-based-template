import makeAnimations from '../animations/heroAnimations';


class TBS extends Phaser.Scene {
  constructor(test) {
      super({
          key: 'TBS'
      });
  }

  //TODO: Implement a boot scene similar to nkholski's Bootscene. Ensure all files loaded

  preload() {

    this.load.image('tileset', '../assets/images/gridtiles.png');
    this.load.tilemapTiledJSON('map', '../assets/tilemaps/mapv2.json');
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
    this.camera.setBounds(0, 0, 20*20, 20*20);


    var hero = this.physics.add.sprite(48, 48, 'player');

    hero.setDepth(1);
    hero.setOrigin(0,0);
    // // Camera to follow the hero
    // this.camera.startFollow(hero);
    this.player = hero;

    // Display map
    this.map = this.make.tilemap({
      key: 'map'
    });
    // The first parameter is the name of the tileset in Tiled and the second parameter is the key
    // of the tileset image used when loading the file in preload.
    var tiles = this.map.addTilesetImage('tiles', 'tileset');
    this.map.createStaticLayer('groundLayer', tiles, 0,0);
    collisionObjects = this.map.createStaticLayer('collisionLayer', tiles, 0,0);

    this.player.setCollideWorldBounds(true);
    collisionObjects.setCollisionByExclusion([-1]);
    this.physics.add.collider(collisionObjects, this.player);


    // ******** To be updated to physics
    collisionObjects.setCollisionByProperty({ collides: true });
    // var slopeMap = { 5: 1, 6: 1, 7: 1, 13: 1, 15: 1, 21: 1, 22: 1, 23: 1 };
    console.log('phyiscs', this.physics);
    console.log('player', this.player);
    // this.physics.world.collideSpriteVsTilemapLayer(this.player, collisionObjects);



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

            if (this.getTileID(x,y) === null) {
              console.log('Null Value detected!!!');
            } else {
              col.push(this.getTileID(x,y));
            }

        }
        grid.push(col);
    }
    this.finder.setGrid(grid);
    console.table(grid);
    console.log(this.map);
    var tileset = this.map.tilesets[0];
    var properties = tileset.tileProperties;
    console.log('properties: ', properties);
    var acceptableTiles = [];

    // We need to list all the tile IDs that can be walked on. Let's iterate over all of them
    // and see what properties have been entered in Tiled.

    for(var i = tileset.firstgid-1; i < tiles.total; i++){ // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
        if(!properties.hasOwnProperty(i)) {
            // If there is no property indicated at all, it means it's a walkable tile
            // if(!properties[i].collides) acceptableTiles.push(i+1);
            acceptableTiles.push(i+1)
            continue;
        }
        //TODO: If there are multiple properties, need to check just for 'collides' in the future

        // if(properties[i].cost) this.finder.setTileCost(i+1, properties[i].cost); // If there is a cost attached to the tile, let's register it
    }
    this.finder.setAcceptableTiles(acceptableTiles);

    // for(var i = tileset.firstgid-1; i < tiles.total; i++){ // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
    //     if(properties.hasOwnProperty(i)) {
    //         // If there is no property indicated at all, it means it's a walkable tile
    //         acceptableTiles.push(i+1);
    //         console.log(i);
    //         continue;
    //     }
    //     if(!properties[i].collides) acceptableTiles.push(i+1);
    //     if(properties[i].cost) this.finder.setTileCost(i+1, properties[i].cost); // If there is a cost attached to the tile, let's register it
    //     console.log(i);
    // }
    // this.finder.setAcceptableTiles(acceptableTiles);

    console.log(acceptableTiles);


    this.keys = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
    };

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
    } else if (this.keys.right.isDown) {

        this.player.anims.play('walkRight', true);
        this.handleKeyMove('right');
    } else if (this.keys.up.isDown) {

        this.player.anims.play('walkUp', true);
        this.handleKeyMove('up');
    } else if (this.keys.down.isDown) {

        this.player.anims.play('walkDown', true);
        this.handleKeyMove('down');
    } else {
      this.player.setVelocityY(0);
      this.player.setVelocityX(0);
      // TODO: write if statement to walkdown plays if not tweening from the mouse input pathfinding
      // this.player.anims.play('walkDown', true);
    };

  };

  checkCollision(x,y) {
      var tile = this.map.getTileAt(x, y);
      if (tile == null) {
      } else {
        return tile.properties.collide;
      }


  };

  getTileID(x,y) {
      var tile = this.map.getTileAt(x, y, false, 'collisionLayer');
      if (tile === null) {
        return 1;
      } else {
        return tile.index;
      }

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
    console.log(mainCharacterTweens);
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
    // console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');

    if (pointer === 'left') {
      this.player.setVelocityX(-150);
    } else if (pointer === 'right') {
      this.player.setVelocityX(+150);
    } else if (pointer === 'up') {
      this.player.setVelocityY(-150);
    } else if (pointer === 'down') {
      this.player.setVelocityY(+150);
    }

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
