import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Home from "./Home";
import { renderWithProviders } from "../test/test-utils";

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

// Mock axios
vi.mock("axios", () => ({
  get: vi.fn(() => Promise.resolve({ data: { chats: [], messages: [] } })),
  post: vi.fn(() =>
    Promise.resolve({ data: { chat: { _id: "testid", title: "Test Chat" } } })
  ),
}));

// Mock child components
vi.mock("../components/chat/ChatMessages.jsx", () => ({
  default: ({ messages, isSending }) => (
    <div data-testid="chat-messages">
      {messages && messages.map
        ? messages.map((msg, i) => (
            <div key={i} data-testid={`message-${i}`}>
              {msg.content}
            </div>
          ))
        : null}
      {isSending && <span>sending...</span>}
    </div>
  ),
}));

vi.mock("../components/chat/ChatMobileBar.jsx", () => ({
  default: ({ onToggleSidebar, onNewChat }) => (
    <div data-testid="chat-mobile-bar">
      <button onClick={onToggleSidebar}>Toggle</button>
      <button onClick={onNewChat}>New Chat</button>
    </div>
  ),
}));

vi.mock("../components/chat/ChatSidebar.jsx", () => ({
  default: ({ chats, onSelectChat, onNewChat }) => (
    <div data-testid="chat-sidebar-mock">
      <button onClick={() => onSelectChat && onSelectChat("testid")}>
        Select Chat
      </button>
      <button onClick={onNewChat}>New Chat</button>
    </div>
  ),
}));

vi.mock("../components/chat/ChatComposer.jsx", () => ({
  default: ({ input, setInput, onSend, isSending }) => (
    <form
      data-testid="chat-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSend && onSend();
      }}
    >
      <input
        data-testid="message-input"
        value={input || ""}
        onChange={(e) => setInput && setInput(e.target.value)}
      />
      <button type="submit" disabled={isSending}>
        Send
      </button>
    </form>
  ),
}));

describe("Home Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders chat layout and children", () => {
    renderWithProviders(<Home />);
    expect(screen.getByTestId("chat-layout")).toBeInTheDocument();
    expect(screen.getByTestId("chat-mobile-bar")).toBeInTheDocument();
    expect(screen.getByTestId("chat-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("chat-messages")).toBeInTheDocument();
  });

  it("shows welcome when no messages", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/ChatGPT Clone/i)).toBeInTheDocument();
    expect(screen.getByText(/Ask anything/i)).toBeInTheDocument();
  });

  it("can open and close sidebar", () => {
    renderWithProviders(<Home />);
    const toggleBtn = screen.getByText("Toggle");
    fireEvent.click(toggleBtn);
    // Sidebar open state is visual, but we can check the class
    expect(screen.getByTestId("chat-sidebar").className).toContain("open");
  });

  it("can type and send a message", () => {
    renderWithProviders(<Home />);
    const input = screen.getByTestId("message-input");
    fireEvent.change(input, { target: { value: "Hello world" } });
    expect(input.value).toBe("Hello world");
    const form = screen.getByTestId("chat-form");
    fireEvent.submit(form);
    // After submit, input should clear
    expect(input.value).toBe("");
  });
});
