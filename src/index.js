
// Be sure to include in final build, using CDN for now until I figure out how to split code in webpack
// import 'phaser';
import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import TBS from './scenes/TBS';



const config = {
    // For more settings see <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
    type: Phaser.WEBGL,
    physics: {
      default: 'arcade',
    },
    width: 16*20,
    height: 16*20,
    parent: 'game',
    scene: [
      BootScene,
      TitleScene,
      TBS
    ],
    pixelArt: true,
    zoom: 2.5,
    backgroundColor: '#3F7CB6',
};


const game = new Phaser.Game(config);
