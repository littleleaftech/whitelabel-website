import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import App from "./App";

describe("<App />", () => {
  it("should render app", () => {
    render(<App />);
    expect(screen.getByText("This is the header")).toBeInTheDocument();
  });
});
