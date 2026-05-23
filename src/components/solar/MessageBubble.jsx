export default function MessageBubble({ type, text }) {
  return (
    <div
      className={`p-6 rounded-3xl shadow max-w-2xl whitespace-pre-line ${
        type === "user"
          ? "bg-[#163b67] text-white ml-auto"
          : "bg-white text-black"
      }`}
    >
      {text}
    </div>
  );
}