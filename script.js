const canvas = document.getElementById('gradient-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let time = 0;
let scrollX = 0;
const scrollSpeed = 3;

// Terrain points
let terrain = [];
const terrainSegmentWidth = 20;

// Snowflakes
let snowflakes = [];
const numSnowflakes = 150;

// Background mountains
let mountains = [];
let farMountains = [];

// Trees
let trees = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initTerrain();
    initMountains();
    initSnowflakes();
    initTrees();
}

// Generate terrain height using layered sine waves
function getTerrainHeight(x) {
    const baseHeight = height * 0.6;
    const h1 = Math.sin(x * 0.003) * 80;
    const h2 = Math.sin(x * 0.007 + 1) * 40;
    const h3 = Math.sin(x * 0.015 + 2) * 20;
    const h4 = Math.sin(x * 0.002) * 100;
    return baseHeight + h1 + h2 + h3 + h4;
}

function initTerrain() {
    terrain = [];
    const numPoints = Math.ceil(width / terrainSegmentWidth) + 50;
    for (let i = 0; i < numPoints; i++) {
        const x = i * terrainSegmentWidth;
        terrain.push({ x, y: getTerrainHeight(x) });
    }
}

function initMountains() {
    // Far mountains
    farMountains = [];
    for (let i = 0; i < 8; i++) {
        farMountains.push({
            x: i * (width / 4) - 100,
            width: 300 + Math.random() * 200,
            height: 150 + Math.random() * 100
        });
    }

    // Near mountains
    mountains = [];
    for (let i = 0; i < 6; i++) {
        mountains.push({
            x: i * (width / 3) - 50,
            width: 400 + Math.random() * 200,
            height: 200 + Math.random() * 100
        });
    }
}

function initSnowflakes() {
    snowflakes = [];
    for (let i = 0; i < numSnowflakes; i++) {
        snowflakes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 3,
            speedY: 0.5 + Math.random() * 1.5,
            speedX: -0.5 + Math.random() * 1,
            opacity: 0.5 + Math.random() * 0.5
        });
    }
}

function initTrees() {
    trees = [];
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * width * 2;
        trees.push({
            x,
            baseY: getTerrainHeight(x) - 5,
            height: 40 + Math.random() * 60,
            width: 20 + Math.random() * 20
        });
    }
}

// Draw sky gradient
function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#B0E0E6');
    gradient.addColorStop(1, '#E0F4FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

// Draw mountains
function drawMountains() {
    // Far mountains (darker, slower parallax)
    ctx.fillStyle = '#6B7B8C';
    for (const m of farMountains) {
        const x = ((m.x - scrollX * 0.1) % (width * 1.5)) - 200;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.5);
        ctx.lineTo(x + m.width / 2, height * 0.5 - m.height);
        ctx.lineTo(x + m.width, height * 0.5);
        ctx.closePath();
        ctx.fill();

        // Snow cap
        ctx.fillStyle = '#E8E8E8';
        ctx.beginPath();
        ctx.moveTo(x + m.width / 2, height * 0.5 - m.height);
        ctx.lineTo(x + m.width / 2 - 30, height * 0.5 - m.height + 40);
        ctx.lineTo(x + m.width / 2 + 30, height * 0.5 - m.height + 40);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#6B7B8C';
    }

    // Near mountains
    ctx.fillStyle = '#5A6A7A';
    for (const m of mountains) {
        const x = ((m.x - scrollX * 0.2) % (width * 1.5)) - 200;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.55);
        ctx.lineTo(x + m.width / 2, height * 0.55 - m.height);
        ctx.lineTo(x + m.width, height * 0.55);
        ctx.closePath();
        ctx.fill();

        // Snow cap
        ctx.fillStyle = '#F0F0F0';
        ctx.beginPath();
        ctx.moveTo(x + m.width / 2, height * 0.55 - m.height);
        ctx.lineTo(x + m.width / 2 - 40, height * 0.55 - m.height + 50);
        ctx.lineTo(x + m.width / 2 + 40, height * 0.55 - m.height + 50);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#5A6A7A';
    }
}

// Draw pine trees
function drawTrees() {
    for (const tree of trees) {
        const x = ((tree.x - scrollX * 0.5) % (width * 2)) - 100;
        const baseY = getTerrainHeight(x + scrollX * 0.5);

        // Tree trunk
        ctx.fillStyle = '#4A3728';
        ctx.fillRect(x - 4, baseY - 10, 8, 15);

        // Tree layers (3 triangles)
        ctx.fillStyle = '#2D5A3D';
        for (let i = 0; i < 3; i++) {
            const layerY = baseY - 15 - i * (tree.height / 4);
            const layerWidth = tree.width * (1 - i * 0.2);
            ctx.beginPath();
            ctx.moveTo(x, layerY - tree.height / 3);
            ctx.lineTo(x - layerWidth / 2, layerY);
            ctx.lineTo(x + layerWidth / 2, layerY);
            ctx.closePath();
            ctx.fill();
        }

        // Snow on tree
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 3; i++) {
            const layerY = baseY - 15 - i * (tree.height / 4);
            const layerWidth = tree.width * (1 - i * 0.2) * 0.6;
            ctx.beginPath();
            ctx.moveTo(x, layerY - tree.height / 3);
            ctx.lineTo(x - layerWidth / 2, layerY - tree.height / 6);
            ctx.lineTo(x + layerWidth / 2, layerY - tree.height / 6);
            ctx.closePath();
            ctx.fill();
        }
    }
}

// Draw terrain
function drawTerrain() {
    // Update terrain positions
    for (let i = 0; i < terrain.length; i++) {
        terrain[i].x = i * terrainSegmentWidth - (scrollX % terrainSegmentWidth);
        terrain[i].y = getTerrainHeight(i * terrainSegmentWidth + scrollX);
    }

    // Snow surface
    ctx.fillStyle = '#FAFAFA';
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (const point of terrain) {
        ctx.lineTo(point.x, point.y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Snow surface highlight
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < terrain.length; i++) {
        if (i === 0) ctx.moveTo(terrain[i].x, terrain[i].y);
        else ctx.lineTo(terrain[i].x, terrain[i].y);
    }
    ctx.stroke();

    // Snow shadow/depth
    ctx.fillStyle = '#E8EEF2';
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (const point of terrain) {
        ctx.lineTo(point.x, point.y + 20);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
}

// Draw sled and rider
function drawSled() {
    const sledX = width * 0.25;

    // Get terrain height and slope at sled position
    const terrainIndex = Math.floor((sledX + scrollX % terrainSegmentWidth) / terrainSegmentWidth);
    const t1 = terrain[Math.max(0, terrainIndex)] || { y: height * 0.6 };
    const t2 = terrain[Math.min(terrain.length - 1, terrainIndex + 1)] || { y: height * 0.6 };

    const sledY = t1.y - 15;
    const slope = Math.atan2(t2.y - t1.y, terrainSegmentWidth);

    ctx.save();
    ctx.translate(sledX, sledY);
    ctx.rotate(slope);

    // Sled
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.roundRect(-25, 0, 50, 8, 3);
    ctx.fill();

    // Sled runners
    ctx.fillStyle = '#654321';
    ctx.fillRect(-23, 8, 46, 3);

    // Curved front
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(-25, 4, 8, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();

    // Person body
    ctx.fillStyle = '#E74C3C'; // Red jacket
    ctx.beginPath();
    ctx.ellipse(0, -15, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Person head
    ctx.fillStyle = '#FDBF6F';
    ctx.beginPath();
    ctx.arc(0, -38, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hat
    ctx.fillStyle = '#3498DB';
    ctx.beginPath();
    ctx.arc(0, -42, 12, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-12, -45, 24, 5);

    // Hat pom-pom
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -52, 5, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = '#2C3E50';
    ctx.beginPath();
    ctx.arc(-4, -40, 2, 0, Math.PI * 2); // Left eye
    ctx.arc(4, -40, 2, 0, Math.PI * 2);  // Right eye
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -36, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Arms holding sled rope
    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -20);
    ctx.lineTo(-20, -5);
    ctx.moveTo(8, -20);
    ctx.lineTo(20, -5);
    ctx.stroke();

    // Rope
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-25, -2);
    ctx.quadraticCurveTo(-22, -10, -20, -5);
    ctx.moveTo(25, -2);
    ctx.quadraticCurveTo(22, -10, 20, -5);
    ctx.stroke();

    ctx.restore();

    // Snow spray behind sled
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 8; i++) {
        const px = sledX + 30 + Math.random() * 40;
        const py = sledY + Math.random() * 20;
        const size = 2 + Math.random() * 4;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw snowflakes
function drawSnowflakes() {
    ctx.fillStyle = '#FFFFFF';

    for (const flake of snowflakes) {
        ctx.globalAlpha = flake.opacity;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fill();

        // Update position
        flake.y += flake.speedY;
        flake.x += flake.speedX - scrollSpeed * 0.3;

        // Reset if off screen
        if (flake.y > height) {
            flake.y = -10;
            flake.x = Math.random() * width;
        }
        if (flake.x < -10) {
            flake.x = width + 10;
        }
        if (flake.x > width + 10) {
            flake.x = -10;
        }
    }

    ctx.globalAlpha = 1;
}

function animate() {
    time++;
    scrollX += scrollSpeed;

    // Draw layers back to front
    drawSky();
    drawMountains();
    drawTrees();
    drawTerrain();
    drawSled();
    drawSnowflakes();

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
animate();
