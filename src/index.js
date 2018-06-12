import 'phaser';
import Game from './scenes';


const config = {
    // For more settings see <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
    type: Phaser.WEBGL,
    width: 16*20,
    height: 16*20,
    parent: 'game',
    scene: [
      Game
    ],
    pixelArt: true,
    zoom: 3
};


const game = new Phaser.Game(config);
