"use strict";
// This is a universal script that generates and paints game of life
// generations on both the client and the server.

// gifpop supports 10 frame so we'll just run with that
var NUM_FRAMES = 10;

function emptyGrid(width, height) {
    return makeGrid(width, height, _ => 0);
}

function makeGrid(width, height, getValue) {
    const grid = [];
    for (let i = 0; i < width; i++) {
        const row = [];
        for (let j = 0; j < height; j++) {
            row.push(getValue(i, j));
        }
        grid.push(row);
    }

    return grid;
}

function cellToInt(grid, x, y) {
    const row = grid[x];
    if (!row) {
        return 0;
    } else {
        return +!!row[y];
    }
}

function getNeighbors(grid, x, y) {
    return [
        cellToInt(grid, x-1, y-1),
        cellToInt(grid, x  , y-1),
        cellToInt(grid, x+1, y-1),

        cellToInt(grid, x-1, y  ),
        // skip x, y
        cellToInt(grid, x+1, y  ),

        cellToInt(grid, x-1, y+1),
        cellToInt(grid, x  , y+1),
        cellToInt(grid, x+1, y+1),
    ].filter(i => i).length;
}

function nextGrid(oldGrid) {
    const width = oldGrid.length;
    const height = oldGrid[0].length;

    const grid = emptyGrid(width, height);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const neighbors = getNeighbors(oldGrid, x, y);
            grid[x][y] = oldGrid[x][y];

            if (oldGrid[x][y]) {
                if (neighbors < 2) {
                    // Death by underpopulation
                    grid[x][y] = 0;
                } else if (neighbors > 3) {
                    // Death by overpopulation
                    grid[x][y] = 0;
                }
            } else {
                if (neighbors === 3) {
                    // Life is created!
                    grid[x][y] = 1;
                }
            }
        }
    }

    return grid;
}

function createPainter(grid, ctx) {
    // NOTE: We're only dealing with 256 cells so it's not unreasonable to
    // just generate this on-demand, but we'll do it beforehand anyway.
    let grids = [];

    function loadGrid(grid) {
        grids = [grid];

        for (let i = 1; i < NUM_FRAMES; i++) {
            grid = nextGrid(grid);
            grids.push(grid);
        }
    }

    // Load grid and compute 10 generations initially
    loadGrid(grid);

    return {
        // Expose the NUM_FRAMES constant
        NUM_FRAMES: NUM_FRAMES,

        loadGrid: loadGrid,

        drawGrid: function(generation, width, height) {
            generation = generation || 0;

            // Clear the canvas
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "rgb(0, 0, 0)";

            const grid = grids[generation];
            const cellsPerColumn = grid.length;
            const cellsPerRow = grid[0].length;

            const cellWidth = width / cellsPerRow;
            const cellHeight = height / cellsPerColumn;

            for (let x = 0; x < cellsPerRow; x++) {
                for (let y = 0; y < cellsPerColumn; y++) {
                    if (grid[y][x]) {
                        ctx.fillRect(
                            x * cellWidth, y * cellHeight,
                            cellWidth, cellHeight);
                    }
                }
            }
        },
    };
}

// Export for Node, in the browser all these things will be global
if (typeof module !== "undefined") {
    module.exports = createPainter;
}
