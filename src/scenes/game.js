import makeAnimations from '../animations/heroAnimations';
import pathfinding from '../controlsMovement/pathfinding';


class TBS extends Phaser.Scene {
  constructor(test) {
      super({
          key: 'TBS'
      });
  }

  //TODO: Implement a boot scene similar to nkholski's Bootscene. Ensure all files loaded

  preload() {

    // Load the tileset and create map layout
    this.load.image('tileset', '../assets/images/gridtiles.png');
    this.load.tilemapTiledJSON('map', '../assets/tilemaps/mapv2.json');

    // Create atlas of player animations
    this.load.atlas('player', '../assets/images/player.png', '../assets/images/player.json');

    // prepare all animations, defined in a separate file
    this.load.on('complete', () => {
      makeAnimations(this);
    });



  }

  create() {
    var collisionObjects;
    var currentScene = this;
    var hero;
    var tiles;


    // Handles the clicks on the map to make the character move
    this.input.on('pointerup',this.handleClick);


    // TODO: Update bounds to a variable set to the map or other built-in function
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, 20*20, 20*20);

    //TODO: figure out what setDepth does

    // Create player controlled character, and align Origin to collide correctly
    hero = this.physics.add.sprite(56, 56, 'player');
    hero.setDepth(1);
    hero.setOrigin(0.5,0.5);

    // // Camera to follow the hero
    // this.camera.startFollow(hero);

    // makes this.player available in other functions and adds hero sprite
    this.player = hero;

    // Display map
    this.map = this.make.tilemap({
      key: 'map'
    });

    // The first parameter is the name of the tileset in Tiled and the second parameter is the key
    // of the tileset image used when loading the file in preload.
    tiles = this.map.addTilesetImage('tiles', 'tileset');

    // Display two layers from Tiled file, first parameter is from the JSON file
    this.map.createStaticLayer('groundLayer', tiles, 0,0);
    collisionObjects = this.map.createStaticLayer('collisionLayer', tiles, 0,0);


    //TODO: clean up variable names for layers
    // Sets collision rules for player to collide with world bounds and collisionLayer
    this.player.setCollideWorldBounds(true);
    collisionObjects.setCollisionByExclusion([-1]);
    this.physics.add.collider(collisionObjects, this.player);


    // Marker that will follow the mouse, defines a line and places it a 0,0
    this.marker = this.add.graphics();
    this.marker.lineStyle(3, 0xffffff, 1);
    this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);

    // Initialize pathfiinder and create grid of acceptable tilese
    pathfinding(currentScene, tiles);


    // Setup input keys
    this.keys = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
    };

    // load initial walking animation
    this.player.anims.play('walkDown', true); // walk down
  }



  update() {

    // TODO: better understand what this code does, used to create rectangle around square

    var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

    // Rounds down to nearest tile
    var pointerTileX = this.map.worldToTileX(worldPoint.x);
    var pointerTileY = this.map.worldToTileY(worldPoint.y);
    this.marker.x = this.map.tileToWorldX(pointerTileX);
    this.marker.y = this.map.tileToWorldY(pointerTileY);
    this.marker.setVisible(!this.checkCollision(pointerTileX,pointerTileY));


    // ### movement controls

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

    //TODO: Think of way so it does not have to be in the update function. Clean up code for switch statement or simplify, create function to see what pushed recently or add a listener event
    // Checks if the input keys have been pushed recently and runs snapGridPosition to ensure player is aligned to grid
    if (this.keys.left.timeUp > 0) {
      this.snapGridPosition('left');
      this.keys.left.reset();
    }
    if (this.keys.right.timeUp > 0) {
      this.snapGridPosition('right');
      this.keys.right.reset();
    }
    if (this.keys.down.timeUp > 0) {
      this.snapGridPosition('down');
      this.keys.down.reset();
    }
    if (this.keys.up.timeUp > 0) {
      this.snapGridPosition('up');
      this.keys.up.reset();
    }
  };


  // Used by the square mouse function to display if path is valid or not
  checkCollision(x,y) {
      var tile = this.map.getTileAt(x, y);
      if (tile == null) {

      } else {
        return tile.properties.collides;
      }
  };

  // Get tile ID of the following input coordinates, right now setup only for collisionLayer, used to create acceptableTiles grid
  getTileID(x,y) {
      var tile = this.map.getTileAt(x, y, false, 'collisionLayer');
      if (tile === null) {
        return 1;
      } else {
        return tile.index;
      }
  };

  //
  handleClick(pointer) {
      console.log(this);
      console.log(this.scene);
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
            // The +8 is to make up for the setOrigin(.5,.5), this should change if grid width changes
            //TODO: make variable for gridwidht and take half here to streamline
            x: {value: ((ex*this.map.tileWidth) + 8), duration: 260},
            y: {value: ((ey*this.map.tileHeight) + 8), duration: 260}
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

  handleKeyMove(direction) {
    if (direction === 'left') {
      this.player.setVelocityX(-100);
    } else if (direction === 'right') {
      this.player.setVelocityX(+100);
    } else if (direction === 'up') {
      this.player.setVelocityY(-100);
    } else if (direction === 'down') {
      this.player.setVelocityY(+100);
    }
  };


  //TODO: fix input so that while Tweens running, can't change player direction, likely create a function to check if tweens running
  //TODO: Figure out varaible that takes how many pixels different and adjusts the timing of snapgrid to match the current velocity settings. Check how many pixels moved per velocity speed
  snapGridPosition (direction) {
    var currentScene = this;
    if (this.keys.up.isDown || this.keys.down.isDown || this.keys.left.isDown || this.keys.right.isDown) {
      return
    } else {

      var mainCharacterTweens = this.tweens.getTweensOf(this.player);

      if (mainCharacterTweens.length > 0) {
        return
      } else {

        var currentPositionX = this.player.x;
        var currentPositionY = this.player.y;
        var toCalculateX = ((Math.floor(this.player.x/16) * 16) + 8);
        var toCalculateY = ((Math.floor(this.player.y/16) * 16) + 8);
        console.log('current Position X: ', currentPositionX);
        console.log('target Position X: ', toCalculateX);
        var moveToY;
        var moveToX;
        var checkVariable;
        var tweens = [];

        // Gets target tile based on direction and does a check if it is a valid tile
        //TODO: check for 16 for tile  width and add a better variable
        if (direction === 'left') {
          if (currentPositionX < toCalculateX) {
            moveToX = toCalculateX - 16;
          } else {
            moveToX = toCalculateX;
          }
          checkVariable = currentScene.getTileID(moveToX, currentPositionY);
          if (currentScene.checkCollision(checkVariable[0], checkVariable[1])) {
            moveToX = moveToX + 16;
          }
        };
        if ((direction === 'left') && (currentPositionX > moveToX)) {
          console.log('check left works!!!!');
          tweens.push({
              targets: this.player,
              x: {value: (moveToX), duration: 100}
          });

        };

        // Check right
        // make sure that toCalculateX is pulling the cell to the right if target is past the threshold at all to prevent snapping to previous grid, that's why we check the direction
        if (direction === 'right') {
          if (currentPositionX > toCalculateX) {
            moveToX = toCalculateX + 16;
          } else {
            moveToX = toCalculateX;
          }
          // Check to see if the next tile over collides, if it does then change the target back one cell
          checkVariable = currentScene.getTileID(moveToX, currentPositionY);
          if (currentScene.checkCollision(checkVariable[0], checkVariable[1])) {
            moveToX = moveToX - 16;
          }
        };
        // push the target to Tweens and snap to the next tile in specified direction if valid
        if ((direction === 'right') && (currentPositionX < moveToX)) {
          console.log('check right works!!!!');
          tweens.push({
              targets: this.player,
              x: {value: (moveToX), duration: 100}
          });
        };


        // Check Down
        // make sure that toCalculateX is pulling the cell to the right if target is past the threshold at all to prevent snapping to previous grid, that's why we check the direction
        if (direction === 'down') {
          if (currentPositionY > toCalculateY) {
            moveToY = toCalculateY + 16;
          } else {
            moveToY = toCalculateY;
          }
          // Check to see if the next tile over collides, if it does then change the target back one cell
          checkVariable = currentScene.getTileID(currentPositionX, moveToY);
          if (currentScene.checkCollision(checkVariable[0], checkVariable[1])) {
            moveToY = moveToY - 16;
          }
        };
        // push the target to Tweens and snap to the next tile in specified direction if valid
        if ((direction === 'down') && (currentPositionY < moveToY)) {
          console.log('check down works!!!!');
          tweens.push({
              targets: this.player,
              y: {value: (moveToY), duration: 100}
          });
        };

        // Check Up
        // make sure that toCalculateX is pulling the cell to the right if target is past the threshold at all to prevent snapping to previous grid, that's why we check the direction
        if (direction === 'up') {
          if (currentPositionY < toCalculateY) {
            moveToY = toCalculateY - 16;
          } else {
            moveToY = toCalculateY;
          }
          // Check to see if the next tile over collides, if it does then change the target back one cell
          checkVariable = currentScene.getTileID(currentPositionX, moveToY);
          if (currentScene.checkCollision(checkVariable[0], checkVariable[1])) {
            moveToY = moveToY + 16;
          }
        };
        // push the target to Tweens and snap to the next tile in specified direction if valid
        if ((direction === 'up') && (currentPositionY > moveToY)) {
          console.log('check up works!!!!');
          tweens.push({
              targets: this.player,
              y: {value: (moveToY), duration: 100}
          });
        };


        this.tweens.timeline({
            tweens: tweens
        });
      }
    }

  }

};

export default TBS;
