
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
    resize();
    window.addEventListener('resize', resize);

function randColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 60%)`;
}
class Particle {
    constructor(x, y, color, angle, velocity) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.size = Math.random() * 1.5 + 1.5;
      this.vx = Math.cos(angle) * velocity + (Math.random() - 0.5) * 0.5;
      this.vy = Math.sin(angle) * velocity + (Math.random() - 0.5) * 0.5;
      this.gravity = 0.045;
      this.alpha = 1;
      this.decay = Math.random() * 0.012 + 0.008;
      this.drag = 0.985;      
    }
    update() {
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x  += this.vx;
      this.y  += this.vy;
      this.alpha -= this.decay; 
    }
    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }

    get dead() {
      return this.alpha <= 0;
    }
  }

  class Firework {
    constructor(x, targetY) {
      this.x = x;
      this.y = canvas.height;
      this.targetY = targetY;
      this.vy = -(Math.random() * 4 + 16);
      this.exploded = false;
      this.color = randColor();
      this.trail = [];
    }

    update(particles) {
      this.trail.push({ x: this.x, y: this.y});
      if (this.trail.length > 6) this.trail.shift();

      this.vy += 0.13;
      this.y += this.vy;
      
      if (this.y <= this.targetY) {
        this.explode(particles);
        this.exploded = true;
      }
    }

    explode(particles) {
      const count = 60 + Math.floor(Math.random() * 50);
      const color = this.color;
      const velocity = Math.random() * 5 + 7;
      for (let i = 0; i < count; i++) {
        const angle = (i * Math.PI * 2) / count;
        particles.push(new Particle(this.x, this.y, color, angle, velocity * Math.random()));
      }
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push(new Particle(this.x, this.y, color, angle, velocity * Math.random()));
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.trail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.restore();
    }
  }
  let fireworks = [];
  let particles = [];

  function launchFirework(x) {
    const targetY = Math.random() * canvas.height * 0.5 + canvas.height * 0.1;
    fireworks.push(new Firework(x || Math.random() * canvas.width, targetY));
  }
  canvas.addEventListener('click' , (e) => launchFirework(e.clientX));
  canvas.addEventListener('touchstart' , (e) => {
    launchFirework(e.touches[0].clientX);
  });

  setInterval(() => {
    if (Math.random() < 0.6) launchFirework();
  }, 400);

  function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = 'rgba(74, 14, 46, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks = fireworks.filter(fw => !fw.exploded);
    fireworks.forEach(fw => {
      fw.update(particles);
      fw.draw(ctx);
    });
    
    particles = particles.filter(p => !p.dead);
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });
  }

  launchFirework();
  setTimeout(() => launchFirework(), 400);

  animate();