import React, { forwardRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import {FixedSizeGrid} from 'react-window';
import styled from 'styled-components';

interface StateData {
  grid: boolean[][],
  clickHandler: (e: React.MouseEvent<HTMLDivElement>, columnIndex: number, rowIndex: number) => void;
}

interface CellRendererProps {
  columnIndex: number,
  rowIndex: number,
  style: React.CSSProperties,
  data: StateData
  // isActive: boolean,
  // handleClick: React.MouseEventHandler<HTMLDivElement>
}

interface StyledCellProps {
  isActive: boolean
}

const StyledCell = styled.div<StyledCellProps>`
  background-color: ${(p: { isActive: boolean; }) => p.isActive ? 'black' : 'white'};
  border: 1px solid black;
  cursor: pointer;
`;

const countNeighbors = (stateArray: boolean[][], x: number, y: number) => {
  const minX = Math.max(x-1, 0);
  const maxX = Math.min(x+1, stateArray[y].length-1);
  const minY = Math.max(y-1, 0);
  const maxY = Math.min(y+1, stateArray.length-1);
  let neighborCount = 0;
  for(let i=minX; i<=maxX; i++) {
    for(let j=minY; j<=maxY; j++) {
      if(stateArray[j][i]) {
        neighborCount++;
      }
    }
  }
  if(stateArray[y][x]) {
    neighborCount--;
  }
  return neighborCount;
}

const advanceState = (prevState: boolean[][], width: number, height: number) => {
  console.log("ADVANCE STATE DEBUG", prevState)
  // TODO: use a rectangle instead of a square
  let newState = createNewDataGrid(width, height, false)
  for(let i=0; i<width; i++) {
    for(let j=0; j<height; j++) {
      let count = countNeighbors(prevState, i, j);
      if(prevState[j][i]) {
        if(count < 2) {
          newState[j][i] = false;
        } else if(count === 2 || count === 3) {
          newState[j][i] = true;
        } else if(count > 3) {
          newState[j][i] = false;
        }
      } else if(count === 3) {
        newState[j][i] = true;
      }
    }
  }
  return newState;
}

const CellRenderer = ({columnIndex, rowIndex, style, data}: CellRendererProps) => {
  //  onMouseDown={handleClick} 
  // console.log('CELL RENDERER DATA ', data);
  // if(data.grid) {
  //   const count = countNeighbors(data.grid, rowIndex, columnIndex);
  //   if(count) {
  //     console.log('NEIGHBORS OF CELL ' + columnIndex + "-" + rowIndex);
  //     console.log(count)
  //   }

  // } else {
  //   console.log('NO GRID FOUND', data)
  // }
  return (
    <StyledCell style={style} onMouseDown={(e) => data.clickHandler(e, columnIndex, rowIndex)} isActive={data.grid[rowIndex][columnIndex]}>cell {columnIndex}-{rowIndex}</StyledCell>
  )
}

function createNewDataGrid<DataType>(width: number, height: number, defaultValue: DataType): DataType[][] {
  const grid = new Array(height).fill(null);
  grid.forEach((element, i) => {
    grid[i] = new Array(width).fill(defaultValue);
  });
  return grid;
}

function App() {
  const GRID_SIZE = 100;
  const [gridState, setGridState] = useState(createNewDataGrid<boolean>(GRID_SIZE, GRID_SIZE, false));

  const step = () => {
    setGridState(prevState => advanceState(prevState, GRID_SIZE, GRID_SIZE));
  }

  const handleOnClick = (e: React.MouseEvent<HTMLDivElement>, columnIndex: number, rowIndex: number) => {
    // setCellActive((prevState: boolean) => !prevState);
    console.log('CLICK EVENT', columnIndex, rowIndex)
    setGridState(prevState => {
      console.log('PREV STATE', prevState);
      const modifiedSlice = prevState[rowIndex].slice();
      modifiedSlice[columnIndex] = !modifiedSlice[columnIndex];
      return [...prevState.slice(0, rowIndex), modifiedSlice, ...prevState.slice(rowIndex+1)]
    })
  }

  interface ForwardProps {
    onMouseDown: React.MouseEventHandler<HTMLDivElement>,
    ref: React.ForwardedRef<HTMLDivElement>
  }

  interface OuterElementProps {
    columnIndex: number,
    rowIndex: number,
    onMouseDown: React.MouseEventHandler<HTMLDivElement>
  }

  // const outerElementType = forwardRef<HTMLDivElement, OuterElementProps>((props, ref) => (
  //   <div ref={ref} {...props} onMouseDown={(e) => {
  //     console.log(props);
  //     handleOnClick(e, props.columnIndex, props.rowIndex)
  //   }}/>
  // ));

              // <CellRenderer
            //   columnIndex={columnIndex}
            //   rowIndex={rowIndex}
            //   style={style} cellActive={gridState[rowIndex][columnIndex]}
            //   handleClick={(e: React.MouseEvent<HTMLDivElement>) => onClick(e, columnIndex, rowIndex)}
            // ></CellRenderer>

  // TODO: update to actually use current state to render properly
  return (
    <div className="App">
      <FixedSizeGrid columnWidth={60} rowHeight={60}
        columnCount={GRID_SIZE} rowCount={GRID_SIZE}
        itemData={{grid: gridState, clickHandler: handleOnClick}} width={1000} height={800}
        // outerElementType={outerElementType}
      >
        {CellRenderer}
      </FixedSizeGrid>
      <div>
        <button onClick={step}>Step</button>
      </div>
    </div>
  );
}

export default App;
