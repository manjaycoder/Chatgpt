import { vi } from "vitest";
import React from "react";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    BrowserRouter: ({ children }) => <div>{children}</div>,
    useNavigate: () => vi.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});
