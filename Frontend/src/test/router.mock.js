import { vi } from "vitest";

// Mock all router exports including hooks
export const mockNavigate = vi.fn();
export const mockLocation = {
  pathname: "/",
  search: "",
  hash: "",
  state: null,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    BrowserRouter: ({ children }) => <>{children}</>,
    Navigate: ({ to }) => <div>Redirecting to {to}</div>,
  };
});
