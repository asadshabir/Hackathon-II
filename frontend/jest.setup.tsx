import "@testing-library/jest-dom"

// Mock next/navigation used by many components
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = "MockLink"
  return MockLink
})

// Silence framer-motion in tests (no animation, no errors)
jest.mock("framer-motion", () => {
  const actual = jest.requireActual<typeof import("framer-motion")>("framer-motion")
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_: object, tag: string) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Comp = ({ children, ...props }: any) =>
            require("react").createElement(tag, props, children)
          Comp.displayName = `motion.${tag}`
          return Comp
        },
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useReducedMotion: () => false,
  }
})

// Suppress console.error for known non-issues
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("act("))
    ) return
    originalError(...args)
  }
})
afterAll(() => { console.error = originalError })
