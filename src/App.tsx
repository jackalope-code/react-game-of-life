import React, {useState, useCallback } from 'react';
import './App.css';
import {FixedSizeGrid} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import styled from 'styled-components';
import {debounce} from 'lodash';
import ToggledButton from './components/ToggledButton';
import Button from './components/Button';

interface StateData {
  grid: boolean[][],
  useMultiSelect: boolean,
  clickHandler: (e: React.MouseEvent<HTMLDivElement>, columnIndex: number, rowIndex: number) => void;
}

interface CellRendererProps {
  columnIndex: number,
  rowIndex: number,
  style: React.CSSProperties,
  data: StateData
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
  let onMouseEnterHandler;
  let onMouseDownHandler;
  if(data.useMultiSelect) {
    onMouseEnterHandler = (e: React.MouseEvent<HTMLDivElement>) => data.clickHandler(e, columnIndex, rowIndex)
  } else {
    onMouseDownHandler = (e: React.MouseEvent<HTMLDivElement>) => data.clickHandler(e, columnIndex, rowIndex)
  }

  return (
    <StyledCell style={style} onMouseEnter={onMouseEnterHandler} onMouseDown={onMouseDownHandler} isActive={data.grid[rowIndex][columnIndex]}></StyledCell>
  )
}

function createNewDataGrid<DataType>(width: number, height: number, defaultValue: DataType): DataType[][] {
  const grid = new Array(height).fill(null);
  grid.forEach((element, i) => {
    grid[i] = new Array(width).fill(defaultValue);
  });
  return grid;
}

const startStopButtonTheme = {
  toggledColor: '#ff0000',
  defaultColor: '#00ff00'
}

let currentStartHandle: NodeJS.Timeout;

function App() {
  const GRID_SIZE = 100;
  const [gridState, setGridState] = useState(createNewDataGrid<boolean>(GRID_SIZE, GRID_SIZE, false));
  const [cellSliderValue, setCellSliderValue] = useState(40);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [frameRateSliderValue, setFrameRateSliderValue] = useState(4);
  // const [gameRunning, setGameRunning] = useState(false);
  

  const step = () => {
    setGridState(prevState => advanceState(prevState, GRID_SIZE, GRID_SIZE));
  }

  const start = useCallback(() => {
    if(currentStartHandle) {
      clearInterval(currentStartHandle);
    }
    // Cap max FPS from input
    step();
    currentStartHandle = setInterval(step, Math.max(1000/frameRateSliderValue, 100));
  }, [frameRateSliderValue]);

  const stop = () => {
    clearInterval(currentStartHandle);
  }

  const handleOnClick = (e: React.MouseEvent<HTMLDivElement>, columnIndex: number, rowIndex: number) => {
    // setCellActive((prevState: boolean) => !prevState);
    console.log('CLICK EVENT', columnIndex, rowIndex)
    console.log(gridState[columnIndex][rowIndex]);
    setGridState(prevState => immutableGridUpdate(prevState, columnIndex, rowIndex, !prevState[rowIndex][columnIndex]))

  }

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>, columnIndex: number, rowIndex: number) => {
    setGridState(prevState => immutableGridUpdate(prevState, columnIndex, rowIndex, true));
  }

  function immutableGridUpdate<T>(prevState: T[][], columnIndex: number, rowIndex: number, newValue: T): T[][] {
      const modifiedSlice = prevState[rowIndex].slice();
      modifiedSlice[columnIndex] = newValue;
      return [...prevState.slice(0, rowIndex), modifiedSlice, ...prevState.slice(rowIndex+1)]
  }

  // TODO: update to actually use current state to render properly
  const eventHandler = multiSelectMode ? debounce(handleMouseOver, 10) : handleOnClick;

  const slideEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrameRateSliderValue(parseFloat(e.currentTarget.value))
  }

  // const debouncedSlideEventHandler = debounce(slideEventHandler, 100);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>, toggledOn: boolean) => {
    // setGameRunning(toggledOn);
    console.log(toggledOn);
    if(toggledOn) {
      start();
    } else {
      stop()
    }
  }

  return (
    <div className="App">
      <div className="grid-container">
        <AutoSizer>
          {({width, height}) => (
            <FixedSizeGrid columnWidth={cellSliderValue} rowHeight={cellSliderValue}
              columnCount={GRID_SIZE} rowCount={GRID_SIZE}
              itemData={{grid: gridState, useMultiSelect: multiSelectMode, clickHandler: eventHandler}} width={width} height={height}
              // outerElementType={outerElementType}
            >
              {CellRenderer}
            </FixedSizeGrid>
          )}
        </AutoSizer>
      </div>
      <div className="view-controls">
        <ToggledButton toggledText={{first: 'Start', second: 'Stop'}} onClickCallback={handleToggle} theme={startStopButtonTheme}></ToggledButton>
        <Button onClick={step}>Step</Button>
        <Button onClick={() => alert('EVENT STUB! Write save function + event handling;')}>Save</Button>
        <label htmlFor="fps-slider">{frameRateSliderValue} FPS</label>
        <input type="range" min="0.5" max="10" value={frameRateSliderValue} onChange={slideEventHandler} id="fps-slider" />
        <label htmlFor="cell-slider">{cellSliderValue}px</label>
        <input type="range" min="15" max="100" value={cellSliderValue} onChange={(e) => setCellSliderValue(parseInt(e.currentTarget.value))} id="cell-slider"/>
        <label htmlFor="mouse-select-mode">Multi select mode</label>
        <input type="checkbox" defaultChecked={multiSelectMode} onChange={() => setMultiSelectMode(!multiSelectMode)} id="mouse-select-mode"></input>
      </div>
    </div>
  );
}

export default App;