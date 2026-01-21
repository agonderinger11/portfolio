const canvas = document.getElementById('gradient-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let time = 0;
let growthProgress = 0;
let growing = true;
const cycleSpeed = 0.004;

// Darker green palette
const branchColor = { r: 20, g: 85, b: 40 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Easing function to make growth appear constant
// Speeds up toward the end to compensate for exponential branch count
function easeGrowth(t) {
    // Quadratic ease-in: starts slow, accelerates
    return t * t;
}

// Draw recursive fractal branch
function drawBranch(x, y, length, angle, depth, maxDepth, totalProgress) {
    if (depth > maxDepth || length < 2) return;

    // Use eased progress for constant visual growth
    const easedProgress = easeGrowth(totalProgress);

    // Calculate cumulative length up to this depth
    // Each level is 0.7x the previous, so total is geometric series
    const ratio = 0.7;
    let cumulativeRatio = 0;
    let totalRatio = 0;

    for (let d = 0; d <= maxDepth; d++) {
        totalRatio += Math.pow(ratio, d);
    }
    for (let d = 0; d < depth; d++) {
        cumulativeRatio += Math.pow(ratio, d);
    }

    // This depth's contribution
    const depthStart = cumulativeRatio / totalRatio;
    const depthEnd = (cumulativeRatio + Math.pow(ratio, depth)) / totalRatio;

    // How much of this branch to draw
    const branchProgress = Math.max(0, Math.min(1, (easedProgress - depthStart) / (depthEnd - depthStart)));

    if (branchProgress <= 0) return;

    const currentLength = length * branchProgress;

    // End point
    const endX = x + Math.cos(angle) * currentLength;
    const endY = y + Math.sin(angle) * currentLength;

    // Line thickness
    const thickness = Math.max(1, (maxDepth - depth + 1) * 1.2);

    // Color - darker at base, slightly lighter at tips
    const depthRatio = depth / maxDepth;
    const r = branchColor.r + depthRatio * 20;
    const g = branchColor.g + depthRatio * 30;
    const b = branchColor.b + depthRatio * 15;

    // Draw line
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'square';
    ctx.stroke();

    // Recurse if branch is complete enough
    if (branchProgress > 0.8) {
        const newLength = length * ratio;
        const branchAngle = 0.5;

        // Left and right branches
        drawBranch(endX, endY, newLength, angle - branchAngle, depth + 1, maxDepth, totalProgress);
        drawBranch(endX, endY, newLength, angle + branchAngle, depth + 1, maxDepth, totalProgress);
    }
}

// Draw fractal tree
function drawFractal(progress) {
    const cx = width / 2;
    const cy = height;

    const treeHeight = height * 0.4;
    const maxDepth = 11;

    drawBranch(cx, cy, treeHeight, -Math.PI / 2, 0, maxDepth, progress);
}

function animate() {
    time++;

    // Update growth/shrink cycle
    if (growing) {
        growthProgress += cycleSpeed;
        if (growthProgress >= 1) {
            growthProgress = 1;
            growing = false;
        }
    } else {
        growthProgress -= cycleSpeed;
        if (growthProgress <= 0) {
            growthProgress = 0;
            growing = true;
        }
    }

    // Clear canvas
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Draw the fractal
    drawFractal(growthProgress);

    requestAnimationFrame(animate);
}

animate();
