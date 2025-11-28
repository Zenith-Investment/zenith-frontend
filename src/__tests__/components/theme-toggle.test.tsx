import { render } from "@testing-library/react";
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
    const { getByRole } = render(<ThemeToggle />);

    // Should render a button
    const button = getByRole("button");
    expect(button).toBeTruthy();
  });

  it("has screen reader text", () => {
    const { getByText } = render(<ThemeToggle />);

    // Should have accessible text
    expect(getByText("Toggle theme")).toBeTruthy();
  });
});
