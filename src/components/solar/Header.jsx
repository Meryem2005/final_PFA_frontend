import { Sun } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#163b67] flex items-center justify-between px-8 border-b border-[#0e2744]">

      <div className="flex items-center gap-3">

        <div className="w-8 h-8 rounded bg-[#f5a623] flex items-center justify-center">
          <Sun size={18} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white">
          Solar <span className="text-[#f5a623]">AI</span>
        </h1>

      </div>

      <button className="bg-[#f5a623] text-white px-5 py-2 rounded-full text-sm font-semibold">
        Agent Dimensionnement PV
      </button>

    </header>
  );
}