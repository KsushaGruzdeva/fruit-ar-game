window.score = 0;
window.gameState = 'playing';

// СПАВН ОБЪЕКТОВ
AFRAME.registerComponent('spawner', {
  init: function () {
    this.timer = 0;
  },

  tick: function (time, delta) {
    if (window.gameState !== 'playing') return;

    this.timer += delta;

    if (this.timer > 1500) {
      this.spawnObject();
      this.timer = 0;
    }
  },

  spawnObject: function () {
    let scene = this.el.sceneEl;

    let isBomb = Math.random() < 0.2;

    let obj = document.createElement('a-entity');

    let x = (Math.random() - 0.5) * 8;

    obj.setAttribute('position', `${x} 1 -5`);

    obj.setAttribute('animation', {
      property: 'position',
      to: `${x} 4 -3`,
      dur: 2000
    });

    if (isBomb) {
      obj.setAttribute('gltf-model', '#bombModel');
      obj.setAttribute('class', 'bomb');
    } else {
      obj.setAttribute('gltf-model', '#fruitModel');
      obj.setAttribute('class', 'fruit');
    }

    obj.setAttribute('scale', '0.5 0.5 0.5');

    scene.appendChild(obj);

    // если не разрезал — проигрыш
    setTimeout(() => {
      if (obj.parentNode && window.gameState === 'playing') {
        obj.parentNode.removeChild(obj);
        endGame();
      }
    }, 2500);
  }
});

// ЭФФЕКТ РАЗРЕЗА
function sliceEffect(pos) {
  let scene = document.querySelector('a-scene');

  for (let i = 0; i < 6; i++) {
    let part = document.createElement('a-sphere');

    part.setAttribute('radius', '0.1');
    part.setAttribute('color', 'red');
    part.setAttribute('position', pos);

    part.setAttribute('animation__move', {
      property: 'position',
      to: `${pos.x + (Math.random()-0.5)*2} ${pos.y + Math.random()*2} ${pos.z}`,
      dur: 800
    });

    part.setAttribute('animation__fade', {
      property: 'material.opacity',
      to: 0,
      dur: 800
    });

    scene.appendChild(part);

    setTimeout(() => {
      if (part.parentNode) part.parentNode.removeChild(part);
    }, 800);
  }
}

// РЕЗКА
AFRAME.registerComponent('cutter', {
  init: function () {
    window.addEventListener('click', this.cut.bind(this));
    window.addEventListener('touchstart', this.cut.bind(this));
  },

  cut: function () {
    if (window.gameState !== 'playing') return;

    let raycaster = document.querySelector('#cursor').components.raycaster;
    let hits = raycaster.intersectedEls;

    if (hits.length > 0) {
      let target = hits[0];

      if (target.classList.contains('fruit')) {
        sliceEffect(target.object3D.position);

        window.score++;
        document.querySelector('#scoreText')
          .setAttribute('value', 'Score: ' + window.score);

        document.querySelector('#sliceSound').play();

        target.parentNode.removeChild(target);
      }

      if (target.classList.contains('bomb')) {
        document.querySelector('#boomSound').play();
        endGame();
      }
    }
  }
});

// КОНЕЦ ИГРЫ
function endGame() {
  window.gameState = 'gameover';

  document.querySelector('#gameOverText')
    .setAttribute('value', 'GAME OVER\nScore: ' + window.score);
}