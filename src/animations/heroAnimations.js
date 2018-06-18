export default function makeAnimations(scene) {
  // TODO:  maybe use JSON to load animations


  scene.anims.create({
  key: 'idle',
  frames: scene.anims.generateFrameNames('player', {prefix: 'sprite', start: 1, end: 1}),
  frameRate: 8,
  repeat: -1
  });

  scene.anims.create({
  key: 'walkDown',
  frames: scene.anims.generateFrameNames('player', {prefix: 'sprite', start: 1, end: 5}),
  frameRate: 8,
  repeat: -1
  });

  scene.anims.create({
      key: 'walkLeft',
      frames: scene.anims.generateFrameNames('player', {prefix: 'sprite', start: 7, end: 11}),
      frameRate: 8,
      repeat: -1

  });

  scene.anims.create({
      key: 'walkRight',
      frames: scene.anims.generateFrameNames('player', {prefix: 'sprite', start: 13, end: 17}),
      frameRate: 8,
      repeat: -1

  });

  scene.anims.create({
      key: 'walkUp',
      frames: scene.anims.generateFrameNames('player', {prefix: 'sprite', start: 19, end: 23}),
      frameRate: 8,
      repeat: -1

  });



    scene.anims.create({
    key: 'eIdle',
    frames: scene.anims.generateFrameNames('enemy', {prefix: 'sprite', start: 1, end: 1}),
    frameRate: 8,
    repeat: -1
    });

    scene.anims.create({
    key: 'eWalkDown',
    frames: scene.anims.generateFrameNames('enemy', {prefix: 'sprite', start: 1, end: 5}),
    frameRate: 8,
    repeat: -1
    });

    scene.anims.create({
        key: 'eWalkLeft',
        frames: scene.anims.generateFrameNames('enemy', {prefix: 'sprite', start: 7, end: 11}),
        frameRate: 8,
        repeat: -1

    });

    scene.anims.create({
        key: 'eWalkRight',
        frames: scene.anims.generateFrameNames('enemy', {prefix: 'sprite', start: 13, end: 17}),
        frameRate: 8,
        repeat: -1

    });

    scene.anims.create({
        key: 'eWalkUp',
        frames: scene.anims.generateFrameNames('enemy', {prefix: 'sprite', start: 19, end: 23}),
        frameRate: 8,
        repeat: -1

    });

}
