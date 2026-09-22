import { render } from "@testing-library/react";
import App from "./App";

test("App renders", () => {
  render(<App />);
  expect(true).toBe(true);
});
