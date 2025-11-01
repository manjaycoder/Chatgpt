import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import axios from "axios";
import Login from "./Login";
import { renderWithProviders } from "../test/test-utils";
import { resetRouterMocks, mockNavigate } from "../test/router-mock";

// Mock axios
vi.mock("axios");
// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  ToastContainer: () => null,
}));

describe("Login Component", () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    resetRouterMocks();
  });

  test("renders login form", () => {
    renderWithProviders(<Login />);

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test("handles form validation", async () => {
    renderWithProviders(<Login />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test("handles successful login", async () => {
    axios.post.mockResolvedValueOnce({ data: { token: "fake-token" } });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        {
          email: "test@example.com",
          password: "password123",
        }
      );
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("handles login failure", async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { message: "Invalid credentials" },
      },
    });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
