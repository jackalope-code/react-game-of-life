import React, {useState} from 'react';
import styled from 'styled-components';

interface ToggledButtonTheme {
    toggledColor: string,
    defaultColor: string
}
interface StyledButtonProps {
    showActive: boolean,
    theme: ToggledButtonTheme
}

const StyledButton = styled.button<StyledButtonProps>`
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 2px;
  margin: 10px;
  background-color: ${props => ( props.showActive ? props.theme.toggledColor : props.theme.defaultColor )};
  border: 2px solid black;
  // display: inline-block;
  font-size: 24px;
`;

interface ToggledButtonProps {
    toggledText: {
        first: string,
        second: string
    },
    theme: ToggledButtonTheme,
    onClickCallback?: (e: React.MouseEvent<HTMLButtonElement>, toggleState: boolean) => void;
}

// TODO: Use render props, custom events, or some kind of context/state management to share state
// TODO: Use naming and nesting better??
const ToggledButton = ({toggledText, onClickCallback, theme}: ToggledButtonProps) => {
    const [buttonActive, setButtonActive] = useState(false);
    const handleMouseClickEvent = (e: React.MouseEvent<HTMLButtonElement>) => {
        if(onClickCallback) {
            onClickCallback(e, !buttonActive);
        }
        setButtonActive(prevState => !prevState);
    }
    const buttonText = !buttonActive ? toggledText.first : toggledText.second;

    return (
        <StyledButton showActive={buttonActive} onClick={handleMouseClickEvent} theme={theme}>{buttonText}</StyledButton>
    );
}

export default ToggledButton;