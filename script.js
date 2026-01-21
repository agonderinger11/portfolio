const canvas = document.getElementById('gradient-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouseX = 0.5;
let mouseY = 0.5;
let time = 0;

// Dark green code-themed palette
const colors = [
    { r: 0, g: 255, b: 136 },    // Matrix green
    { r: 16, g: 185, b: 129 },   // Emerald
    { r: 34, g: 197, b: 94 },    // Green 500
    { r: 74, g: 222, b: 128 },   // Green 400
    { r: 20, g: 184, b: 166 },   // Teal
    { r: 45, g: 212, b: 191 },   // Teal 400
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
        this.vx = 0;
        this.vy = 0;
        this.radius = 0.25 + Math.random() * 0.2;
        this.speed = 0.0005 + Math.random() * 0.0003;
        this.drift = 0.08 + Math.random() * 0.06;
        this.phaseX = Math.random() * Math.PI * 2;
        this.phaseY = Math.random() * Math.PI * 2;
        this.mass = 0.5 + Math.random() * 0.5;
    }

    applyForce(fx, fy) {
        this.vx += fx / this.mass;
        this.vy += fy / this.mass;
    }

    update(time, mouseInfluence) {
        // Apply velocity with friction
        const friction = 0.97;
        this.vx *= friction;
        this.vy *= friction;

        // Apply velocity to base position
        this.baseX += this.vx;
        this.baseY += this.vy;

        // Smooth organic drifting motion
        const drift1 = Math.sin(time * this.speed + this.phaseX) * this.drift;
        const drift2 = Math.cos(time * this.speed * 0.6 + this.phaseY) * this.drift;

        this.x = this.baseX + drift1;
        this.y = this.baseY + drift2;

        // Gentle mouse attraction
        const dx = mouseInfluence.x - this.x;
        const dy = mouseInfluence.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.4 && dist > 0.01) {
            const force = (0.4 - dist) * 0.02;
            this.baseX += dx * force;
            this.baseY += dy * force;
        }

        // Wrap around edges
        if (this.baseX < -0.3) this.baseX += 1.6;
        if (this.baseX > 1.3) this.baseX -= 1.6;
        if (this.baseY < -0.3) this.baseY += 1.6;
        if (this.baseY > 1.3) this.baseY -= 1.6;
    }

    draw(ctx, width, height) {
        const x = this.x * width;
        const y = this.y * height;
        const r = this.radius * Math.min(width, height);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.4)`);
        gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.15)`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

const blobs = [];
for (let i = 0; i < 6; i++) {
    blobs.push(new Blob(i));
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    // Clear to dark background on resize
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);
}

window.addEventListener('resize', resize);
resize();

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / width;
    mouseY = e.clientY / height;
});

// Wind gust on click
function applyWindGust(clickX, clickY) {
    for (const blob of blobs) {
        const dx = blob.x - clickX;
        const dy = blob.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.001) continue;

        const maxDist = 1.2;
        const normalizedDist = Math.min(dist, maxDist) / maxDist;
        const forceMagnitude = (1 - normalizedDist) * 0.08;

        const forceX = (dx / dist) * forceMagnitude;
        const forceY = (dy / dist) * forceMagnitude;

        blob.applyForce(forceX, forceY);
    }
}

canvas.addEventListener('click', (e) => {
    applyWindGust(e.clientX / width, e.clientY / height);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    applyWindGust(touch.clientX / width, touch.clientY / height);
}, { passive: false });

function animate() {
    time++;

    // Fade to dark background - GitHub dark theme color
    ctx.fillStyle = 'rgba(13, 17, 23, 0.08)';
    ctx.fillRect(0, 0, width, height);

    const mouseInfluence = { x: mouseX, y: mouseY };

    // Draw blobs with screen blend for soft glow
    ctx.globalCompositeOperation = 'screen';

    for (const blob of blobs) {
        blob.update(time, mouseInfluence);
        blob.draw(ctx, width, height);
    }

    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(animate);
}

animate();
