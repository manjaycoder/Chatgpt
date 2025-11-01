import { vi } from "vitest";
import React from "react";

// Mock storage for route history
const routeHistory = [];
const mockNavigate = vi.fn((to) => routeHistory.push(to));

// Create a mock location object
const mockLocation = {
  pathname: "/",
  search: "",
  hash: "",
  state: null,
};

// Create mock components
const mockComponents = {
  BrowserRouter: ({ children }) => <>{children}</>,
  Routes: ({ children }) => <>{children}</>,
  Route: ({ path, element }) => <div data-path={path}>{element}</div>,
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  Navigate: ({ to }) => <div>Redirecting to {to}</div>,
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  useParams: () => ({}),
  generatePath: (path, params) => path,
};

// Export individual mocks for direct use
export const {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  generatePath,
} = mockComponents;

// Setup the mock for react-router-dom
vi.mock("react-router-dom", () => mockComponents);

// Export utility functions
export const resetRouterMocks = () => {
  routeHistory.length = 0;
  mockNavigate.mockClear();
  Object.assign(mockLocation, {
    pathname: "/",
    search: "",
    hash: "",
    state: null,
  });
};

export const getRouteHistory = () => [...routeHistory];
export { mockNavigate, mockLocation };
