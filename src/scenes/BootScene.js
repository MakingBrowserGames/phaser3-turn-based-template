import makeAnimations from '../animations/heroAnimations';


class BootScene extends Phaser.Scene {
  constructor(test) {
      super({
          key: 'BootScene'
      });
  }

  preload() {
      const progress = this.add.graphics();

      // Register a load progress event to show a load bar
      // this.load.on('progress', (value) => {
      //     progress.clear();
      //     progress.fillStyle(0xffffff, 1);
      //     progress.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 60);
      // });

      // Register a load complete event to launch the title screen when all files are loaded
      this.load.on('complete', () => {
          // prepare all animations, defined in a separate file
          // makeAnimations(this);
          // progress.destroy();
          makeAnimations(this);
          this.scene.start('TitleScene');
          console.log('complete!!!');
      });

      // this.load.image('background-clouds', 'assets/images/clouds.png'); // 16-bit later

      // Tilemap with a lot of objects and tile-properties tricks
      // this.load.tilemapTiledJSON('map', 'assets/tilemaps/super-mario.json');

      // I load the tiles as a spritesheet so I can use it for both sprites and tiles,
      // Normally you should load it as an image.
      // this.load.spritesheet('tiles', 'assets/images/super-mario.png', {
      //     frameWidth: 16,
      //     frameHeight: 16,
      //     spacing: 2
      // });


      //
      // this.load.bitmapFont('font', 'assets/fonts/font.png', 'assets/fonts/font.fnt');
    // TODO: Get BootScene to work correctly, for some reason this.load not working correctly
    this.scene.start('TitleScene');
    this.scene.stop('Bootscene');
  }




};

export default BootScene;
