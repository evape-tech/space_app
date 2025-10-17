import React, { useState, useRef } from "react";

const InputCode = ({ length, label, loading, onComplete, onKeyPress }) => {
  const [code, setCode] = useState([...Array(length)].map(() => ""));
  const inputs = useRef([]);
  // Typescript
  // useRef<(HTMLInputElement | null)[]>([])

  const processInput = (e, slot) => {
    let ch = e.target.value;
    if (!ch) return;
    // 允許英文字母與數字，並將字母轉為大寫
    ch = ch.toString().slice(-1);
    if (!/^[a-zA-Z0-9]$/.test(ch)) return;
    ch = /^[a-zA-Z]$/.test(ch) ? ch.toUpperCase() : ch;
    const newCode = [...code];
    newCode[slot] = ch;
    setCode(newCode);
    if (slot !== length - 1) {
      inputs.current[slot + 1].focus();
    }
    if (newCode.every((num) => num !== "")) {
      onComplete(newCode.join(""));
    }
  };

  const onKeyUp = (e, slot) => {
    if (e.keyCode === 8 && !code[slot] && slot !== 0) {
      const newCode = [...code];
      newCode[slot - 1] = "";
      setCode(newCode);
      inputs.current[slot - 1].focus();
    }
    onKeyPress([...code].join("").length);
  };

  return (
    <div className="code-input">
      <style jsx>
        {`
          .code-input {
            display: flex;
            flex-direction: column;
            align-items: start;
          }
          .code-label {
            margin-bottom: 16px;
          }
          .code-inputs {
            display: flex;
            justify-content: start;
            align-items: center;
          }
          .code-inputs input {
            border: none;
            background-image: none;
            background-color: transparent;
            color: #888;
            -webkit-box-shadow: none;
            -moz-box-shadow: none;
            box-shadow: none;
            text-align: center;
            height: 60px;
            width: 40px;
            border-radius: 5px;
            margin: 0 4px;
            border: 1px solid #ccc;
            font-size: 38px;
          }
          .code-inputs input:focus {
            outline: none;
          }
          .code-inputs input:nth-child(3n) {
             {
              /* margin-right: 24px; */
            }
          }
        `}
      </style>
      <label className="code-label">{label}</label>
      <div className="code-inputs">
        {code.map((num, idx) => {
          return (
            <input
              key={idx}
              type="text"
              inputMode="text"
              pattern="[A-Za-z0-9]"
              maxLength={1}
              value={num}
              autoFocus={!code[0].length && idx === 0}
              readOnly={loading}
              onChange={(e) => processInput(e, idx)}
              onKeyUp={(e) => onKeyUp(e, idx)}
              ref={(ref) => (inputs.current[idx] = ref)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default InputCode;
