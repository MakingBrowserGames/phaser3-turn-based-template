export default function handlePathfinding(path, currentScene) {

    var mainCharacterTweens = currentScene.tweens.getTweensOf(currentScene.player);
    // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
    var tweens = [];
    var intervalCounter = 0;
    // Creates a direction log to know which animation to add to the timeline
    var directionLog = [];

    // Checks if the character is already tweening
    if (mainCharacterTweens.length > 0) {
      return
    } else {
      for(var i = 0; i < path.length-1; i++){
        var ex = path[i+1].x;
        var ey = path[i+1].y;
        tweens.push({
            targets: currentScene.player,
            // The +8 is to make up for the setOrigin(.5,.5), this should change if grid width changes
            //TODO: make variable for gridwidth and take half here to streamline
            x: {value: ((ex*currentScene.map.tileWidth) + 8), duration: 260},
            y: {value: ((ey*currentScene.map.tileHeight) + 8), duration: 260}
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

      // TODO: clean up the animation portion and make it plug and play friendly, add switch statements
      for (var i = 0; i < directionLog.length; i++) {
        if (i === 0) {
          if (directionLog[i] === "up") {
            currentScene.anims.create({
            key: 'walkingAnimation',
            frames: currentScene.anims.generateFrameNames('player', {prefix: 'sprite', start: 20, end: 23}),
            frameRate: frameRateVar
            });
            walkingAnimation = currentScene.anims.get('walkingAnimation');
            i++;
          } else if (directionLog[i] === "down") {
            currentScene.anims.create({
            key: 'walkingAnimation',
            frames: currentScene.anims.generateFrameNames('player', {prefix: 'sprite', start: 2, end: 5}),
            frameRate: frameRateVar
            });
            walkingAnimation = currentScene.anims.get('walkingAnimation');
            i++;
          } else if (directionLog[i] === "left") {
            currentScene.anims.create({
            key: 'walkingAnimation',
            frames: currentScene.anims.generateFrameNames('player', {prefix: 'sprite', start: 8, end: 11}),
            frameRate: frameRateVar
            });
            walkingAnimation = currentScene.anims.get('walkingAnimation');
            i++;
          } else if (directionLog[i] === "right") {
            currentScene.anims.create({
            key: 'walkingAnimation',
            frames: currentScene.anims.generateFrameNames('player', {prefix: 'sprite', start: 14, end: 17}),
            frameRate: frameRateVar
            });
            walkingAnimation = currentScene.anims.get('walkingAnimation');
            i++;
          }
        }

        if (directionLog[i] === "up") {
          // var newFrames = this.anims.get('walkUp');
          var newFrames = currentScene.anims.generateFrameNames('player', {prefix: 'sprite', start: 20, end: 23});
          walkingAnimation.addFrame(newFrames);
        } else if (directionLog[i] === "down") {
          // var newFrames = this.anims.get('walkDown');
          var newFrames = currentScene.anims.generateFrameNames('player', {prefix: 'sprite', start: 2, end: 5});
          walkingAnimation.addFrame(newFrames);
        } else if (directionLog[i] === "left") {
          // var newFrames = this.anims.get('walkLeft');
          var newFrames = currentScene.anims.generateFrameNames('player', {prefix: 'sprite', start: 8, end: 11});
          walkingAnimation.addFrame(newFrames);
        } else if (directionLog[i] === "right") {
          // var newFrames = this.anims.get('walkRight');
          var newFrames = currentScene.anims.generateFrameNames('player', {prefix: 'sprite', start: 14, end: 17});
          walkingAnimation.addFrame(newFrames);
        }
      };
      currentScene.player.anims.play('walkingAnimation', true);

      currentScene.tweens.timeline({
          tweens: tweens
      });
      currentScene.anims.remove('walkingAnimation');
    };
}
