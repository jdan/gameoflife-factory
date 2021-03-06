// Code to control the web UI

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const cellCount = 16;

let grid = emptyGrid(16, 16);
const painter = createPainter(grid, ctx);

let animation = null;
let currentFrame = 0;

function drawRandomGrid() {
    resetAnimation();
    grid = makeGrid(cellCount, cellCount, _ => Math.random() > 0.6);
    painter.loadGrid(grid);
    painter.drawGrid(0, canvas.width, canvas.height);
}

// Draw a random grid to start
drawRandomGrid();

canvas.addEventListener("click", (e) => {
    resetAnimation();
    // Compute the width and height of each cell
    const cellWidth = canvas.offsetWidth / cellCount;
    const cellHeight = canvas.offsetHeight / cellCount;

    // Now compute which one we clicked on
    const cellX = Math.floor(e.offsetX / cellWidth);
    const cellY = Math.floor(e.offsetY / cellHeight);

    grid[cellY][cellX] = !grid[cellY][cellX];
    painter.loadGrid(grid);
    painter.drawGrid(0, canvas.width, canvas.height);
});

document.getElementById("random").addEventListener("click", drawRandomGrid);

document.getElementById("clear").addEventListener("click", (e) => {
    resetAnimation();
    grid = emptyGrid(cellCount, cellCount);
    painter.loadGrid(grid);
    painter.drawGrid(0, canvas.width, canvas.height);
});

function resetAnimation() {
    clearInterval(animation);
    animation = null;
    currentFrame = 0;
    painter.drawGrid(0, canvas.width, canvas.height);
}

document.getElementById("animate").addEventListener("click", (e) => {
    if (animation) {
        resetAnimation();
    }

    animation = setInterval(() => {
        currentFrame++;

        if (currentFrame == NUM_FRAMES) {
            resetAnimation();
        } else {
            painter.drawGrid(currentFrame, canvas.width, canvas.height);
        }
    }, 100);
});

document.getElementById("gif").addEventListener("click", (e) => {
    const b64 = window.btoa(JSON.stringify(grid));
    window.open("/gif/" + b64);
});
