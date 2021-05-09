import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import {FixedSizeGrid} from 'react-window';
import styled from 'styled-components';
interface CellRendererProps {
  columnIndex: number,
  rowIndex: number,
  style: React.CSSProperties,
  // active: boolean
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
  const maxX = Math.min(x+1, stateArray[y].length);
  const minY = Math.max(y-1, 0);
  const maxY = Math.min(y+1, stateArray.length);
  let neighborCount = 0;
  for(let i=minX; i<maxX; i++) {
    for(let j=minY; j<maxY; j++) {
      if(stateArray[j][i]) {
        neighborCount++;
      }
    }
  }
  return neighborCount-1;
}

const advanceState = (prevState: boolean[][], width: number, height: number) => {
  // TODO: hardcoded state
  let newState = new Array(height).fill(new Array(width));
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

const CellRenderer = ({columnIndex, rowIndex, style}: CellRendererProps) => {
  const [cellActive, setCellActive] = useState(false);
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setCellActive((prevState: boolean) => !prevState);
  }
  return (
    <StyledCell style={style} isActive={cellActive} onClick={onClick}>cell {columnIndex}-{rowIndex}</StyledCell>
  )
}
function App() {
  const GRID_SIZE = 10;
  const [gridState, setGridState] = useState(
    new Array(GRID_SIZE).fill(new Array(GRID_SIZE).fill(false))
  );

  const step = () => {
    setGridState(advanceState(gridState, GRID_SIZE, GRID_SIZE));
  }

  // TODO: update to actually use current state to render properly
  return (
    <div className="App">
      <FixedSizeGrid columnWidth={80} rowHeight={80}
        columnCount={GRID_SIZE} rowCount={GRID_SIZE}
        itemData={gridState} width={800} height={800}>
          {CellRenderer}
      </FixedSizeGrid>
      <div>
        <button onClick={step}>Step</button>
      </div>
    </div>
  );
}

export default App;
