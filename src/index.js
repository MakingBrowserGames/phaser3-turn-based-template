
// Be sure to include in final build, using CDN for now until I figure out how to split code in webpack
// import 'phaser';
import TBS from './scenes/game';


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
      TBS
    ],
    pixelArt: true,
    zoom: 2.5
};


const game = new Phaser.Game(config);
