import makeAnimations from '../animations/heroAnimations';

class TitleScene extends Phaser.Scene {
    constructor(test) {
        super({
            key: 'TitleScene'
        });
    }
    preload() {
      // Load female and male heroes
      this.load.atlas('maleHero', '../assets/images/maleHero.png', '../assets/images/player.json');
      this.load.atlas('femaleHero', '../assets/images/femaleHero.png', '../assets/images/player.json');

      this.load.image('menuBrown', '../assets/images/menuBrown.png');
      this.load.image('menuTan', '../assets/images/menuTan.png');
      this.load.image('menuGray', '../assets/images/menuGray.png');
      this.load.image('selector1', '../assets/images/selector1.png');
      this.load.image('selector2', '../assets/images/selector2.png');


    }


    create() {
      var menuBrown;
      var menuTan1;
      var menuTan2;
      var menuMale;
      var menuFemale;
      var menuGray1;
      var menuGray2;
      var selector1;
      var selector2;

      this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);


      menuBrown = this.add.image(10, 80, 'menuBrown');
      menuBrown.setOrigin(0,0);

      menuTan1 = this.add.image(30, 130, 'menuTan');
      menuTan1.setOrigin(0,0);
      menuTan2 = this.add.image(170, 130, 'menuTan');
      menuTan2.setOrigin(0,0);

      menuMale = this.add.sprite(65, 160, 'maleHero');
      menuMale.setOrigin(0,0);
      menuMale.scaleX = 3.5;
      menuMale.scaleY = 3.5;

      menuFemale = this.add.sprite(205, 160, 'femaleHero');
      menuFemale.setOrigin(0,0);
      menuFemale.scaleX = 3.5;
      menuFemale.scaleY = 3.5;

      menuGray1 = this.add.sprite(30, 260, 'menuGray');
      menuGray1.setOrigin(0,0);
      menuGray2 = this.add.sprite(170, 260, 'menuGray');
      menuGray2.setOrigin(0,0);
      console.log(menuGray2.getBounds());


      this.input.on('pointerup', this.handleClick);

      var titleText1 = this.add.text(45, 35, 'Turn Based Strategy with Phaser 3', {fontSize: '12px', fill: '#FFF'});
      var titleText2 = this.add.text(100, 105, 'Select your character', {fontSize: '10px', fill: '#FFF'});
      var owenText = this.add.text(75, 275, 'Owen', {fontSize: '10px', fill: '#FFF'});
      var maryText = this.add.text(215, 275, 'Mary', {fontSize: '10px', fill: '#FFF'});

    }

    update() {

    }

    handleClick (pointer) {
      var x = pointer.position.x;
      var y = pointer.position.y;

      if ((x > 30) && (x < 146) && (y > 260) && (y < 297)) {
        this.scene.registry.set('charSelection', 'male');
        this.scene.startGame();

      }

      if ((x > 170) && (x < 286) && (y > 260) && (y < 297)) {
        this.scene.registry.set('charSelection', 'female');
        this.scene.startGame();
      }
    }

    startGame() {
        this.scene.start('TBS');
    }
}

export default TitleScene;
