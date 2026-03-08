import React from "react"
import { render } from "@testing-library/react"
import {
  ClayCheckIcon,
  ClayPlusIcon,
  ClayTrashIcon,
  ClayCalendarIcon,
  ClayChartIcon,
  ClayBotIcon,
  ClayIcons,
} from "@/components/ui/clay-icons"

describe("Clay Icons", () => {
  describe("ClayCheckIcon", () => {
    it("renders without crashing", () => {
      const { container } = render(<ClayCheckIcon />)
      expect(container.querySelector("svg")).toBeInTheDocument()
    })

    it("respects custom size", () => {
      const { container } = render(<ClayCheckIcon size={64} />)
      const svg = container.querySelector("svg")
      expect(svg).toHaveAttribute("width", "64")
      expect(svg).toHaveAttribute("height", "64")
    })

    it("applies custom className", () => {
      const { container } = render(<ClayCheckIcon className="my-icon" />)
      expect(container.firstChild).toHaveClass("my-icon")
    })
  })

  describe("ClayPlusIcon", () => {
    it("renders without crashing", () => {
      const { container } = render(<ClayPlusIcon />)
      expect(container.querySelector("svg")).toBeInTheDocument()
    })
  })

  describe("ClayTrashIcon", () => {
    it("renders without crashing", () => {
      const { container } = render(<ClayTrashIcon />)
      expect(container.querySelector("svg")).toBeInTheDocument()
    })
  })

  describe("ClayCalendarIcon", () => {
    it("renders without crashing", () => {
      const { container } = render(<ClayCalendarIcon />)
      expect(container.querySelector("svg")).toBeInTheDocument()
    })
  })

  describe("ClayChartIcon", () => {
    it("renders without crashing", () => {
      const { container } = render(<ClayChartIcon />)
      expect(container.querySelector("svg")).toBeInTheDocument()
    })
  })

  describe("ClayBotIcon", () => {
    it("renders without crashing", () => {
      const { container } = render(<ClayBotIcon />)
      expect(container.querySelector("svg")).toBeInTheDocument()
    })
  })

  describe("ClayIcons map", () => {
    it("exports all 6 icons", () => {
      expect(Object.keys(ClayIcons)).toHaveLength(6)
    })

    it("each icon renders", () => {
      Object.values(ClayIcons).forEach((Icon) => {
        const { container } = render(<Icon />)
        expect(container.querySelector("svg")).toBeInTheDocument()
      })
    })
  })

  describe("animate=false", () => {
    it("renders a plain div wrapper instead of motion.div", () => {
      const { container } = render(<ClayCheckIcon animate={false} />)
      expect(container.firstChild?.nodeName).toBe("DIV")
    })
  })
})
