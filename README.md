# Axiom 🌙☀️

Axiom is a stylish React calculator with a richer interface than a basic keypad. It supports standard arithmetic, scientific functions, memory controls, keyboard input, live result previews, saved history, Solar/Lunar theme switching, and degree or radian angle modes.

## Features

- Responsive two-panel layout with a polished glass-style calculator surface
- Standard operators: addition, subtraction, multiplication, division, powers, percentages, and parentheses
- Scientific functions: `sin`, `cos`, `tan`, `sqrt`, `log`, and `ln`
- Constants for `pi` and `e`
- Memory tools: `MC`, `MR`, `M+`, and `M-`
- Persistent calculation history with quick result restore
- Degree and radian angle modes for trigonometry
- 🌙 Lunar and ☀️ Solar themes saved between sessions
- 📋 One-click result copying
- ✨ Friendly status, memory, and history touches
- Live preview while typing expressions
- Keyboard support for numbers, operators, `Enter`, `Escape`, and `Backspace`
- Safer custom expression parser instead of JavaScript `eval`

## Tech Stack

- React 18
- Create React App
- CSS Grid and responsive custom CSS
- React Testing Library

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

Run the test suite:

```bash
npm test
```

Build the production bundle:

```bash
npm run build
```

The optimized build will be created in the `build` folder.

## Project Structure

```text
src/
  Components/
    Calculator.js
  styles/
    Calculator.css
  App.js
  App.test.js
  index.js
```

## Notes

Trigonometric functions can run in degree or radian mode. History, theme, and angle mode are saved in `localStorage`.
