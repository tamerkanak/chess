const pieces = {
    'P': '♙',
    'R': '♖',
    'N': '♘',
    'B': '♗',
    'Q': '♕',
    'K': '♔',
    'p': '♟︎',
    'r': '♜',
    'n': '♞',
    'b': '♝',
    'q': '♛',
    'k': '♚'
};

let board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let turn = 'white';
let selectedPiece = null;
let selectedSquare = null;
let whiteKingMoved = false;
let blackKingMoved = false;
let whiteRookLeftMoved = false;
let whiteRookRightMoved = false;
let blackRookLeftMoved = false;
let blackRookRightMoved = false;

function createBoard() {
    const boardElement = document.getElementById('chess-board');
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            const piece = board[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.innerText = pieces[piece];
                pieceElement.dataset.color = piece === piece.toLowerCase() ? 'black' : 'white';
                square.appendChild(pieceElement);
            }
            boardElement.appendChild(square);
        }
    }
}

function isValidMove(start, end) {
    const piece = board[start.row][start.col];
    if (!piece) return false;

    const color = piece === piece.toLowerCase() ? 'black' : 'white';
    if (color !== turn) return false;

    const target = board[end.row][end.col];
    const targetColor = target ? (target === target.toLowerCase() ? 'black' : 'white') : null;

    // Check if the target square has a piece of the same color
    if (targetColor === color) return false;

    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;

    switch (piece.toLowerCase()) {
        case 'p':
            if (color === 'white') {
                if (rowDiff === -1 && colDiff === 0 && !target) return true;
                if (start.row === 6 && rowDiff === -2 && colDiff === 0 && !board[start.row - 1][start.col] && !target) return true;
                if (rowDiff === -1 && Math.abs(colDiff) === 1 && target && targetColor === 'black') return true;
            } else {
                if (rowDiff === 1 && colDiff === 0 && !target) return true;
                if (start.row === 1 && rowDiff === 2 && colDiff === 0 && !board[start.row + 1][start.col] && !target) return true;
                if (rowDiff === 1 && Math.abs(colDiff) === 1 && target && targetColor === 'white') return true;
            }
            break;
        case 'r':
            if (rowDiff === 0 || colDiff === 0) {
                if (clearPath(start, end)) return true;
            }
            break;
        case 'n':
            if ((Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)) return true;
            break;
        case 'b':
            if (Math.abs(rowDiff) === Math.abs(colDiff)) {
                if (clearPath(start, end)) return true;
            }
            break;
        case 'q':
            if (Math.abs(rowDiff) === Math.abs(colDiff) || rowDiff === 0 || colDiff === 0) {
                if (clearPath(start, end)) return true;
            }
            break;
        case 'k':
            if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) return true;

            // Castling logic
            if (color === 'white' && !whiteKingMoved) {
                if (end.row === 7 && end.col === 6 && !whiteRookRightMoved && board[7][5] === null && board[7][6] === null) {
                    if (!isKingInCheck('white') && !isSquareAttacked({ row: 7, col: 5 }, 'black') && !isSquareAttacked({ row: 7, col: 6 }, 'black')) {
                        return true; // King-side castling
                    }
                }
                if (end.row === 7 && end.col === 2 && !whiteRookLeftMoved && board[7][1] === null && board[7][2] === null && board[7][3] === null) {
                    if (!isKingInCheck('white') && !isSquareAttacked({ row: 7, col: 2 }, 'black') && !isSquareAttacked({ row: 7, col: 3 }, 'black')) {
                        return true; // Queen-side castling
                    }
                }
            }
            if (color === 'black' && !blackKingMoved) {
                if (end.row === 0 && end.col === 6 && !blackRookRightMoved && board[0][5] === null && board[0][6] === null) {
                    if (!isKingInCheck('black') && !isSquareAttacked({ row: 0, col: 5 }, 'white') && !isSquareAttacked({ row: 0, col: 6 }, 'white')) {
                        return true; // King-side castling
                    }
                }
                if (end.row === 0 && end.col === 2 && !blackRookLeftMoved && board[0][1] === null && board[0][2] === null && board[0][3] === null) {
                    if (!isKingInCheck('black') && !isSquareAttacked({ row: 0, col: 2 }, 'white') && !isSquareAttacked({ row: 0, col: 3 }, 'white')) {
                        return true; // Queen-side castling
                    }
                }
            }
            break;
    }
    return false;
}

function clearPath(start, end) {
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

    let currentRow = start.row + rowStep;
    let currentCol = start.col + colStep;
    while (currentRow !== end.row || currentCol !== end.col) {
        if (board[currentRow][currentCol]) return false;
        currentRow += rowStep;
        currentCol += colStep;
    }
    return true;
}

function findKing(color) {
    const king = color === 'white' ? 'K' : 'k';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === king) {
                return { row, col };
            }
        }
    }
    return null;
}

function isKingInCheck(color) {
    const kingPosition = findKing(color);
    if (!kingPosition) return false;

    const opponentColor = color === 'white' ? 'black' : 'white';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && (piece === piece.toLowerCase() ? 'black' : 'white') === opponentColor) {
                if (isValidMove({ row, col }, kingPosition)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isSquareAttacked(square, byColor) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && (piece === piece.toLowerCase() ? 'black' : 'white') === byColor) {
                if (isValidMove({ row, col }, square)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isCheckmate(color) {
    if (!isKingInCheck(color)) return false;

    // Loop through all pieces of the given color
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && (piece === piece.toLowerCase() ? 'black' : 'white') === color) {
                // Try moving this piece to all possible destinations
                for (let endRow = 0; endRow < 8; endRow++) {
                    for (let endCol = 0; endCol < 8; endCol++) {
                        const end = { row: endRow, col: endCol };
                        const originalPiece = board[endRow][endCol];
                        if (isValidMove({ row, col }, end)) {
                            // If the move is valid, simulate the move
                            board[endRow][endCol] = piece;
                            board[row][col] = null;
                            // Check if the king is still in check after the move
                            if (!isKingInCheck(color)) {
                                // If not, the king can escape the check, so the game is not in checkmate
                                board[row][col] = piece; // Restore original position
                                board[endRow][endCol] = originalPiece;
                                return false;
                            }
                            // Otherwise, undo the move and continue checking other moves
                            board[row][col] = piece; // Restore original position
                            board[endRow][endCol] = originalPiece;
                        }
                    }
                }
            }
        }
    }
    // If no moves allow the king to escape the check, it's checkmate
    return true;
}

function movePiece(start, end) {
    const piece = board[start.row][start.col];
    if (!piece) return;

    const originalBoard = JSON.parse(JSON.stringify(board));  // Save the original board state

    if (!isValidMove(start, end)) {
        showMessage(`Invalid move for ${piece}`);
        return;
    }

    board[end.row][end.col] = piece;
    board[start.row][start.col] = null;

    // Handle castling move
    if (piece.toLowerCase() === 'k' && Math.abs(start.col - end.col) === 2) {
        if (end.col === 6) { // King-side castling
            board[start.row][5] = board[start.row][7];
            board[start.row][7] = null;
        } else if (end.col === 2) { // Queen-side castling
            board[start.row][3] = board[start.row][0];
            board[start.row][0] = null;
        }
    }

    // Update the flags for castling
    if (piece === 'K') whiteKingMoved = true;
    if (piece === 'k') blackKingMoved = true;
    if (piece === 'R' && start.row === 7 && start.col === 0) whiteRookLeftMoved = true;
    if (piece === 'R' && start.row === 7 && start.col === 7) whiteRookRightMoved = true;
    if (piece === 'r' && start.row === 0 && start.col === 0) blackRookLeftMoved = true;
    if (piece === 'r' && start.row === 0 && start.col === 7) blackRookRightMoved = true;

    // Check if the move puts the current player's king in check
    if (isKingInCheck(turn)) {
        showMessage(`Move puts ${turn} in check!`);
        board = originalBoard;  // Undo the move by restoring the original board state
        return;
    }

    // Update the turn and refresh the board
    turn = turn === 'white' ? 'black' : 'white';
    createBoard();

    // Check for checkmate after the move
    if (isCheckmate(turn === 'white' ? 'black' : 'white')) {
        showMessage(`Checkmate! ${turn} wins!`);
        document.getElementById('chess-board').removeEventListener('click', handleSquareClick);
        return;
    }

    // Check if the game is in a check-drawn situation
    if (isKingInCheck(turn)) {
        showMessage('Protect your king!');
    }
}

function showMessage(message) {
    const messageElement = document.getElementById('message');
    messageElement.innerText = message;
}

function handleSquareClick(event) {
    const targetSquare = event.target.closest('.square');
    if (!targetSquare) return;

    const row = parseInt(targetSquare.dataset.row);
    const col = parseInt(targetSquare.dataset.col);
    const piece = board[row][col];

    if (selectedPiece) {
        const start = { row: parseInt(selectedSquare.dataset.row), col: parseInt(selectedSquare.dataset.col) };
        const end = { row, col };
        movePiece(start, end);
        selectedPiece.classList.remove('selected');
        selectedPiece = null;
        selectedSquare = null;
    } else if (piece && (piece === piece.toLowerCase() ? 'black' : 'white') === turn) {
        selectedPiece = targetSquare.querySelector('.piece');
        selectedPiece.classList.add('selected');
        selectedSquare = targetSquare;
    }
}

createBoard();
document.getElementById('chess-board').addEventListener('click', handleSquareClick);
