import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import axios from "axios";
import Register from "./Register";
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

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRouterMocks();
  });

  test("renders registration form", () => {
    renderWithProviders(<Register />);

    expect(screen.getByTestId("register-form")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  test("handles form validation", async () => {
    renderWithProviders(<Register />);

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test("handles successful registration", async () => {
    const mockNavigate = vi.fn();
    vi.mock("react-router-dom", () => ({
      ...vi.importActual("react-router-dom"),
      useNavigate: () => mockNavigate,
    }));

    axios.post.mockResolvedValueOnce({
      data: { message: "Registration successful" },
    });

    renderWithProviders(<Register />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register"),
        {
          email: "test@example.com",
          firstname: "John",
          lastname: "Doe",
          password: "password123",
        }
      );
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("handles registration failure", async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { message: "Email already exists" },
      },
    });

    renderWithProviders(<Register />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  test("validates password strength", async () => {
    renderWithProviders(<Register />);

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "weak" },
    });

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });
});
