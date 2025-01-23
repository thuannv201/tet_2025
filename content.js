let isRunning = false;

function handleFireWorks() {
  const fireworks = document.getElementById("fireworks");
  fireworks.style.display = "block";
  const canvas = document.createElement("canvas");
  canvas.id = "canvas-fireworks";
  fireworks.appendChild(canvas);
  isRunning = true;
  Firework();
}

function renderBtnFireWorks() {
  const container = document.createElement("div");
  container.id = "fireworks_container";

  const btn = document.createElement("button");
  btn.id = "btn_fire";
  //   add event listener
  btn.addEventListener("click", handleFireWorks);

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("images/fireworks.gif");
  img.alt = "img";

  btn.appendChild(img);
  container.appendChild(btn);
  document.body.appendChild(container);
}

function render() {
  renderBtnFireWorks();
  const fireworks = document.createElement("div");
  fireworks.id = "fireworks";
  fireworks.style.display = "none";
  const btnClose = document.createElement("button");
  btnClose.id = "btn_close";
  btnClose.innerHTML = "Close";
  btnClose.addEventListener("click", () => {
    const canvas = document.getElementById("canvas-fireworks");
    canvas.remove();
    fireworks.style.display = "none";
    isRunning = false; // Stop the loop
  });
  fireworks.appendChild(btnClose);
  document.body.appendChild(fireworks);
}

window.onload = function () {
  render();
};

function Firework() {
  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };

  const canvas = document.getElementById("canvas-fireworks");
  const ctx = canvas.getContext("2d");
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
  let particles1 = [];
  let particles2 = [];
  let fireworks = [];
  const hue = 120;
  const probability = 0.04; // For Firework_1
  let timerTick = 0;
  const timerTotal = 500;
  let limiterTick = 0;
  const limiterTotal = 20;
  let mousedown = false;
  let mx, my;

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function calculateDistance(p1x, p1y, p2x, p2y) {
    return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
  }

  function createParticles(x, y) {
    for (let i = 0; i < 20; i++) {
      particles2.push(new Particle2(x, y));
    }
  }

  function Firework2(sx, sy, tx, ty) {
    this.x = sx;
    this.y = sy;
    this.sx = sx;
    this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;
    this.coordinates = Array.from({ length: 3 }, () => [this.x, this.y]);
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = random(50, 70);
    this.targetRadius = 1;
  }

  Firework2.prototype.update = function (index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);

    this.speed *= this.acceleration;
    let vx = Math.cos(this.angle) * this.speed;
    let vy = Math.sin(this.angle) * this.speed;

    this.distanceTraveled = calculateDistance(
      this.sx,
      this.sy,
      this.x + vx,
      this.y + vy
    );

    if (this.distanceTraveled >= this.distanceToTarget) {
      createParticles(this.tx, this.ty);
      fireworks.splice(index, 1);
    } else {
      this.x += vx;
      this.y += vy;
    }
  };

  Firework2.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(
      this.coordinates[this.coordinates.length - 1][0],
      this.coordinates[this.coordinates.length - 1][1]
    );
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = "hsl(" + hue + ", 100%, " + this.brightness + "%)";
    ctx.stroke();
  };

  function Particle2(x, y) {
    this.x = x;
    this.y = y;
    this.coordinates = Array.from({ length: 5 }, () => [this.x, this.y]);
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 10);
    this.friction = 0.95;
    this.gravity = 0.6;
    this.hue = random(hue - 20, hue + 20);
    this.brightness = random(50, 80);
    this.alpha = 1;
    this.decay = random(0.0075, 0.009);
  }

  Particle2.prototype.update = function (index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;

    if (this.alpha <= this.decay) {
      particles2.splice(index, 1);
    }
  };

  Particle2.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(
      this.coordinates[this.coordinates.length - 1][0],
      this.coordinates[this.coordinates.length - 1][1]
    );
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle =
      "hsla(" +
      this.hue +
      ", 100%, " +
      this.brightness +
      "%, " +
      this.alpha +
      ")";
    ctx.stroke();
  };

  function Particle1(x, y, color) {
    this.w = this.h = Math.random() * 4 + 1;
    this.x = x - this.w / 2;
    this.y = y - this.h / 2;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.color = color;
    this.alpha = Math.random() * 0.5 + 0.5;
    this.gravity = 0.05;
  }

  Particle1.prototype.move = function () {
    this.x += this.vx;
    this.vy += this.gravity;
    this.y += this.vy;
    this.alpha -= 0.01;
    return !(
      this.x <= -this.w ||
      this.x >= screen.width ||
      this.y >= screen.height ||
      this.alpha <= 0
    );
  };

  Particle1.prototype.draw = function (c) {
    c.save();
    c.beginPath();
    c.translate(this.x + this.w / 2, this.y + this.h / 2);
    c.arc(0, 0, this.w, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.globalAlpha = this.alpha;
    c.closePath();
    c.fill();
    c.restore();
  };

  function createFirework1() {
    const xPoint = Math.random() * (cw - 200) + 100;
    const yPoint = Math.random() * (ch - 200) + 100;
    const nFire = Math.random() * 50 + 100;
    const c =
      "rgb(" +
      ~~(Math.random() * 200 + 55) +
      "," +
      ~~(Math.random() * 200 + 55) +
      "," +
      ~~(Math.random() * 200 + 55) +
      ")";
    for (let i = 0; i < nFire; i++) {
      let particle = new Particle1(xPoint, yPoint, c);
      let vy = Math.sqrt(25 - particle.vx * particle.vx);
      if (Math.abs(particle.vy) > vy) {
        particle.vy = particle.vy > 0 ? vy : -vy;
      }
      particles1.push(particle);
    }
  }

  function updateFireworks() {
    if (!isRunning) return;

    // Update Firework_1
    if (particles1.length < 500 && Math.random() < probability) {
      createFirework1();
    }
    particles1 = particles1.filter((p) => p.move());

    // Update Firework_2
    let i = fireworks.length;
    while (i--) {
      fireworks[i].draw();
      fireworks[i].update(i);
    }

    let j = particles2.length;
    while (j--) {
      particles2[j].draw();
      particles2[j].update(j);
    }

    // Handle Firework_2 creation
    if (timerTick >= timerTotal) {
      timerTick = 0;
    } else {
      let temp = timerTick % 400;
      if (temp <= 15) {
        fireworks.push(
          new Firework2(100, ch, random(190, 200), random(90, 100))
        );
        fireworks.push(
          new Firework2(
            cw - 100,
            ch,
            random(cw - 200, cw - 190),
            random(90, 100)
          )
        );
      }
      let temp3 = temp / 10;
      if (temp > 319) {
        fireworks.push(
          new Firework2(
            300 + (temp3 - 31) * 100,
            ch,
            300 + (temp3 - 31) * 100,
            200
          )
        );
      }
      timerTick++;
    }

    if (limiterTick >= limiterTotal) {
      if (mousedown) {
        fireworks.push(new Firework2(cw / 2, ch, mx, my));
        limiterTick = 0;
      }
    } else {
      limiterTick++;
    }

    // Draw Firework_1
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = "lighter";
    for (const particle of particles1) {
      particle.draw(ctx);
    }

    requestAnimationFrame(updateFireworks);
  }

  canvas.addEventListener("mousemove", function (e) {
    mx = e.pageX - canvas.offsetLeft;
    my = e.pageY - canvas.offsetTop;
  });

  canvas.addEventListener("mousedown", function (e) {
    e.preventDefault();
    mousedown = true;
  });

  canvas.addEventListener("mouseup", function (e) {
    e.preventDefault();
    mousedown = false;
  });

  updateFireworks();
}
