import { render, screen } from "@testing-library/react";
import { ThemeToggle } from "@/components/theme-toggle";

// Mock useTheme
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}));

describe("ThemeToggle", () => {
  it("renders the theme toggle button", () => {
    render(<ThemeToggle />);

    // Should render a button
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("has screen reader text", () => {
    render(<ThemeToggle />);

    // Should have accessible text
    expect(screen.getByText("Toggle theme")).toBeInTheDocument();
  });
});
