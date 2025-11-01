import React, { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import ChatMobileBar from "../components/chat/ChatMobileBar.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import ChatMessages from "../components/chat/ChatMessages.jsx";
import ChatComposer from "../components/chat/ChatComposer.jsx";
import "../components/chat/ChatLayout.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  addUserMessage,
  addAIMessage,
  setChats,
} from "../store/chatSlice.js";

const Home = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);
  const activeChatId = useSelector((state) => state.chat.activeChatId);
  const input = useSelector((state) => state.chat.input);
  const isSending = useSelector((state) => state.chat.isSending);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  // ✅ Fetch chats once
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/chat/", {
          withCredentials: true,
        });
        dispatch(setChats(res.data.chats.reverse()));
      } catch (err) {
        console.error("Failed to load chats:", err);
      }
    };
    fetchChats();
  }, [dispatch]);

  // ✅ Connect socket ONCE
  useEffect(() => {
    const tempSocket = io("http://localhost:3000", {
      withCredentials: true,
    });

    tempSocket.on("ai-response", (messagePayload) => {
      console.log("Received AI response:", messagePayload);

      setMessages((prev) => [
        ...prev,
        { type: "ai", content: messagePayload.content },
      ]);

      // use payload.chat instead of stale activeChatId
      dispatch(addAIMessage(messagePayload.chat, messagePayload.content));
      dispatch(sendingFinished());
    });

    setSocket(tempSocket);

    return () => {
      tempSocket.disconnect(); // ✅ cleanup
    };
  }, [dispatch]);

  // ✅ Fetch Messages
  const getMessages = useCallback(async (chatId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/chat/messages/${chatId}`,
        { withCredentials: true }
      );

      const formatted = res.data.messages.map((m) => ({
        type: m.role === "user" ? "user" : "ai",
        content: m.content,
      }));

      setMessages(formatted);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, []);

  // ✅ New Chat
  const handleNewChat = async () => {
    let title = window.prompt("Enter a title for the new chat:", "");
    if (title) title = title.trim();
    if (!title) return;

    try {
      const res = await axios.post(
        "http://localhost:3000/api/chat/",
        { title },
        { withCredentials: true }
      );
      dispatch(startNewChat(res.data.chat));
      setSidebarOpen(false);
      await getMessages(res.data.chat._id);
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  // ✅ Send Message
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeChatId || isSending) return;

    dispatch(sendingStarted());

    const newMsg = { type: "user", content: trimmed };
    setMessages((prev) => [...prev, newMsg]);
    dispatch(addUserMessage(activeChatId, trimmed));
    dispatch(setInput(""));

    try {
      socket.emit("ai-message", {
        chat: activeChatId,
        content: trimmed,
      });
    } catch (err) {
      console.error("Socket emit error:", err);
      dispatch(addAIMessage(activeChatId, "Error sending message.", true));
      dispatch(sendingFinished());
    }
  };

  return (
    <div className="chat-layout minimal" data-testid="chat-layout">
      <div data-testid="chat-mobile-bar">
        <ChatMobileBar
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          onNewChat={handleNewChat}
        />
      </div>
      <div data-testid="chat-sidebar" className={sidebarOpen ? "open" : ""}>
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            dispatch(selectChat(id));
            setSidebarOpen(false);
            getMessages(id);
          }}
          onNewChat={handleNewChat}
          open={sidebarOpen}
        />
      </div>
      <main className="chat-main" role="main">
        {messages.length === 0 && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="chip">Early Preview</div>
            <h1>ChatGPT Clone</h1>
            <p>
              Ask anything. Paste text, brainstorm ideas, or get quick
              explanations. Your chats stay in the sidebar so you can pick up
              where you left off.
            </p>
          </div>
        )}
        <ChatMessages messages={messages} isSending={isSending} />
        {activeChatId && (
          <div data-testid="chat-composer">
            <ChatComposer
              input={input}
              setInput={(v) => dispatch(setInput(v))}
              onSend={sendMessage}
              isSending={isSending}
            />
          </div>
        )}
      </main>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
