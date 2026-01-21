const canvas = document.getElementById('gradient-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let time = 0;
let growthProgress = 0;
let growing = true;
const growthSpeed = 0.002;
const shrinkSpeed = 0.003;

// Darker green palette
const branchColor = { r: 20, g: 90, b: 45 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Golden angle for spiral pattern
const goldenAngle = Math.PI * (3 - Math.sqrt(5));

// Draw spiral fractal branch
function drawSpiralBranch(cx, cy, length, angle, depth, maxDepth, progress) {
    if (depth > maxDepth || length < 1) return;

    // Calculate progress for this depth level
    const depthProgress = Math.max(0, Math.min(1, (progress * (maxDepth + 1) - depth)));
    if (depthProgress <= 0) return;

    const currentLength = length * depthProgress;

    // End point
    const endX = cx + Math.cos(angle) * currentLength;
    const endY = cy + Math.sin(angle) * currentLength;

    // Line thickness - sharper, thinner lines
    const thickness = Math.max(0.5, (maxDepth - depth) * 0.8);

    // Darker green, slightly lighter at tips
    const depthRatio = depth / maxDepth;
    const r = branchColor.r + depthRatio * 15;
    const g = branchColor.g + depthRatio * 25;
    const b = branchColor.b + depthRatio * 10;
    const alpha = 0.95 - depthRatio * 0.2;

    // Draw sharp line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * depthProgress})`;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'square';
    ctx.stroke();

    // Recurse with spiral rotation
    if (depthProgress > 0.2) {
        const newLength = length * 0.72;
        const spiralOffset = goldenAngle * 0.4;

        // Multiple branches spiraling outward
        drawSpiralBranch(endX, endY, newLength, angle - spiralOffset, depth + 1, maxDepth, progress);
        drawSpiralBranch(endX, endY, newLength, angle + spiralOffset, depth + 1, maxDepth, progress);

        // Extra branch for density
        if (depth < maxDepth - 2) {
            drawSpiralBranch(endX, endY, newLength * 0.6, angle, depth + 1, maxDepth, progress);
        }
    }
}

// Draw complete spiral fractal from center
function drawSpiralFractal(progress) {
    const cx = width / 2;
    const cy = height / 2;

    // Calculate max length to reach screen corners
    const maxRadius = Math.sqrt((width/2) ** 2 + (height/2) ** 2);
    const branchLength = maxRadius * 0.25;

    const numSpokes = 8;
    const maxDepth = 10;

    for (let i = 0; i < numSpokes; i++) {
        const baseAngle = (i / numSpokes) * Math.PI * 2;
        // Add slight rotation over time for organic feel
        const angle = baseAngle + time * 0.0002;

        drawSpiralBranch(cx, cy, branchLength, angle, 0, maxDepth, progress);
    }
}

function animate() {
    time++;

    // Update growth/shrink cycle
    if (growing) {
        growthProgress += growthSpeed;
        if (growthProgress >= 1) {
            growthProgress = 1;
            growing = false;
        }
    } else {
        growthProgress -= shrinkSpeed;
        if (growthProgress <= 0) {
            growthProgress = 0;
            growing = true;
        }
    }

    // Clear canvas
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Draw the spiral fractal
    drawSpiralFractal(growthProgress);

    requestAnimationFrame(animate);
}

animate();
