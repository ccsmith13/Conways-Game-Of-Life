import React from 'react';
import './Board.css';

const CELL_SIZE = 20; 
const WIDTH = 800; 
const HEIGHT = 600; 

class Cell extends React.Component{
    //class for rendering individual cells 
    render(){
        const{x, y, cellColor} = this.props;
        return(
            <div className = {cellColor}
                style = {{left: `${CELL_SIZE * x + 1}px`,
                top: `${CELL_SIZE * y + 1}px`,
                width: `${CELL_SIZE -1}px`,
                height: `${CELL_SIZE -1}px`,}}/>
        )
    }
}

//note that the state of the cells (True / False) is stored in 'this.cells', which is swapped with 'this.board' below 
//in order to implement the double-rendering requirement for this application 

class Board extends React.Component { 
    constructor() {
        super();
        this.rows = HEIGHT/CELL_SIZE;
        this.cols = WIDTH/CELL_SIZE;
        this.board = this.makeEmptyBoard();
    }

    state = {
        cells: [], 
        interval: 100,
        isRunning: false,
        currentGen: 0,
        cellColor: "White",
    };

    runGame = () => {
        this.setState({isRunning: true});
        this.runIteration();
    }

    stopGame = () => {
        this.setState({isRunning: false});
        if(this.timeoutHandler){
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    // clears the board and cells list, stops th game, and sets current generation to zero
    handleClear = () => {
        this.board = this.makeEmptyBoard();
        this.setState({cells: this.makeCells()});
        this.stopGame();
        this.setState({currentGen: 0});
    }

    //makes empty board 
    makeEmptyBoard(){
        let board = [];
        for( let y = 0; y < this.rows; y++ ){
            board[y] = [];
            for (let x = 0; x < this.cols; x++){
                board[y][x] = false;
            }
        }
        return board;
    }

    //makes cell list which will contain the state of the cells as either true or false
    makeCells(){
        let cells = [];
        for(let y=0; y<this.rows; y++){
            for(let x=0; x<this.cols; x++){
                if(this.board[y][x]){
                    cells.push({x, y});
                }
            }
        }
        return cells;
    }

    //calculates the number of neighbors of a cell 
    calculateNeighbors(board, x, y){
        let neighbors = 0;
        const dirs = [[-1,-1], [-1,0], [-1,1], [0,1], [1,1], [1,0], [1,-1], [0,-1]];
        for (let i=0; i<dirs.length; i++){
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];

            if(x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]){
                neighbors++;
            }
        }
        return neighbors;
    }

    //updates interval speed stored in state when the user changes it
    handleIntervalChange = (event) => {
        this.setState({interval: event.target.value});
    }

    //continuously runs iterations of the game according to the 'rules' of the game
    runIteration(){
        //console.log('running iteration');
        let newBoard = this.makeEmptyBoard();
        for(let y=0; y<this.rows; y++){
            for(let x=0; x<this.cols; x++){
                let neighbors = this.calculateNeighbors(this.board, x, y);
                if(this.board[y][x]){
                    if (neighbors === 2 || neighbors === 3){
                        newBoard[y][x] = true;
                    }
                    else{
                        newBoard[y][x] = false;
                    }
                }
                else{
                    if(!this.board[y][x] && neighbors === 3){
                        newBoard[y][x] = true;
                    }
                }
            }
        }
        //console.log('newBoard', newBoard);
        this.board = newBoard;
        this.setState({cells: this.makeCells()});
        this.setState({currentGen: this.state.currentGen+1});
        this.timeoutHandler = window.setTimeout(()=>{
            this.runIteration()},
            this.state.interval)
    }

    //gathers coordinates of a click
    getElementOffset(){
        const rect = this.boardRef.getBoundingClientRect();
        const doc = document.documentElement;
        return{
            x: (rect.left + window.pageXOffset) - doc.clientLeft,
            y: (rect.top + window.pageYOffset) - doc.clientTop,
        };
    }

    //updates clicked cell to cells list as either 'True' or 'False' AKA 'alive' or 'dead' implementation
    handleClick = (event) => {
        if (!this.state.isRunning){
        const elemOffset = this.getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;
        const x = Math.floor(offsetX / CELL_SIZE);
        const y = Math.floor(offsetY / CELL_SIZE);
        if(x >= 0 && x <= this.cols && y >= 0 && y <= this.rows){
            this.board[y][x] = !this.board[y][x];
            this.setState({cells: this.makeCells()});
        }}
    }

    //updates grid with random collection of cells and resets the current generation # to zero
    handleRandom = () => {
        for(let y=0; y < this.rows; y++){
            for(let x=0; x<this.cols; x++){
                this.board[y][x] = Math.random() >= 0.5;
            }
        }
        this.setState({currentGen: 0});
        this.setState({cells: this.makeCells()});
    }

    //updates cellColor in state, which is passed down as a prop to the Cell class inside the render function when the cells list is mapped to Cell objects
    handleColorSelection = (event) => {
        this.setState({cellColor: event.target.value});
      }

    render(){
        const { cells } = this.state;
        return(
            <div>
                <h1>Current Generation: {this.state.currentGen}</h1>
                <div 
                className = "Board" style = {{width:WIDTH, height:HEIGHT, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`}}
                onClick = {this.handleClick}
                ref={(n)=>{this.boardRef = n;}}>
                    {cells.map(cell =>(
                        <Cell x={cell.x} y={cell.y} cellColor={this.state.cellColor}
                        key = {`${cell.x}, ${cell.y}`}/>
                    ))}
                </div>
                <div className = "controls">
                    Update every 
                    <input value={this.state.interval}
                    onChange={this.handleIntervalChange}/>
                    msec
                    {this.state.isRunning ? 
                        <button 
                        className="button"
                        onClick = {this.stopGame}>
                            Stop
                        </button>
                        :
                        <button
                        className="button"
                        onClick = {this.runGame}>
                            Run
                        </button>
                    }
                    <button className="button"
                    onClick={this.handleRandom}>Random</button>
                    <button className="button" 
                    onClick = {this.handleClear}>Clear</button>

                    <div>
                        <h2>Select Cell Color</h2>
                        <button onClick={this.handleColorSelection} className="button" value="White">White</button>
                        <button onClick={this.handleColorSelection} className="button" value="Pink">Pink</button>
                        <button onClick={this.handleColorSelection} className="button" value="Blue">Blue</button>
                        <button onClick={this.handleColorSelection} className="button" value="Purple">Purple</button>
                    </div>
                    <div>
                        <h2>About</h2>
                        <p>The Game of Life, also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970.[1] It is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves. It is Turing complete and can simulate a universal constructor or any other Turing machine.</p>
                        <p>The universe of the Game of Life is an infinite, two-dimensional orthogonal grid of square cells, each of which is in one of two possible states, live or dead, (or populated and unpopulated, respectively). Every cell interacts with its eight neighbours, which are the cells that are horizontally, vertically, or diagonally adjacent. At each step in time, the following transitions occur:
                            Any live cell with fewer than two live neighbours dies, as if by underpopulation.
                            Any live cell with two or three live neighbours lives on to the next generation.
                            Any live cell with more than three live neighbours dies, as if by overpopulation.
                            Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
                            These rules, which compare the behavior of the automaton to real life, can be condensed into the following:

                            Any live cell with two or three live neighbours survives.
                            Any dead cell with three live neighbours becomes a live cell.
                            All other live cells die in the next generation. Similarly, all other dead cells stay dead.
                            The initial pattern constitutes the seed of the system. The first generation is created by applying the above rules simultaneously to every cell in the seed; births and deaths occur simultaneously, and the discrete moment at which this happens is sometimes called a tick. Each generation is a pure function of the preceding one. The rules continue to be applied repeatedly to create further generations.
                        </p>
                        <i>Source: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life</i>
                    </div>
                </div>
            </div>
        );
    }
}

export default Board;