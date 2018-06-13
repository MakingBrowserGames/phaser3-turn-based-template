export default function makeAnimations(scene) {
  // TODO:  maybe use JSON to load animations


  scene.anims.create({
  key: 'idle',
  frames: scene.anims.generateFrameNames('player', {prefix: 'sprite', start: 1, end: 1}),
  frameRate: 10,

  });

  scene.anims.create({
  key: 'walkDown',
  frames: scene.anims.generateFrameNames('player', {prefix: 'sprite', start: 1, end: 5}),
  frameRate: 10,
  });

  scene.anims.create({
      key: 'walkLeft',
      frames: scene.anims.generateFrameNames('player', {prefix: 'sprite', start: 7, end: 11}),
      frameRate: 10,

  });

  scene.anims.create({
      key: 'walkRight',
      frames: scene.anims.generateFrameNames('player', {prefix: 'sprite', start: 13, end: 17}),
      frameRate: 10,

  });

  scene.anims.create({
      key: 'walkUp',
      frames: scene.anims.generateFrameNames('player', {prefix: 'sprite', start: 19, end: 23}),
      frameRate: 10,

  });

}
