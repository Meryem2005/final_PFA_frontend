import { useState, useEffect, useRef } from "react";

import {
  Sun,
  Send,
  BarChart3,
  MessageSquare,
} from "lucide-react";

function App() {

  // STATES

  const [consommation, setConsommation] = useState(15);
  const [surface, setSurface] = useState(30);
  const [budget, setBudget] = useState(15000);
  const [inclinaison, setInclinaison] = useState(45);

  const [results, setResults] = useState(null);

  // CHAT

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([
    {
      type: "bot",
      text:
        "Bonjour 👋 Je peux vous aider à dimensionner votre installation solaire.",
    },
  ]);

  // FIX PAGE BLANCHE

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // SEND QUESTION

  const sendQuestion = async (text = question) => {

    if (!String(text).trim()) return;

    const userMessage = {
      type: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentQuestion =
      typeof text === "string" ? text : question;

    setQuestion("");

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: currentQuestion,
          }),
        }
      );

      const data = await response.json();

      const cleanResponse = data.response
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/"/g, "");

      const botMessage = {
        type: "bot",
        text: cleanResponse,
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "❌ Erreur connexion backend.",
        },
      ]);

    }
  };

  // CALCUL SOLAIRE

  const calculateSolar = async () => {

    const userMessage = {
      type: "user",
      text:
        `Calcule le dimensionnement pour ma maison à Casablanca, Maroc — ` +
        `${consommation} kWh/j ${surface} m² budget ${budget} €`,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/calculate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            consommation,
            surface,
            budget,
            inclinaison,
            localisation: "Casablanca",
            orientation: "Sud",
            installation_type: "Avec batterie",
          }),
        }
      );

      const data = await response.json();

      setResults(data);

      const botMessage = {
        type: "bot",
        text:
          `📊 Calcul terminé — Voici une synthèse pour Casablanca, Maroc :\n\n` +
          `☀️ Ton installation optimale : ${data.panneaux} panneaux (${data.power})\n\n` +
          `🔋 Batterie : ${data.battery}\n\n` +
          `⚡ Onduleur : ${data.inverter}\n\n` +
          `💰 Budget estimé : ${data.budget_estime}\n\n` +
          `☀️ Couverture de tes besoins : ${data.coverage}\n\n` +
          `📈 Retour sur investissement : ${data.roi}\n\n` +
          `⚡ Production estimée : ${data.production}\n\n` +
          `Tu as des questions sur ces résultats ?`,
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "❌ Erreur backend.",
        },
      ]);

    }
  };

  // START DISCUSSION

  const startDiscussion = async () => {

    const prompt =
      `Bonjour ! Je souhaite installer des panneaux solaires.\n\n` +
      `Localisation : Casablanca\n` +
      `Consommation : ${consommation} kWh/j\n` +
      `Surface : ${surface} m²\n` +
      `Budget : ${budget} €\n` +
      `Inclinaison : ${inclinaison}°\n\n` +
      `Peux-tu analyser ma situation ?`;

    sendQuestion(prompt);

  };

  // PDF

  const downloadPdf = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/generate-pdf",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            consommation,
            surface,

            panneaux: results?.panneaux || "N/A",
            battery: results?.battery || "N/A",
            inverter: results?.inverter || "N/A",
            production: results?.production || "N/A",
            roi: results?.roi || "N/A",
            budget_estime:
              results?.budget_estime || "N/A",
          }),
        }
      );

      const blob = await response.blob();

      const fileURL =
        window.URL.createObjectURL(blob);

      window.open(fileURL);

    } catch (error) {

      console.error(error);

      alert("Erreur PDF");

    }
  };

  return (

    <div className="h-screen overflow-hidden bg-[#e9e6df]">

      {/* HEADER */}

      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#163b67] flex items-center justify-between px-8 border-b border-[#0e2744]">

        <div className="flex items-center gap-3">

          <div className="w-8 h-8 rounded bg-[#f5a623] flex items-center justify-center">
            <Sun size={18} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white">
            Solar <span className="text-[#f5a623]">AI</span>
          </h1>

        </div>

        <button className="bg-[#f5a623] text-white px-5 py-2 rounded-full text-sm font-semibold">
          Agent Dimensionnement PV
        </button>

      </header>

      {/* LAYOUT */}

      <div className="pt-16 flex h-screen">

        {/* LEFT PANEL */}

        <aside className="w-[280px] bg-white border-r border-gray-200 p-6 overflow-y-auto">

          <h2 className="text-gray-700 font-bold tracking-[4px] text-sm mb-8">
            PARAMÈTRES
          </h2>

          {/* LOCALISATION */}

          <div className="mb-7">

            <label className="block text-xs text-gray-500 mb-2 font-bold tracking-[2px]">
              LOCALISATION
            </label>

            <select className="w-full border border-gray-300 rounded-2xl px-4 py-4 bg-white text-[#163b67] font-medium outline-none focus:ring-2 focus:ring-[#163b67]/20">
              <option>Casablanca, Maroc</option>
              <option>Marrakech, Maroc</option>
              <option>Paris, France</option>
              <option>Marseille, France</option>
              <option>Dakar, Sénégal</option>
              <option>Tunis, Tunisie</option>
              <option>Alger, Algérie</option>
              <option>Madrid, Espagne</option>
              <option>Dubaï, Émirats</option>
              <option>Autre (préciser dans le chat)</option>
            </select>

          </div>

          {/* CONSOMMATION */}

          <div className="mb-7">

            <div className="flex justify-between mb-2">

              <span className="text-xs text-gray-500 font-bold tracking-[2px]">
                CONSOMMATION JOURNALIÈRE
              </span>

              <span className="font-bold text-[#163b67]">
                {consommation} kWh
              </span>

            </div>

            <input
              type="range"
              min="1"
              max="50"
              value={consommation}
              onChange={(e) =>
                setConsommation(e.target.value)
              }
              className="w-full accent-[#f5a623]"
            />

            <p className="text-[10px] text-gray-400 mt-2">
              Foyer typique : 10–20 kWh/j
            </p>

          </div>

          {/* SURFACE */}

          <div className="mb-7">

            <div className="flex justify-between mb-2">

              <span className="text-xs text-gray-500 font-bold tracking-[2px]">
                SURFACE DE TOIT DISPONIBLE
              </span>

              <span className="font-bold text-[#163b67]">
                {surface} m²
              </span>

            </div>

            <input
              type="range"
              min="10"
              max="200"
              value={surface}
              onChange={(e) =>
                setSurface(e.target.value)
              }
              className="w-full accent-[#f5a623]"
            />

          </div>

          {/* BUDGET */}

          <div className="mb-7 border-b border-gray-300 pb-6">

            <div className="flex justify-between mb-2">

              <span className="text-xs text-gray-500 font-bold tracking-[2px]">
                BUDGET DISPONIBLE
              </span>

              <span className="font-bold text-[#163b67]">
                {budget} €
              </span>

            </div>

            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={budget}
              onChange={(e) =>
                setBudget(e.target.value)
              }
              className="w-full accent-[#f5a623]"
            />

          </div>

          {/* TYPE */}

          <div className="mb-7">

            <label className="block text-xs text-gray-500 mb-2 font-bold tracking-[2px]">
              TYPE D'INSTALLATION
            </label>

            <select className="w-full border border-gray-300 rounded-2xl px-4 py-4 bg-white text-[#163b67] font-medium outline-none focus:ring-2 focus:ring-[#163b67]/20">
              <option>Avec batterie (autonome)</option>
              <option>Sans batterie (réseau)</option>
              <option>Hybride</option>
            </select>

          </div>

          {/* ORIENTATION */}

          <div className="mb-7">

            <label className="block text-xs text-gray-500 mb-2 font-bold tracking-[2px]">
              ORIENTATION DU TOIT
            </label>

            <select className="w-full border border-gray-300 rounded-2xl px-4 py-4 bg-white text-[#163b67] font-medium outline-none focus:ring-2 focus:ring-[#163b67]/20">
              <option>Sud (optimal)</option>
              <option>Sud-Est</option>
              <option>Sud-Ouest</option>
              <option>Est / Ouest</option>
            </select>

          </div>

          {/* INCLINAISON */}

          <div className="mb-8 border-b border-gray-300 pb-6">

            <div className="flex justify-between mb-2">

              <span className="text-xs text-gray-500 font-bold tracking-[2px]">
                INCLINAISON
              </span>

              <span className="font-bold text-[#163b67]">
                {inclinaison}°
              </span>

            </div>

            <input
              type="range"
              min="0"
              max="60"
              value={inclinaison}
              onChange={(e) =>
                setInclinaison(e.target.value)
              }
              className="w-full accent-[#f5a623]"
            />

          </div>

          {/* BUTTONS */}

          <button
            onClick={calculateSolar}
            className="w-full bg-[#f5a623] hover:bg-[#e89914] transition text-white py-4 rounded-2xl font-bold mb-4 shadow"
          >
            ⚡ Calculer maintenant
          </button>

          <button
            onClick={startDiscussion}
            className="w-full bg-[#163b67] hover:bg-[#102d50] transition text-white py-4 rounded-2xl font-bold"
          >
            💬 Démarrer le dialogue
          </button>

        </aside>

        {/* CENTER */}

        <main className="flex-1 flex flex-col overflow-hidden">

          <div className="flex-1 overflow-y-auto px-10 py-12 pb-40">

            <div className="max-w-4xl mx-auto text-center">

              <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#f5c97d] flex items-center justify-center mx-auto mb-8">

                <Sun size={34} className="text-[#163b67]" />

              </div>

              <h1 className="text-5xl font-bold text-[#163b67] mb-6">
                Agent Solaire IA
              </h1>

              <p className="text-gray-600 text-lg leading-8">
                Je suis votre assistant intelligent pour dimensionner votre installation photovoltaïque.
              </p>

              {/* CHAT */}

              <div className="mt-20 space-y-6 text-left">

                {messages.map((msg, index) => (

                  <div
                    key={index}
                    className={`p-6 rounded-3xl shadow max-w-2xl whitespace-pre-line ${
                      msg.type === "user"
                        ? "bg-[#163b67] text-white ml-auto"
                        : "bg-white text-black"
                    }`}
                  >
                    {msg.text}
                  </div>

                ))}

                <div ref={messagesEndRef} />

              </div>

            </div>

          </div>

          {/* INPUT */}

          <div className="border-t border-gray-300 bg-[#ece8e1] p-6">

            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border flex items-center px-6 py-4">

              <input
                type="text"
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendQuestion();
                  }
                }}
                placeholder="Posez votre question sur le solaire..."
                className="flex-1 outline-none text-gray-700 text-lg"
              />

              <button
                onClick={() => sendQuestion()}
                className="bg-[#f5a623] hover:bg-[#e89914] transition p-4 rounded-2xl text-white"
              >
                <Send size={22} />
              </button>

            </div>

          </div>

        </main>

        {/* RIGHT PANEL */}

        <aside className="w-[280px] bg-white border-l border-gray-200 p-6 overflow-y-auto">

          <h2 className="text-gray-700 font-bold tracking-[4px] text-sm mb-8">
            RÉSULTATS
          </h2>

          {!results ? (

            <div className="flex flex-col items-center justify-center mt-24 text-center">

              <div className="w-24 h-24 rounded-full bg-[#f3e6c8] flex items-center justify-center mb-6">

                <BarChart3
                  size={40}
                  className="text-[#163b67]"
                />

              </div>

              <p className="text-gray-500">
                Les résultats apparaîtront ici.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {/* PDF */}

              <div className="bg-[#f7f4ef] border border-[#d7d2ca] rounded-2xl p-5 shadow-sm">

                <h3 className="text-xs font-bold tracking-[3px] text-gray-600 mb-4">
                  📄 RAPPORT PDF
                </h3>

                <button
                  onClick={downloadPdf}
                  className="w-full bg-[#163b67] text-white py-4 rounded-2xl font-bold"
                >
                  Télécharger le devis PDF
                </button>

              </div>

              {/* PANNEAUX */}

              <div className="bg-[#f7f4ef] border border-[#d7d2ca] rounded-2xl p-5 shadow-sm">

                <h3 className="text-xs font-bold tracking-[3px] mb-5 text-gray-700">
                  ☀️ PANNEAUX SOLAIRES
                </h3>

                <div className="text-center">

                  <h1 className="text-5xl font-bold text-[#163b67]">
                    {results.panneaux}
                  </h1>

                  <p className="mt-2 text-gray-600 text-sm">
                    panneaux × 400 Wc ={" "}
                    <span className="font-bold text-[#163b67]">
                      {results.power}
                    </span>
                  </p>

                </div>

                <div className="mt-6 space-y-3 text-sm">

                  <div className="flex justify-between border-b pb-2">
                    <span>Irradiation locale</span>
                    <span className="font-bold text-[#163b67]">
                      5.2 kWh/m²/j
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span>Production journalière</span>
                    <span className="font-bold text-[#163b67]">
                      {results.production}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Couverture besoins</span>
                    <span className="font-bold text-[#163b67]">
                      {results.coverage}
                    </span>
                  </div>

                </div>

                <div className="w-full h-3 bg-[#e2d8c3] rounded-full mt-5">
                  <div className="h-3 bg-[#e8a321] rounded-full w-full"></div>
                </div>

              </div>

              {/* BATTERIE */}

              <div className="bg-[#f7f4ef] border border-[#d7d2ca] rounded-2xl p-5 shadow-sm">

                <h3 className="text-xs font-bold tracking-[3px] mb-5 text-gray-700">
                  🔋 STOCKAGE BATTERIE
                </h3>

                <div className="space-y-4 text-sm">

                  <div className="flex justify-between border-b pb-2">
                    <span>Capacité</span>
                    <span className="font-bold text-[#163b67]">
                      {results.battery}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Ampérage (48V)</span>
                    <span className="font-bold text-[#163b67]">
                      480 Ah
                    </span>
                  </div>

                </div>

              </div>

              {/* ONDULEUR */}

              <div className="bg-[#f7f4ef] border border-[#d7d2ca] rounded-2xl p-5 shadow-sm">

                <h3 className="text-xs font-bold tracking-[3px] mb-5 text-gray-700">
                  ⚡ ONDULEUR
                </h3>

                <div className="flex justify-between text-sm">
                  <span>Puissance requise</span>
                  <span className="font-bold text-[#163b67]">
                    {results.inverter}
                  </span>
                </div>

              </div>

              {/* BUDGET */}

              <div className="bg-[#f7f4ef] border border-[#d7d2ca] rounded-2xl p-5 shadow-sm">

                <h3 className="text-xs font-bold tracking-[3px] mb-5 text-gray-700">
                  💰 ESTIMATION BUDGET
                </h3>

                <div className="space-y-3 text-sm">

                  <div className="flex justify-between border-b pb-2">
                    <span>Panneaux</span>
                    <span className="font-bold text-[#163b67]">
                      2800 €
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span>Onduleur</span>
                    <span className="font-bold text-[#163b67]">
                      1920 €
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span>Batterie</span>
                    <span className="font-bold text-[#163b67]">
                      8050 €
                    </span>
                  </div>

                  <div className="flex justify-between border-b pb-2">
                    <span>Installation</span>
                    <span className="font-bold text-[#163b67]">
                      3193 €
                    </span>
                  </div>

                  <div className="flex justify-between text-lg pt-2">
                    <span className="font-bold">TOTAL</span>
                    <span className="font-bold text-[#163b67]">
                      {results.budget_estime}
                    </span>
                  </div>

                </div>

                <div className="mt-5 text-green-700 text-xs font-semibold">
                  🌿 2393 kg CO₂ économisés/an
                </div>

              </div>

              {/* ROI */}

              <div className="bg-[#f7f4ef] border border-[#d7d2ca] rounded-2xl p-5 shadow-sm">

                <h3 className="text-xs font-bold tracking-[3px] mb-5 text-gray-700">
                  📈 RENTABILITÉ
                </h3>

                <div className="space-y-3 text-sm">

                  <div className="flex justify-between border-b pb-2">
                    <span>Production annuelle</span>
                    <span className="font-bold text-[#163b67]">
                      5982 kWh
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Retour sur investissement</span>
                    <span className="font-bold text-[#163b67]">
                      {results.roi}
                    </span>
                  </div>

                </div>

              </div>

            </div>

          )}

        </aside>

      </div>

    </div>
  );
}

export default App;