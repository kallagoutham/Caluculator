import { useEffect, useMemo, useState } from "react";
import "../styles/Calculator.css";

const formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 10,
});

const APP_NAME = "Axiom";
const STORAGE_KEYS = {
  angleMode: "axiom-angle-mode",
  history: "axiom-history",
  theme: "axiom-theme",
};

const THEME_DETAILS = {
  lunar: {
    currentIcon: "🌙",
    currentLabel: "Lunar",
    nextIcon: "☀️",
    nextLabel: "Solar",
  },
  solar: {
    currentIcon: "☀️",
    currentLabel: "Solar",
    nextIcon: "🌙",
    nextLabel: "Lunar",
  },
};

const buttons = [
  { label: "MC", action: "memory-clear", variant: "soft" },
  { label: "MR", action: "memory-recall", variant: "soft" },
  { label: "M+", action: "memory-add", variant: "soft" },
  { label: "M-", action: "memory-subtract", variant: "soft" },
  { label: "sin", value: "sin(", variant: "scientific" },
  { label: "cos", value: "cos(", variant: "scientific" },
  { label: "tan", value: "tan(", variant: "scientific" },
  { label: "C", action: "clear", variant: "danger" },
  { label: "ln", value: "ln(", variant: "scientific" },
  { label: "log", value: "log(", variant: "scientific" },
  { label: "sqrt", value: "sqrt(", variant: "scientific" },
  { label: "⌫", action: "backspace", variant: "danger" },
  { label: "π", value: "pi", variant: "constant" },
  { label: "e", value: "e", variant: "constant" },
  { label: "^", value: "^", variant: "operator" },
  { label: "÷", value: "/", variant: "operator" },
  { label: "7", value: "7" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "×", value: "*", variant: "operator" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "-", value: "-", variant: "operator" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "+", value: "+", variant: "operator" },
  { label: "(", value: "(", variant: "soft" },
  { label: "0", value: "0" },
  { label: ".", value: "." },
  { label: "=", action: "calculate", variant: "equals" },
  { label: ")", value: ")", variant: "soft" },
  { label: "%", value: "%", variant: "soft" },
  { label: "±", action: "negate", variant: "soft" },
  { label: "Ans", action: "answer", variant: "soft" },
];

const tokenPattern =
  /sin|cos|tan|sqrt|log|ln|pi|e|\d*\.\d+|\d+\.?|\S/g;

const displayExpression = (value) =>
  value
    .replaceAll("*", "×")
    .replaceAll("/", "÷")
    .replaceAll("sqrt", "√")
    .replaceAll("pi", "π");

const formatResult = (value) => {
  if (!Number.isFinite(value)) {
    throw new Error("Result is not finite");
  }

  if (Math.abs(value) >= 1e12 || (Math.abs(value) > 0 && Math.abs(value) < 1e-8)) {
    return value.toExponential(8).replace(/\.?0+e/, "e");
  }

  return formatter.format(Number(value.toFixed(10))).replaceAll(",", "");
};

const readStorage = (key, fallback) => {
  try {
    const savedValue = window.localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallback;
  } catch {
    return fallback;
  }
};

const closeOpenParentheses = (expression) => {
  const opened = (expression.match(/\(/g) || []).length;
  const closed = (expression.match(/\)/g) || []).length;
  return expression + ")".repeat(Math.max(opened - closed, 0));
};

const tokenize = (expression) => {
  const tokens = expression.match(tokenPattern) || [];
  return tokens.map((token) => {
    if (/^\d/.test(token) || token.startsWith(".")) return { type: "number", value: Number(token) };
    if (token === "pi") return { type: "number", value: Math.PI };
    if (token === "e") return { type: "number", value: Math.E };
    if (["sin", "cos", "tan", "sqrt", "log", "ln"].includes(token)) {
      return { type: "function", value: token };
    }
    return { type: "symbol", value: token };
  });
};

const createParser = (tokens, angleMode) => {
  let position = 0;
  const toRadians = (value) => (angleMode === "deg" ? (value * Math.PI) / 180 : value);

  const peek = () => tokens[position];
  const consume = () => tokens[position++];
  const match = (value) => {
    if (peek()?.value === value) {
      consume();
      return true;
    }
    return false;
  };

  const parsePrimary = () => {
    const token = consume();

    if (!token) throw new Error("Unexpected end of expression");
    if (token.type === "number") return token.value;

    if (token.type === "function") {
      if (!match("(")) throw new Error("Expected opening parenthesis");
      const value = parseExpression();
      if (!match(")")) throw new Error("Expected closing parenthesis");

      switch (token.value) {
        case "sin":
          return Math.sin(toRadians(value));
        case "cos":
          return Math.cos(toRadians(value));
        case "tan":
          return Math.tan(toRadians(value));
        case "sqrt":
          return Math.sqrt(value);
        case "log":
          return Math.log10(value);
        case "ln":
          return Math.log(value);
        default:
          throw new Error("Unknown function");
      }
    }

    if (token.value === "(") {
      const value = parseExpression();
      if (!match(")")) throw new Error("Expected closing parenthesis");
      return value;
    }

    if (token.value === "-") return -parsePrimary();
    if (token.value === "+") return parsePrimary();

    throw new Error("Unexpected token");
  };

  const parsePower = () => {
    let value = parsePrimary();

    while (match("^")) {
      value = Math.pow(value, parsePrimary());
    }

    while (match("%")) {
      value /= 100;
    }

    return value;
  };

  const parseTerm = () => {
    let value = parsePower();

    while (peek() && ["*", "/"].includes(peek().value)) {
      const operator = consume().value;
      const nextValue = parsePower();
      value = operator === "*" ? value * nextValue : value / nextValue;
    }

    return value;
  };

  const parseExpression = () => {
    let value = parseTerm();

    while (peek() && ["+", "-"].includes(peek().value)) {
      const operator = consume().value;
      const nextValue = parseTerm();
      value = operator === "+" ? value + nextValue : value - nextValue;
    }

    return value;
  };

  const result = parseExpression();
  if (position < tokens.length) throw new Error("Could not parse expression");
  return result;
};

const evaluateExpression = (expression, angleMode = "deg") => {
  const preparedExpression = closeOpenParentheses(expression);
  return createParser(tokenize(preparedExpression), angleMode);
};

const Calculator = () => {
  const [expression, setExpression] = useState("");
  const [answer, setAnswer] = useState("0");
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState(() => readStorage(STORAGE_KEYS.history, []));
  const [status, setStatus] = useState("Ready");
  const [angleMode, setAngleMode] = useState(() => readStorage(STORAGE_KEYS.angleMode, "deg"));
  const [theme, setTheme] = useState(() => readStorage(STORAGE_KEYS.theme, "lunar"));
  const [copied, setCopied] = useState(false);
  const themeDetails = THEME_DETAILS[theme];

  const preview = useMemo(() => {
    if (!expression) return answer;

    try {
      return formatResult(evaluateExpression(expression, angleMode));
    } catch {
      return "Waiting...";
    }
  }, [angleMode, answer, expression]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.angleMode, JSON.stringify(angleMode));
  }, [angleMode]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    if (!copied) return undefined;

    const timeout = window.setTimeout(() => setCopied(false), 1300);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const appendValue = (value) => {
    setExpression((current) => {
      if (current === "Error") return value;
      return current + value;
    });
    setStatus("Editing");
  };

  const calculate = () => {
    if (!expression) return;

    try {
      const result = formatResult(evaluateExpression(expression, angleMode));
      setHistory((current) =>
        [
          { expression: displayExpression(expression), mode: angleMode.toUpperCase(), result },
          ...current,
        ].slice(0, 6)
      );
      setAnswer(result);
      setExpression(result);
      setStatus("Solved");
    } catch {
      setExpression("Error");
      setStatus("Check the expression");
    }
  };

  const runAction = (action) => {
    if (action === "clear") {
      setExpression("");
      setStatus("Cleared");
    }

    if (action === "backspace") {
      setExpression((current) => (current === "Error" ? "" : current.slice(0, -1)));
      setStatus("Editing");
    }

    if (action === "calculate") calculate();

    if (action === "negate") {
      setExpression((current) => (current ? `-(${current})` : "-"));
      setStatus("Sign flipped");
    }

    if (action === "answer") {
      appendValue(answer);
    }

    if (action === "memory-clear") {
      setMemory(0);
      setStatus("Memory cleared");
    }

    if (action === "memory-recall") {
      appendValue(formatResult(memory));
      setStatus("Memory recalled");
    }

    if (action === "memory-add" || action === "memory-subtract") {
      try {
        const value = expression ? evaluateExpression(expression, angleMode) : Number(answer);
        setMemory((current) =>
          action === "memory-add" ? current + value : current - value
        );
        setStatus(action === "memory-add" ? "Added to memory" : "Subtracted from memory");
      } catch {
        setStatus("Memory needs a valid value");
      }
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setStatus("Result copied");
    } catch {
      setStatus("Copy unavailable");
    }
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const keyMap = {
        Enter: "calculate",
        Escape: "clear",
        Backspace: "backspace",
      };

      if (/^[0-9+\-*/().%^]$/.test(event.key)) {
        event.preventDefault();
        appendValue(event.key);
      }

      if (keyMap[event.key]) {
        event.preventDefault();
        runAction(keyMap[event.key]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <main className="calculator-page" data-theme={theme}>
      <section className="calculator-shell" aria-label="Advanced calculator">
        <div className="brand-panel">
          <div className="brand-header">
            <h1>{APP_NAME}</h1>
            <button
              type="button"
              className="theme-toggle"
              aria-label={`Switch to ${themeDetails.nextLabel} theme`}
              onClick={() => setTheme((current) => (current === "lunar" ? "solar" : "lunar"))}
            >
              <span aria-hidden="true">{themeDetails.nextIcon}</span>
            </button>
          </div>
          <div className="theme-chip">
            {themeDetails.currentLabel} workspace
          </div>
          <div className="angle-toggle" aria-label="Angle mode">
            <button
              type="button"
              className={angleMode === "deg" ? "active" : ""}
              onClick={() => setAngleMode("deg")}
            >
              Deg
            </button>
            <button
              type="button"
              className={angleMode === "rad" ? "active" : ""}
              onClick={() => setAngleMode("rad")}
            >
              Rad
            </button>
          </div>
          <div className="stats-grid" aria-label="Calculator status">
            <div>
              <span>Mode</span>
              <strong>{angleMode === "deg" ? "📐 Degrees" : "🌀 Radians"}</strong>
            </div>
            <div>
              <span>Memory</span>
              <strong>{formatResult(memory)}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{status}</strong>
            </div>
          </div>
          <div className="history-panel" aria-label="Recent calculations">
            <div className="panel-heading">
              <span>🧾 History</span>
              <button
                type="button"
                className="tiny-button"
                aria-label="Clear history"
                onClick={() => setHistory([])}
              >
                <span aria-hidden="true">🗑️</span>
              </button>
            </div>
            {history.length ? (
              <ul>
                {history.map((item, index) => (
                  <li key={`${item.expression}-${index}`}>
                    <button type="button" onClick={() => setExpression(item.result)}>
                      <span>
                        {item.expression} · {item.mode || "DEG"}
                      </span>
                      <strong>{item.result}</strong>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-history">🌙 No calculations yet.</p>
            )}
          </div>
        </div>

        <div className="calculator-card">
          <div className="display-panel">
            <div className="display-actions">
              <div className="mini-display">{displayExpression(expression) || "0"}</div>
              <button
                type="button"
                className={`copy-button ${copied ? "copied" : ""}`}
                aria-label={copied ? "Result copied" : "Copy result"}
                onClick={copyResult}
              >
                {copied ? (
                  <span className="copy-check" aria-hidden="true">✓</span>
                ) : (
                  <span className="copy-icon" aria-hidden="true" />
                )}
              </button>
            </div>
            <output className="main-display" aria-label="Result" aria-live="polite">
              {preview}
            </output>
          </div>

          <div className="button-grid">
            {buttons.map((button) => (
              <button
                type="button"
                key={button.label}
                className={`calc-button ${button.variant || "number"}`}
                onClick={() =>
                  button.action ? runAction(button.action) : appendValue(button.value)
                }
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Calculator;
