const LLM_API = import.meta.env.VITE_LLM_API;

export async function sendPromptToLLM(prompt: string) {
  try {
    const response = await fetch(LLM_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    if (data.status === "success") {
      return data.response;
    } else {
      throw new Error(data.message || "Unknown error");
    }
  } catch (error) {
    console.error("Error contacting LLM API:", error);
    return "Error: Unable to contact LLM Agent.";
  }
}
