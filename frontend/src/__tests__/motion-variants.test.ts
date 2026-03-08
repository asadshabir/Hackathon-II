/**
 * motionVariants unit tests
 * Verify each variant has the expected shape without running Framer Motion.
 */
import {
  float,
  popIn,
  fadeSlide,
  listItem,
  stagger,
  clayFloat,
  checkDraw,
  scaleIn,
  slideInRight,
} from "@/lib/motionVariants"

describe("motionVariants", () => {
  describe("float", () => {
    it("has initial, hover and tap keys", () => {
      expect(float).toHaveProperty("initial")
      expect(float).toHaveProperty("hover")
      expect(float).toHaveProperty("tap")
    })
    it("hover lifts element upward (negative y)", () => {
      expect((float.hover as { y: number }).y).toBeLessThan(0)
    })
    it("tap scales element down", () => {
      expect((float.tap as { scale: number }).scale).toBeLessThan(1)
    })
  })

  describe("popIn", () => {
    it("has hidden, show and exit keys", () => {
      expect(popIn).toHaveProperty("hidden")
      expect(popIn).toHaveProperty("show")
      expect(popIn).toHaveProperty("exit")
    })
    it("hidden starts invisible", () => {
      expect((popIn.hidden as { opacity: number }).opacity).toBe(0)
    })
    it("show is fully visible", () => {
      expect((popIn.show as { opacity: number }).opacity).toBe(1)
    })
  })

  describe("stagger", () => {
    it("has hidden and show", () => {
      expect(stagger).toHaveProperty("hidden")
      expect(stagger).toHaveProperty("show")
    })
    it("show has staggerChildren transition", () => {
      const show = stagger.show as { transition: { staggerChildren: number } }
      expect(show.transition.staggerChildren).toBeGreaterThan(0)
    })
  })

  describe("checkDraw", () => {
    it("unchecked has pathLength 0", () => {
      expect((checkDraw.unchecked as { pathLength: number }).pathLength).toBe(0)
    })
    it("checked has pathLength 1", () => {
      expect((checkDraw.checked as { pathLength: number }).pathLength).toBe(1)
    })
  })

  describe("all variants export correctly", () => {
    const variants = [float, popIn, fadeSlide, listItem, stagger, clayFloat, checkDraw, scaleIn, slideInRight]
    it("exports 9 variant objects", () => {
      expect(variants).toHaveLength(9)
    })
    it("each variant is an object", () => {
      variants.forEach((v) => expect(typeof v).toBe("object"))
    })
  })
})
