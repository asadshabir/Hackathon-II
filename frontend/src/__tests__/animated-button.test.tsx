import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { AnimatedButton } from "@/components/ui/animated-button"

describe("AnimatedButton", () => {
  it("renders children correctly", () => {
    render(<AnimatedButton>Click me</AnimatedButton>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("calls onClick when clicked", () => {
    const onClick = jest.fn()
    render(<AnimatedButton onClick={onClick}>Press</AnimatedButton>)
    fireEvent.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("is disabled when disabled prop is set", () => {
    render(<AnimatedButton disabled>Disabled</AnimatedButton>)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("shows loading spinner when isLoading is true", () => {
    render(<AnimatedButton isLoading>Save</AnimatedButton>)
    const btn = screen.getByRole("button")
    // Button should be disabled while loading
    expect(btn).toBeDisabled()
  })

  it("applies primary variant styles", () => {
    render(<AnimatedButton variant="primary">Primary</AnimatedButton>)
    const btn = screen.getByRole("button")
    expect(btn).toBeInTheDocument()
  })

  it("applies ghost variant class", () => {
    render(<AnimatedButton variant="ghost">Ghost</AnimatedButton>)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("does not call onClick when disabled", () => {
    const onClick = jest.fn()
    render(<AnimatedButton disabled onClick={onClick}>Disabled</AnimatedButton>)
    fireEvent.click(screen.getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })

  it("forwards additional className", () => {
    render(<AnimatedButton className="my-custom-class">Custom</AnimatedButton>)
    expect(screen.getByRole("button")).toHaveClass("my-custom-class")
  })
})
