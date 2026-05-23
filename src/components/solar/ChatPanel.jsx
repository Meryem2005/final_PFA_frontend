import MessageBubble from "./MessageBubble";

export default function ChatPanel({
  messages,
  question,
  setQuestion,
  sendQuestion,
}) {

  return (
    <main className="flex-1 flex flex-col bg-[#ece8e1] ml-[320px] mr-[320px] h-screen overflow-hidden">

      {/* CHAT */}

      <div className="flex-1 overflow-y-auto px-10 py-12 pb-40">

        <div className="max-w-5xl mx-auto space-y-6">

          {messages.map((msg, index) => (

            <MessageBubble
              key={index}
              type={msg.type}
              text={msg.text}
            />

          ))}

        </div>

      </div>

      {/* INPUT */}

      <div className="border-t border-gray-300 bg-[#ece8e1] p-6">

        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border flex items-center px-6 py-4">

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 outline-none text-gray-700 text-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendQuestion();
              }
            }}
          />

          <button
            onClick={() => sendQuestion()}
            className="bg-[#f5a623] p-4 rounded-2xl text-white ml-4"
          >
            ➤
          </button>

        </div>

      </div>

    </main>
  );
}