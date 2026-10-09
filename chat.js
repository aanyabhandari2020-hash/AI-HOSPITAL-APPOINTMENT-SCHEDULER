
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("healthChatForm");
  const input = document.getElementById("healthChatInput");
  const messages = document.getElementById("healthChatMessages");
  const sendButton = document.getElementById("healthChatSend");

  // Replace this with your deployed Supabase Edge Function URL.
  const CHAT_API_URL =
    "https://YOUR_PROJECT_REF.supabase.co/functions/v1/health-chat";

  const history = [];
  let busy = false;

  function addMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = role === "user"
      ? "health-chat-message user-message"
      : "health-chat-message ai-message";

    const label = document.createElement("strong");
    label.textContent = role === "user"
      ? "You"
      : "MediSlot AI Health Assistant";

    const body = document.createElement("p");
    body.textContent = text;

    bubble.append(label, body);
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = input.value.trim();

    if (!message || busy) return;

    if (message.length > 1500) {
      addMessage("assistant", "Please keep your message under 1,500 characters.");
      return;
    }

    if (CHAT_API_URL.includes("YOUR_PROJECT_REF")) {
      addMessage(
        "assistant",
        "The chat backend has not been configured yet. Please complete the Supabase setup."
      );
      return;
    }

    busy = true;
    sendButton.disabled = true;
    input.disabled = true;

    addMessage("user", message);
    input.value = "";

    const loading = addMessage("assistant", "Preparing a response…");

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          history: history.slice(-8)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The health assistant is unavailable.");
      }

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("The assistant returned an empty response.");
      }

      loading.querySelector("p").textContent = data.reply;

      history.push(
        { role: "user", content: message },
        { role: "assistant", content: data.reply }
      );

      // Keep only the latest 8 conversation messages.
      if (history.length > 8) {
        history.splice(0, history.length - 8);
      }
    } catch (error) {
      loading.querySelector("p").textContent =
        "Sorry, I couldn't connect to the health assistant. " +
        "Please try again later. If your symptoms are severe or urgent, " +
        "seek medical care instead of waiting for a chat response.";

      console.error("MediSlot chat error:", error.message);
    } finally {
      busy = false;
      sendButton.disabled = false;
      input.disabled = false;
      input.focus();
    }
  });
});
