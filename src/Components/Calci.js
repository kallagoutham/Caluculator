import React, { useState } from "react";
import "../styles/Calci.css";


const Calci = () => {
  const [input, setInput] = useState("");
  const buttons = [
    { label: "AC", span: 2, type: "clear" },
    { label: "÷", span: 1, type: "operator" },
    { label: "×", span: 1, type: "operator" },
    { label: "7", span: 1, type: "number" },
    { label: "8", span: 1, type: "number" },
    { label: "9", span: 1, type: "number" },
    { label: "-", span: 1, type: "operator" },
    { label: "4", span: 1, type: "number" },
    { label: "5", span: 1, type: "number" },
    { label: "6", span: 1, type: "number" },
    { label: "+", span: 1, type: "operator" },
    { label: "1", span: 1, type: "number" },
    { label: "2", span: 1, type: "number" },
    { label: "3", span: 1, type: "number" },
    { label: "=", span: 2, type: "equal" },
    { label: "0", span: 2, type: "number" },
    { label: ".", span: 1, type: "number" },
  ];
  const handleClick = (value) => {
    setInput(input + value);
  };
  const handleClear = () => {
    setInput("");
  };
  const handleCalculate = () => {
    try {
        // eslint-disable-next-line
      setInput(eval(input).toString());
    } catch {
      setInput("Error");
    }
  };

  return (
    <div className="calculator">
      <div className="display">{input || "0"}</div>
      <div className="buttons">
        {buttons.map((button, index) => {
          if (button.type === "clear") {
            return (
              <button
                key={index}
                onClick={handleClear}
                className={`span-${button.span}`}
              >
                {button.label}
              </button>
            );
          } else if (button.type === "equal") {
            return (
              <button
                key={index}
                onClick={handleCalculate}
                className={`span-${button.span}`}
              >
                {button.label}
              </button>
            );
          } else {
            return (
              <button
                key={index}
                onClick={() => handleClick(button.label === "×" ? "*" : button.label)}
                className={`span-${button.span}`}
              >
                {button.label}
              </button>
            );
          }
        })}
      </div>
    </div>
  );
};

export default Calci;
