/**
 * Configure your bot instance.
 * See our [API Documentation]{@link https://docs.regression.gg/studios/unity/unity-sdk/creating-bots/configuration} for available configuration options and values.
 */
export function configureBot(rg) {
    rg.isSpawnable = false;
    rg.lifecycle = "PERSISTENT";
}

var startTime = null;
var swapHistory = [];

export async function processTick(rg) {
    
    // After playing for 10 seconds, quit
    if (!startTime) startTime = new Date().getTime();
    if (new Date().getTime() - startTime > 10000) {
      // Now try to finish
      console.log("-------------------------")
      console.log("Results for scene (ran for 10 seconds) " + rg.getState().sceneName)
      console.log(`Total moves taken: ${swapHistory.length}`)
      console.log(`Most number of swaps available: ${Math.max(...swapHistory)}`)
      console.log(`Minimum number of swaps available: ${Math.min(...swapHistory)}`)
      console.log(`Average number of swaps available: ${swapHistory.reduce((a, b) => a + b) / swapHistory.length}`)
      console.log("-------------------------")
      rg.complete();
      return;
    }

    const board = await rg.findEntity("Board", false);
    const tiles = board.tiles;
    const swaps = findPossibleSwaps(tiles);
    swapHistory.push(swaps.length);
    // From the possible swaps, choose a random one
    if (swaps) {
        if (swaps.length == 1) console.log("WARNING - Encountered state with only 1 swap available")
        else console.log("Choosing from " + swaps.length + " possible swaps")
        const swap = swaps[Math.floor(Math.random() * swaps.length)];
        console.log(`New Action - Swapping (${swap[0]},${swap[1]}) with (${swap[2]},${swap[3]})`)
        rg.performAction("Swipe", {
            x1: swap[0],
            y1: swap[1],
            x2: swap[2],
            y2: swap[3]
        });
    } else {
      if (swaps.length == 1) console.log("ERROR - Encountered state with only 0 swaps available")
    }
}

function findPossibleSwaps(board) {
    const swaps = [];
  
    // Function to check if a swap is valid and adds it to the swaps array
    function checkAndAddSwap(x1, y1, x2, y2) {
      if (
        x1 >= 0 &&
        x1 < board.length &&
        y1 >= 0 &&
        y1 < board[0].length &&
        x2 >= 0 &&
        x2 < board.length &&
        y2 >= 0 &&
        y2 < board[0].length
      ) {
        const temp = board[x1][y1];
        board[x1][y1] = board[x2][y2];
        board[x2][y2] = temp;
        if (hasMatch(x1, y1) || hasMatch(x2, y2)) {
          swaps.push([x1, y1, x2, y2]);
        }
        // Undo the swap
        board[x2][y2] = board[x1][y1];
        board[x1][y1] = temp;
      }
    }
  
    // Function to check if there is a match starting at a given position
    function hasMatch(x, y) {
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [ox, oy] of directions.concat([[0, 0]])) { // starting points to search
          for (const [dx, dy] of directions) {
            let count = 0;
            let currentX = x + ox;
            let currentY = y + oy;
            //console.log(currentX, currentY)
            while (
              currentX >= 0 &&
              currentX < board.length &&
              currentY >= 0 &&
              currentY < board[0].length &&
              board[currentX][currentY] === board[x + ox][y + oy]
            ) {
              count++;
              currentX += dx;
              currentY += dy;
            }
            if (count >= 3) {
              return true;
            }
          }
        }
        return false;
      }
  
    // Iterate through the entire board and check for swaps
    for (let x = 0; x < board.length; x++) {
      for (let y = 0; y < board[0].length; y++) {
        checkAndAddSwap(x, y, x + 1, y);
        checkAndAddSwap(x, y, x, y + 1);
      }
    }
  
    return swaps;
  }