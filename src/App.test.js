import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import App from "./App";

beforeEach(() => {
  window.localStorage.clear();
});

test("renders the upgraded calculator", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: /axiom/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/advanced calculator/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /switch to solar theme/i })).toHaveTextContent("☀️");
  expect(screen.getByRole("button", { name: /deg/i })).toHaveClass("active");
  expect(screen.getByText(/history/i)).toBeInTheDocument();
});

test("calculates a mixed expression", async () => {
  render(<App />);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    fireEvent.click(screen.getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByRole("button", { name: "×" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "=" }));
  });

  expect(screen.getAllByText("23").length).toBeGreaterThan(0);
});

test("switches trigonometry between degree and radian modes", async () => {
  render(<App />);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "sin" }));
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
  });

  expect(screen.getByRole("status", { name: /result/i })).toHaveTextContent("1");

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /rad/i }));
  });

  expect(screen.getByRole("button", { name: /rad/i })).toHaveClass("active");
  expect(screen.getByRole("status", { name: /result/i })).not.toHaveTextContent("1");
});
