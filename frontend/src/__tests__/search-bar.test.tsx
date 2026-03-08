import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { SearchBar } from "@/components/features/search/SearchBar"

describe("SearchBar", () => {
  it("renders the search input", () => {
    render(<SearchBar value="" onChange={jest.fn()} resultCount={0} />)
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("shows the current value", () => {
    render(<SearchBar value="buy milk" onChange={jest.fn()} resultCount={0} />)
    expect(screen.getByDisplayValue("buy milk")).toBeInTheDocument()
  })

  it("calls onChange when user types", () => {
    const onChange = jest.fn()
    render(<SearchBar value="" onChange={onChange} resultCount={0} />)
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "task" } })
    expect(onChange).toHaveBeenCalledWith("task")
  })

  it("shows result count when query is active", () => {
    render(<SearchBar value="hello" onChange={jest.fn()} resultCount={5} />)
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it("has accessible placeholder text", () => {
    render(<SearchBar value="" onChange={jest.fn()} resultCount={0} />)
    const input = screen.getByRole("textbox")
    expect(input).toHaveAttribute("placeholder")
  })

  it("clears value when cleared", () => {
    const onChange = jest.fn()
    render(<SearchBar value="text" onChange={onChange} resultCount={1} />)
    // Simulate clearing via onChange with empty string
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } })
    expect(onChange).toHaveBeenCalledWith("")
  })
})
