import React from "react"
import { render, screen } from "@testing-library/react"
import { CheckCircle } from "lucide-react"
import { StatsCard } from "@/components/features/todos/StatsCard"

describe("StatsCard", () => {
  const defaultProps = {
    title: "Total",
    value: 42,
    icon: CheckCircle,
    accentColor: "#6366F1",
  }

  it("renders the title", () => {
    render(<StatsCard {...defaultProps} />)
    expect(screen.getByText("Total")).toBeInTheDocument()
  })

  it("renders the numeric value", () => {
    render(<StatsCard {...defaultProps} />)
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("renders a value of zero", () => {
    render(<StatsCard {...defaultProps} value={0} />)
    expect(screen.getByText("0")).toBeInTheDocument()
  })

  it("applies the accent color to the value", () => {
    render(<StatsCard {...defaultProps} />)
    const value = screen.getByText("42")
    expect(value).toHaveStyle({ color: "#6366F1" })
  })

  it("renders the icon element", () => {
    render(<StatsCard {...defaultProps} />)
    // SVG from lucide-react should be present
    const svg = document.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("renders a large value correctly", () => {
    render(<StatsCard {...defaultProps} value={9999} />)
    expect(screen.getByText("9999")).toBeInTheDocument()
  })
})
