import React from 'react';
import './Board.css';

const WIDTH = 800; 
const HEIGHT = 600; 

class Cell extends React.Component{
    render(){
        const{x,y} = this.props;
        console.log('x', x, 'y', y)
        return(
            <div className = "Cell"
                style = {{left: `${this.props.cellSize * x + 1}px`,
                top: `${this.props.cellSize * y + 1}px`,
                width: `${this.props.cellSize -1}px`,
                height: `${this.props.cellSize -1}px`,}}/>
        )
    }
}

class Board extends React.Component { 
    constructor(props) {
        super(props);
        this.board = this.makeEmptyBoard();
    }
    state = {
        cells: [], 
        interval: 100,
        isRunning: false,
        currentGen: 0,
    };
    getRows = () => {
        return HEIGHT/this.props.cellSize;
    }
    getColumns = () => {
        return WIDTH/this.props.cellSize;
    }
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
    handleClear = () => {
        this.board = this.makeEmptyBoard();
        this.setState({cells: this.makeCells()});
        this.setState({currentGen: 0});
        this.stopGame();
    }
    makeEmptyBoard(){
        let board = [];
        for( let y = 0; y < this.getRows(); y++ ){
            board[y] = [];
            for (let x = 0; x < this.getColumns(); x++){
                board[y][x] = false;
            }
        }
        return board;
    }
    makeCells(){
        let cells = [];
        for(let y=0; y<this.getRows(); y++){
            for(let x=0; x<this.getColumns(); x++){
                if(this.board[y][x]){
                    cells.push({x, y});
                    console.log('cells', cells);
                }
            }
        }
        return cells;
    }
    calculateNeighbors(board, x, y){
        let neighbors = 0;
        const dirs = [[-1,-1], [-1,0], [-1,1], [0,1], [1,1], [1,0], [1,-1], [0,-1]];
        for (let i=0; i<dirs.length; i++){
            const dir = dirs[i];
            let y1 = y + dir[0];
            console.log('y1', y1);
            let x1 = x + dir[1];
            console.log('x1', x1);

            if(x1 >= 0 && x1 < this.getColumns() && y1 >= 0 && y1 < this.getRows() && board[y1][x1]){
                neighbors++;
            }
        }
        return neighbors;
    }
    handleIntervalChange = (event) => {
        this.setState({interval: event.target.value});
    }
    runIteration(){
        this.setState({currentGen: this.state.currentGen + 1});
        let newBoard = this.makeEmptyBoard();
        for(let y=0; y<this.getRows(); y++){
            for(let x=0; x<this.getColumns(); x++){
                let neighbors = this.calculateNeighbors(this.board, x, y);
                console.log('neighbors', neighbors);
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
        this.board = newBoard;
        this.setState({cells: this.makeCells()});
        this.timeoutHandler = window.setTimeout(()=>{
            this.runIteration()},
            this.state.interval)
    }
    getElementOffset(){
        const rect = this.boardRef.getBoundingClientRect();
        const doc = document.documentElement;
        return{
            x: (rect.left + window.pageXOffset) - doc.clientLeft,
            y: (rect.top + window.pageYOffset) - doc.clientTop,
        };
    }
    handleClick = (event) => {
        console.log('cols', this.getColumns(), 'rows', this.getRows());
        const elemOffset = this.getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;
        const x = Math.floor(offsetX / this.props.cellSize);
        const y = Math.floor(offsetY / this.props.cellSize);
        if(x >= 0 && x <= this.getColumns() && y >= 0 && y <= this.getRows()){
            this.board[y][x] = !this.board[y][x];
            this.setState({cells: this.makeCells()});
        }
    }
    handleRandom = () => {
        for(let y=0; y < this.getRows(); y++){
            for(let x=0; x<this.getColumns(); x++){
                this.board[y][x] = Math.random() >= 0.5;
            }
        }
        this.setState({cells: this.makeCells()});
        this.setState({currentGen: 0});
    }

    render(){
        const { cells } = this.state;
        return(
            <div>
                <h1> Current Generation: {this.state.currentGen}</h1>
                <div 
                className = "Board" style = {{width:WIDTH, height:HEIGHT, backgroundSize: `${this.props.cellSize}px ${this.props.cellSize}px`}}
                onClick = {this.handleClick}
                ref={(n)=>{this.boardRef = n;}}>
                    {cells.map(cell =>(
                        <Cell x={cell.x} y={cell.y} 
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
                    
                </div>
            </div>
        );
    }
}

export default Board;