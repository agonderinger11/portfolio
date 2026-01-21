const canvas = document.getElementById('gradient-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouseX = 0.5;
let mouseY = 0.5;
let time = 0;

const colors = [
    { r: 102, g: 126, b: 234 },  // Purple-blue
    { r: 118, g: 75, b: 162 },   // Deep purple
    { r: 240, g: 147, b: 251 },  // Pink
    { r: 245, g: 87, b: 108 },   // Coral
    { r: 79, g: 172, b: 254 },   // Sky blue
    { r: 0, g: 242, b: 254 },    // Cyan
    { r: 67, g: 233, b: 123 },   // Green
    { r: 250, g: 112, b: 154 },  // Rose
];

class Blob {
    constructor(index) {
        this.index = index;
        this.color = colors[index % colors.length];
        this.reset();
    }

    reset() {
        this.x = Math.random();
        this.y = Math.random();
        this.baseX = this.x;
        this.baseY = this.y;
        this.radius = 0.2 + Math.random() * 0.3;
        this.speed = 0.0003 + Math.random() * 0.0005;
        this.angle = Math.random() * Math.PI * 2;
        this.drift = 0.15 + Math.random() * 0.2;
        this.phaseX = Math.random() * Math.PI * 2;
        this.phaseY = Math.random() * Math.PI * 2;
    }

    update(time, mouseInfluence) {
        // Organic drifting motion using multiple sine waves
        const drift1 = Math.sin(time * this.speed + this.phaseX) * this.drift;
        const drift2 = Math.cos(time * this.speed * 0.7 + this.phaseY) * this.drift * 0.6;
        const drift3 = Math.sin(time * this.speed * 1.3 + this.phaseX * 2) * this.drift * 0.3;

        this.x = this.baseX + drift1 + drift3;
        this.y = this.baseY + drift2 + Math.sin(time * this.speed * 0.5) * this.drift * 0.4;

        // Mouse influence - blobs gently move toward or away from cursor
        const dx = mouseInfluence.x - this.x;
        const dy = mouseInfluence.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.5) {
            const force = (0.5 - dist) * 0.1;
            this.x += dx * force * 0.3;
            this.y += dy * force * 0.3;
        }

        // Wrap around edges smoothly
        if (this.x < -0.3) this.baseX += 1.6;
        if (this.x > 1.3) this.baseX -= 1.6;
        if (this.y < -0.3) this.baseY += 1.6;
        if (this.y > 1.3) this.baseY -= 1.6;
    }

    draw(ctx, width, height) {
        const x = this.x * width;
        const y = this.y * height;
        const r = this.radius * Math.max(width, height);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`);
        gradient.addColorStop(0.4, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.4)`);
        gradient.addColorStop(0.7, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.1)`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

const blobs = [];
for (let i = 0; i < 8; i++) {
    blobs.push(new Blob(i));
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / width;
    mouseY = e.clientY / height;
});

function animate() {
    time++;

    // Dark background with slight fade for trail effect
    ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
    ctx.fillRect(0, 0, width, height);

    // Set blend mode for color mixing
    ctx.globalCompositeOperation = 'lighter';

    const mouseInfluence = { x: mouseX, y: mouseY };

    for (const blob of blobs) {
        blob.update(time, mouseInfluence);
        blob.draw(ctx, width, height);
    }

    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(animate);
}

animate();
