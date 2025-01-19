let isRunning = false;

function handleFireWorks() {
  const fireworks = document.getElementById("fireworks");
  fireworks.style.display = "block";
  const canvas = document.createElement("canvas");
  canvas.id = "canvas-fireworks";
  fireworks.appendChild(canvas);
  isRunning = true;
  Firework_1();
}

function renderBtnFireWorks() {
  const container = document.createElement("div");
  container.id = "fireworks_container";

  const btn = document.createElement("button");
  btn.id = "btn_fire";
  //   add event listener
  btn.addEventListener("click", handleFireWorks);

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("images/fireworks.png");
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

//#region Fireworks 1
function Firework_1() {
  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };

  let canvas,
    ctx,
    w,
    h,
    particles = [],
    probability = 0.04,
    xPoint,
    yPoint;

  function onLoad() {
    canvas = document.getElementById("canvas-fireworks");
    ctx = canvas.getContext("2d");
    resizeCanvas();

    window.requestAnimationFrame(updateWorld);
  }

  function resizeCanvas() {
    if (canvas) {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
  }

  function updateWorld() {
    if (!isRunning) return;
    console.log("updateWorld");
    update();
    paint();
    window.requestAnimationFrame(updateWorld);
  }

  function update() {
    if (particles.length < 500 && Math.random() < probability) {
      createFirework();
    }
    let alive = [];
    for (const element of particles) {
      if (element.move()) {
        alive.push(element);
      }
    }
    particles = alive;
  }

  function paint() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (const element of particles) {
      element.draw(ctx);
    }
  }

  function createFirework() {
    xPoint = Math.random() * (w - 200) + 100;
    yPoint = Math.random() * (h - 200) + 100;
    let nFire = Math.random() * 50 + 100;
    let c =
      "rgb(" +
      ~~(Math.random() * 200 + 55) +
      "," +
      ~~(Math.random() * 200 + 55) +
      "," +
      ~~(Math.random() * 200 + 55) +
      ")";
    for (let i = 0; i < nFire; i++) {
      let particle = new Particle();
      particle.color = c;
      let vy = Math.sqrt(25 - particle.vx * particle.vx);
      if (Math.abs(particle.vy) > vy) {
        particle.vy = particle.vy > 0 ? vy : -vy;
      }
      particles.push(particle);
    }
  }

  function Particle() {
    this.w = this.h = Math.random() * 4 + 1;

    this.x = xPoint - this.w / 2;
    this.y = yPoint - this.h / 2;

    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;

    this.alpha = Math.random() * 0.5 + 0.5;
  }

  Particle.prototype = {
    gravity: 0.05,
    move: function () {
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
    },
    draw: function (c) {
      c.save();
      c.beginPath();

      c.translate(this.x + this.w / 2, this.y + this.h / 2);
      c.arc(0, 0, this.w, 0, Math.PI * 2);
      c.fillStyle = this.color;
      c.globalAlpha = this.alpha;

      c.closePath();
      c.fill();
      c.restore();
    },
  };
  onLoad();
}

function Firework_2() {
  window.requestAnimFrame = (function () {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();

  let canvas = document.getElementById("canvas-fireworks"),
    ctx = canvas.getContext("2d"),
    cw = window.innerWidth,
    ch = window.innerHeight,
    fireworks = [],
    particles = [],
    hue = 120,
    limiterTotal = 20,
    limiterTick = 0,
    timerTotal = 500,
    timerTick = 0,
    mousedown = false,
    mx,
    my;

  canvas.width = cw;
  canvas.height = ch;

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function calculateDistance(p1x, p1y, p2x, p2y) {
    let xDistance = p1x - p2x,
      yDistance = p1y - p2y;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
  }

  function Firework(sx, sy, tx, ty) {
    this.x = sx;
    this.y = sy;
    this.sx = sx;
    this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;
    this.coordinates = [];
    this.coordinateCount = 3;
    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = random(50, 70);
    this.targetRadius = 1;
  }

  // update firework
  Firework.prototype.update = function (index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);

    if (this.targetRadius < 8) {
      this.targetRadius += 0.3;
    } else {
      this.targetRadius = 1;
    }

    this.speed *= this.acceleration;

    let vx = Math.cos(this.angle) * this.speed,
      vy = Math.sin(this.angle) * this.speed;
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

  Firework.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(
      this.coordinates[this.coordinates.length - 1][0],
      this.coordinates[this.coordinates.length - 1][1]
    );
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = "hsl(" + hue + ", 100%, " + this.brightness + "%)";
    ctx.stroke();

    ctx.beginPath();
    ctx.stroke();
  };

  function Particle(x, y) {
    this.x = x;
    this.y = y;
    this.coordinates = [];
    this.coordinateCount = 5;

    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 10);
    this.friction = 0.95;
    this.gravity = 0.6;
    this.hue = random(hue - 20, hue + 20);
    this.brightness = random(50, 80);
    this.alpha = 1;
    this.decay = random(0.0075, 0.009);
  }

  Particle.prototype.update = function (index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;

    if (this.alpha <= this.decay) {
      particles.splice(index, 1);
    }
  };

  Particle.prototype.draw = function () {
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

  function createParticles(x, y) {
    let particleCount = 20;
    while (particleCount--) {
      particles.push(new Particle(x, y));
    }
  }

  function loop() {
    if (!isRunning) return;
    requestAnimFrame(loop);

    console.log("loop");

    hue += 0.5;

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = "lighter";

    let i = fireworks.length;
    while (i--) {
      fireworks[i].draw();
      fireworks[i].update(i);
    }

    let j = particles.length;
    while (j--) {
      particles[j].draw();
      particles[j].update(j);
    }

    if (timerTick >= timerTotal) {
      timerTick = 0;
    } else {
      let temp = timerTick % 400;
      if (temp <= 15) {
        fireworks.push(
          new Firework(100, ch, random(190, 200), random(90, 100))
        );
        fireworks.push(
          new Firework(
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
          new Firework(
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
        fireworks.push(new Firework(cw / 2, ch, mx, my));
        limiterTick = 0;
      }
    } else {
      limiterTick++;
    }
  }

  canvas.addEventListener("mousemove", function (e) {
    mx = e.pageX - canvas.offsetLeft;
    my = e.pageY - canvas.offsetTop;
  });

  canvas.addEventListener("mousedown", function (e) {
    e.preventDefault();
    mousedown = true;
    console.log("mousedown");
  });

  canvas.addEventListener("mouseup", function (e) {
    e.preventDefault();
    mousedown = false;
    console.log("mouseup");
  });

  loop();
}