/* global Phaser */
(() => {
  'use strict';

  const WIDTH = 480;
  const HEIGHT = 760;
  const COLORS = {
    bg: 0x211e39,
    floor: 0x343052,
    cream: 0xfff8ec,
    yellow: 0xffd166,
    pink: 0xff6b9d,
    mint: 0x7ce7c5,
    blue: 0x82b8ff,
    dark: 0x25213e
  };

  class GameScene extends Phaser.Scene {
    constructor() {
      super('Game');
      this.level = 0;
      this.completed = false;
      this.doorOpen = false;
      this.doorX = 240;
      this.doorY = 240;
      this.moves = 0;
    }

    create() {
      this.paintBackground();
      this.title = this.add.text(WIDTH / 2, 42, 'ОЙ, НЕ ТУДА!', {
        fontFamily: 'Trebuchet MS, system-ui, sans-serif', fontSize: '28px',
        fontStyle: 'bold', color: '#ffd166', stroke: '#17152b', strokeThickness: 5
      }).setOrigin(0.5);
      this.levelText = this.add.text(WIDTH / 2, 82, '', {
        fontFamily: 'Trebuchet MS, system-ui, sans-serif', fontSize: '18px',
        fontStyle: 'bold', color: '#fff8ec'
      }).setOrigin(0.5);
      this.instruction = this.add.text(WIDTH / 2, 128, '', {
        fontFamily: 'Trebuchet MS, system-ui, sans-serif', fontSize: '17px',
        color: '#e3def8', align: 'center', wordWrap: { width: 390 }, lineSpacing: 5
      }).setOrigin(0.5);
      this.world = this.add.container(0, 0);
      this.player = this.add.container(WIDTH / 2, 600);
      this.drawPlayer();
      this.message = this.add.text(WIDTH / 2, 690, 'Коснись предмета, чтобы проверить его', {
        fontFamily: 'Trebuchet MS, system-ui, sans-serif', fontSize: '14px',
        color: '#bcb7d8', align: 'center', wordWrap: { width: 410 }
      }).setOrigin(0.5);
      this.startLevel(0);
      this.input.on('pointerdown', pointer => this.handleTap(pointer.x, pointer.y));
      this.scale.on('resize', () => this.scale.refresh());
    }

    paintBackground() {
      this.cameras.main.setBackgroundColor(COLORS.bg);
      const g = this.add.graphics();
      g.fillStyle(0x2b2747, 1);
      g.fillRoundedRect(18, 160, 444, 535, 24);
      g.fillStyle(COLORS.floor, 1);
      g.fillRoundedRect(32, 174, 416, 507, 18);
      g.lineStyle(2, 0x474163, 0.8);
      for (let y = 220; y < 675; y += 64) {
        g.lineBetween(42, y, 438, y);
      }
      for (let x = 90; x < 440; x += 64) {
        g.lineBetween(x, 184, x, 674);
      }
      g.fillStyle(0x17152b, 0.35);
      g.fillCircle(66, 200, 13);
      g.fillCircle(414, 646, 18);
    }

    drawPlayer() {
      const shadow = this.add.ellipse(0, 25, 78, 22, 0x17152b, 0.35);
      const body = this.add.ellipse(0, 0, 68, 62, COLORS.yellow);
      body.setStrokeStyle(4, 0xffe8a3);
      const eyeL = this.add.circle(-14, -7, 5, COLORS.dark);
      const eyeR = this.add.circle(14, -7, 5, COLORS.dark);
      const cheekL = this.add.circle(-24, 7, 5, COLORS.pink, 0.75);
      const cheekR = this.add.circle(24, 7, 5, COLORS.pink, 0.75);
      const smile = this.add.arc(0, 7, 12, 15, 35, 145, false, COLORS.dark).setStrokeStyle(3, COLORS.dark);
      this.player.add([shadow, body, eyeL, eyeR, cheekL, cheekR, smile]);
    }

    clearWorld() {
      this.world.removeAll(true);
      this.world.setDepth(2);
    }

    startLevel(level) {
      this.level = level;
      this.completed = false;
      this.doorOpen = false;
      this.moves = 0;
      this.doorX = 240;
      this.doorY = 240;
      this.player.setPosition(WIDTH / 2, 600);
      this.clearWorld();
      this.levelText.setText('УРОВЕНЬ ' + (level + 1));
      const label = document.getElementById('level-label');
      if (label) label.textContent = 'Уровень ' + (level + 1);
      this.message.setColor('#bcb7d8');
      this.message.setText('Коснись предмета, чтобы проверить его');
      if (level === 0) {
        this.instruction.setText('Найди выход. Тут всё честно. Наверное.');
        this.drawDoor(240, 245);
        this.drawSign(240, 365, 'ВЫХОД');
      } else if (level === 1) {
        this.instruction.setText('Дверь какая-то нервная. Доберись до выхода!');
        this.drawDoor(240, 245);
        this.drawButton(240, 465, 'ЗАМОРОЗИТЬ', COLORS.blue, 'freeze');
        this.drawSign(240, 365, 'НЕ УБЕГАЙ!');
      } else {
        this.instruction.setText('НЕ НАЖИМАЙ КРАСНУЮ КНОПКУ. Это очень важно.');
        this.drawDoor(240, 245, true);
        this.drawButton(240, 465, 'НЕ НАЖИМАТЬ', COLORS.pink, 'red');
        this.drawSign(240, 365, 'СЛУШАЙСЯ ИГРУ');
      }
    }

    drawDoor(x, y, locked = false) {
      const group = this.add.container(x, y);
      const g = this.add.graphics();
      g.fillStyle(0x17152b, 0.3);
      g.fillRoundedRect(-51, -60, 102, 125, 12);
      g.fillStyle(locked ? 0x77718d : 0x7ce7c5, 1);
      g.fillRoundedRect(-45, -66, 90, 124, 12);
      g.fillStyle(0x25213e, 1);
      g.fillRoundedRect(-31, -51, 62, 109, 8);
      g.fillStyle(locked ? 0xff6b9d : 0xffd166, 1);
      g.fillCircle(20, 6, 5);
      group.add(g);
      group.setSize(112, 140);
      group.setInteractive(new Phaser.Geom.Rectangle(-56, -72, 112, 144), Phaser.Geom.Rectangle.Contains);
      group.setData('kind', 'door');
      group.setData('locked', locked);
      this.world.add(group);
      this.door = group;
      this.doorX = x;
      this.doorY = y;
      return group;
    }

    drawButton(x, y, label, color, kind) {
      const group = this.add.container(x, y);
      const g = this.add.graphics();
      g.fillStyle(0x17152b, 0.35);
      g.fillRoundedRect(-101, -31, 202, 68, 16);
      g.fillStyle(color, 1);
      g.fillRoundedRect(-105, -38, 210, 68, 16);
      g.lineStyle(3, 0xffffff, 0.38);
      g.strokeRoundedRect(-105, -38, 210, 68, 16);
      group.add(g);
      group.add(this.add.text(0, -4, label, {
        fontFamily: 'Trebuchet MS, system-ui, sans-serif', fontSize: '17px',
        fontStyle: 'bold', color: '#25213e', align: 'center'
      }).setOrigin(0.5));
      group.setSize(220, 82);
      group.setInteractive(new Phaser.Geom.Rectangle(-110, -42, 220, 84), Phaser.Geom.Rectangle.Contains);
      group.setData('kind', kind);
      this.world.add(group);
    }

    drawSign(x, y, label) {
      const sign = this.add.text(x, y, label, {
        fontFamily: 'Trebuchet MS, system-ui, sans-serif', fontSize: '15px',
        fontStyle: 'bold', color: '#fff8ec', backgroundColor: '#25213e',
        padding: { x: 14, y: 8 }
      }).setOrigin(0.5);
      this.world.add(sign);
    }

    handleTap(x, y) {
      if (this.completed) {
        this.startLevel(this.level === 2 ? 0 : this.level + 1);
        return;
      }

      // Level 1: the exit works exactly as advertised.
      if (this.level === 0) {
        if (this.inDoorArea(x, y)) this.winLevel('Ого. На первом уровне игра почти честная!');
        else this.movePlayer(x, y);
        return;
      }

      // Level 2: the door runs away until the blue button is pressed.
      if (this.level === 1) {
        if (this.inButtonArea(x, y)) {
          this.doorOpen = true;
          this.message.setText('Дверь больше не убегает. Теперь попробуй её!');
          this.message.setColor('#82b8ff');
          this.tweens.add({ targets: this.world.getAll().filter(o => o.getData && o.getData('kind') === 'door'), scaleX: 1.08, scaleY: 1.08, duration: 160, yoyo: true });
          return;
        }
        if (this.inDoorArea(x, y)) {
          if (!this.doorOpen) {
            const nx = Phaser.Math.Between(105, 375);
            this.door.setPosition(nx, Phaser.Math.Between(210, 300));
            this.doorX = this.door.x;
            this.doorY = this.door.y;
            this.message.setText('Ха! Дверь убежала. Может, сначала что-нибудь нажать?');
            this.message.setColor('#ff6b9d');
          } else {
            this.winLevel('Ты поймал дверь! Хорошая работа.');
          }
          return;
        }
        this.movePlayer(x, y);
        return;
      }

      // Level 3: the forbidden red button is the solution.
      if (this.level === 2) {
        if (this.inButtonArea(x, y)) {
          this.doorOpen = true;
          this.instruction.setText('...Ты нажал её. Ну ладно, сработало.');
          this.message.setText('Иногда лучший способ — не слушаться 😈');
          this.message.setColor('#ffd166');
          this.drawSparkles();
          return;
        }
        if (this.inDoorArea(x, y)) {
          if (this.doorOpen) this.winLevel('Ты не послушался — и победил!');
          else {
            this.message.setText('Дверь заперта. Может, дело в той кнопке?');
            this.message.setColor('#ff6b9d');
          }
          return;
        }
        this.movePlayer(x, y);
      }
    }

    inDoorArea(x, y) {
      return Math.abs(x - this.doorX) < 65 && Math.abs(y - this.doorY) < 82;
    }

    inButtonArea(x, y) {
      return Math.abs(x - 240) < 125 && Math.abs(y - 465) < 58;
    }

    movePlayer(x, y) {
      const targetX = Phaser.Math.Clamp(x, 65, 415);
      const targetY = Phaser.Math.Clamp(y, 520, 645);
      this.tweens.add({
        targets: this.player, x: targetX, y: targetY, duration: 260, ease: 'Back.Out',
        onComplete: () => {
          this.tweens.add({ targets: this.player, y: targetY - 8, duration: 100, yoyo: true });
        }
      });
    }

    drawSparkles() {
      for (let i = 0; i < 12; i += 1) {
        const x = Phaser.Math.Between(70, 410);
        const y = Phaser.Math.Between(185, 340);
        const star = this.add.text(x, y, ['✦', '✧', '★'][i % 3], {
          fontSize: Phaser.Math.Between(16, 30) + 'px', color: '#ffd166'
        }).setOrigin(0.5);
        this.world.add(star);
        this.tweens.add({ targets: star, y: y - 35, alpha: 0, duration: 850, onComplete: () => star.destroy() });
      }
    }

    winLevel(line) {
      this.completed = true;
      this.message.setText(line);
      this.message.setColor('#7ce7c5');
      this.instruction.setText('УРОВЕНЬ ПРОЙДЕН!');
      this.player.setDepth(10);
      this.tweens.add({
        targets: this.player, x: this.doorX, y: this.doorY + 28, duration: 500, ease: 'Back.InOut',
        onComplete: () => {
          this.player.setScale(0.25);
          this.tweens.add({ targets: this.player, alpha: 0, duration: 180 });
          this.showContinue();
        }
      });
    }

    showContinue() {
      const label = this.level === 2 ? 'ИГРАТЬ СНОВА' : 'СЛЕДУЮЩИЙ УРОВЕНЬ';
      const group = this.add.container(WIDTH / 2, 550);
      const g = this.add.graphics();
      g.fillStyle(COLORS.mint, 1);
      g.fillRoundedRect(-135, -31, 270, 62, 16);
      group.add(g);
      group.add(this.add.text(0, 0, label, {
        fontFamily: 'Trebuchet MS, system-ui, sans-serif', fontSize: '16px',
        fontStyle: 'bold', color: '#25213e'
      }).setOrigin(0.5));
      group.setSize(280, 70);
      group.setInteractive(new Phaser.Geom.Rectangle(-140, -35, 280, 70), Phaser.Geom.Rectangle.Contains);
      group.on('pointerdown', () => this.startLevel(this.level === 2 ? 0 : this.level + 1));
      this.world.add(group);
      this.saveProgress(this.level + 1);
    }

    saveProgress(completedLevels) {
      try {
        const old = Number(localStorage.getItem('oops-not-there-progress') || 0);
        localStorage.setItem('oops-not-there-progress', String(Math.max(old, completedLevels)));
      } catch (_) {
        // Private browsing can disable storage; the game remains playable.
      }
    }
  }

  window.addEventListener('load', () => {
    if (!window.Phaser) {
      document.getElementById('game').innerHTML = '<p style="padding:24px;text-align:center">Не удалось загрузить игровой движок. Проверь подключение к интернету и обнови страницу.</p>';
      return;
    }
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: WIDTH,
      height: HEIGHT,
      backgroundColor: '#211e39',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: WIDTH,
        height: HEIGHT
      },
      input: { activePointers: 2 },
      render: { antialias: true, pixelArt: false },
      scene: [GameScene]
    });
    window.oopsNotThereGame = game;
  });
})();