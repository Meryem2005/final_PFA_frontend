import { useState, useEffect, useRef } from "react";

import {
  Sun,
  Send,
  BarChart3,
} from "lucide-react";

function App() {

  // =========================================
  // STATES
  // =========================================

  const [localisation, setLocalisation] =
    useState("Casablanca");

  const [consommation, setConsommation] =
    useState(15);

  const [surface, setSurface] =
    useState(30);

  const [budget, setBudget] =
    useState(50000);

  const [orientation, setOrientation] =
    useState("Sud");

  const [installationType, setInstallationType] =
    useState("Hybride");

  const [results, setResults] =
    useState(null);

  const [question, setQuestion] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================================
  // CHAT
  // =========================================

  const [messages, setMessages] =
    useState([
      {
        type: "bot",
        text:
          "Bonjour 👋 Je suis votre assistant intelligent pour le dimensionnement photovoltaïque.",
      },
    ]);

  // =========================================
  // AUTO SCROLL
  // =========================================

  const messagesEndRef = useRef(null);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  // =========================================
  // SEND QUESTION
  // =========================================

  const sendQuestion = async (
    text = question
  ) => {

    if (!String(text).trim()) return;

    const currentQuestion =
      typeof text === "string"
        ? text
        : question;

    setMessages((prev) => [

      ...prev,

      {
        type: "user",
        text: currentQuestion,
      },

    ]);

    setQuestion("");

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            question: currentQuestion,
          }),

        }
      );

      const data =
        await response.json();

      setMessages((prev) => [

        ...prev,

        {
          type: "bot",
          text:
            data.response ||
            "Aucune réponse.",
        },

      ]);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [

        ...prev,

        {
          type: "bot",
          text:
            "❌ Erreur connexion backend.",
        },

      ]);
    }
  };

  // =========================================
  // CALCUL SOLAIRE
  // =========================================

  const calculateSolar = async () => {

    try {

      setLoading(true);

      const payload = {

        city: localisation,

        daily_consumption_kwh:
          Number(consommation),

        available_area_m2:
          Number(surface),

        budget:
          Number(budget),

        orientation,

        installation_type:
          installationType,

        autonomy_days: 1,

        shade_factor: 1,

        roof_type: "terrasse",

        distance_to_load_m: 10,
      };

      const response = await fetch(
        "http://127.0.0.1:8000/calculate",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data =
        await response.json();

      setResults(data);

      setMessages((prev) => [

        ...prev,

        {
          type: "bot",

          text:

` 📊 Calcul terminé — Voici une synthèse pour  ${data.location || localisation}

━━━━━━━━━━━━━━━━━━
 PANNEAUX SOLAIRES
━━━━━━━━━━━━━━━━━━
• Nombre : ${data?.panels?.panel_count || 0}
• Type : ${data?.panels?.panel_model || "-"}
• Puissance : ${data?.panels?.total_power_kwp || 0} kWp
• Production : ${data?.panels?.estimated_daily_production_kwh || 0} kWh/j

━━━━━━━━━━━━━━━━━━
 BATTERIES
━━━━━━━━━━━━━━━━━━
• Nombre : ${data?.battery?.battery_count || 0}
• Type : ${data?.battery?.battery_type || "-"}
• Capacité : ${data?.battery?.required_capacity_kwh || 0} kWh

━━━━━━━━━━━━━━━━━━
⚡ ONDULEUR
━━━━━━━━━━━━━━━━━━
• Modèle : ${data?.inverter?.inverter_model || "-"}
• Puissance : ${data?.inverter?.recommended_power_kw || 0} kW

━━━━━━━━━━━━━━━━━━
 ROI
━━━━━━━━━━━━━━━━━━
• Retour sur investissement :
${data?.roi?.roi_years || 0} ans

${data?.recommendations?.length
  ? `
━━━━━━━━━━━━━━━━━━
 RECOMMANDATIONS
━━━━━━━━━━━━━━━━━━
${data.recommendations.map(r => `• ${r}`).join("\n")}
`
  : ""
}

━━━━━━━━━━━━━━━━━━
 INSTALLATION
━━━━━━━━━━━━━━━━━━
• Inclinaison : ${data?.installation?.tilt_angle ||30}°
• Orientation : ${data?.installation?.orientation || orientation}

━━━━━━━━━━━━━━━━━━
 BUDGET FINAL
━━━━━━━━━━━━━━━━━━
${data?.cost?.total_cost || 0} DH`,

          showGeneratePdf: true,
        }

      ]);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [

        ...prev,

        {
          type: "bot",
          text:
            "❌ Erreur backend.",
        },

      ]);

    } finally {

      setLoading(false);
    }
  };

  
  // =========================================
  // PDF
  // =========================================

  const downloadPdf = async () => {

    try {

      const payload = {

        city: localisation,

        daily_consumption_kwh:
          Number(consommation),

        available_area_m2:
          Number(surface),

        budget:
          Number(budget),

        orientation,

        installation_type:
          installationType,

        autonomy_days: 1,

        shade_factor: 1,

        roof_type: "terrasse",

        distance_to_load_m: 10,
      };

      const response = await fetch(
        "http://127.0.0.1:8000/generate-pdf",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data =
  await response.json();
setMessages((prev) => [
  ...prev,
  {
    type: "bot",
    
    pdf: true,
    pdfUrl: "http://127.0.0.1:8000" + data.pdf_url,
  },
]);
    } catch (error) {

      console.error(error);

      alert("Erreur PDF");
    }
  };

  // =========================================
  // UI
  // =========================================

  return (

    <div className="h-screen overflow-hidden bg-[#e9e6df]">

      {/* HEADER */}

      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-[#163b67] flex items-center justify-between px-3 border-b border-[#0e2744]">

  {/* Logo */}
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded bg-[#f5a623] flex items-center justify-center">
      <Sun size={20} className="text-white" />
    </div>

    <h1 className="text-3xl font-black text-white">
      Solar
      <span className="text-[#f5a623]"> AI</span>
    </h1>
  </div>

  {/* Bouton à droite */}
  <button
    className="
      px-5 py-3
      rounded-full
      border border-[#f5a623]
      text-[#f5a623]
      font-semibold
      hover:bg-[#f5a623]
      hover:text-white
      transition-all
    "
  >
    Agent Dimensionnement PV
  </button>

</header>




      {/* MAIN */}

      <div className="pt-20 flex h-screen">

        {/* LEFT */}

        <aside className="w-[340px] bg-white border-r border-gray-200 p-3 overflow-y-auto">

          <h2 className="text-[#163b67] font-bold tracking-[4px] text-sm mb-8">

            PARAMÈTRES

          </h2>

          <div className="space-y-5">

            <div>

              <label className="block text-sm font-semibold mb-2 text-gray-700">

                 Localisation

              </label>

              <input
                type="text"
                value={localisation}
                onChange={(e) =>
                  setLocalisation(e.target.value)
                }
                placeholder="Casablanca"
                className="w-full border rounded-2xl px-4 py-4"
              />

            </div>

            <div>

              <label className="block text-sm font-semibold mb-2 text-gray-700">

                 Consommation journalière (kWh)

              </label>

              <input
                type="number"
                value={consommation}
                onChange={(e) =>
                  setConsommation(e.target.value)
                }
                className="w-full border rounded-2xl px-4 py-4"
              />

            </div>

            <div>

              <label className="block text-sm font-semibold mb-2 text-gray-700">

                 Surface disponible (m²)

              </label>

              <input
                type="number"
                value={surface}
                onChange={(e) =>
                  setSurface(e.target.value)
                }
                className="w-full border rounded-2xl px-4 py-4"
              />

            </div>

            <div>

              <label className="block text-sm font-semibold mb-2 text-gray-700">

                 Budget disponible (DH)

              </label>

              <input
                type="number"
                value={budget}
                onChange={(e) =>
                  setBudget(e.target.value)
                }
                className="w-full border rounded-2xl px-4 py-4"
              />

            </div>

            <div>

              <label className="block text-sm font-semibold mb-2 text-gray-700">

                 Orientation

              </label>

              <select
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value)
                }
                className="w-full border rounded-2xl px-4 py-4"
              >

                <option>Sud</option>
                <option>Nord</option>
                <option>Est</option>
                <option>Ouest</option>

              </select>

            </div>

            <div>

              <label className="block text-sm font-semibold mb-2 text-gray-700">

                Type d’installation

              </label>

              <select
                value={installationType}
                onChange={(e) =>
                  setInstallationType(
                    e.target.value
                  )
                }
                className="w-full border rounded-2xl px-4 py-4"
              >

                <option value="hybride">Hybride</option>
                <option value="on-grid">On-Grid</option>
                <option value="off-grid">Off-Grid</option>

              </select>

            </div>

            <button
              onClick={calculateSolar}
              disabled={loading}
              className="
                w-full
                bg-[#f5a623]
                hover:bg-[#e89914]
                text-white
                py-4
                rounded-2xl
                font-bold
                text-lg
              "
            >

              {
                loading
                  ? "Calcul..."
                  : "⚡ Calculer maintenant"
              }

            </button>

          </div>

        </aside>

        {/* CENTER */}

       <main className="flex-1 flex flex-col h-[calc(100vh-80px)]">

          {messages.length === 1 ? (

            <div className="flex-1 overflow-y-auto flex justify-center px-10 pt-10 pb-32">

              <div className="text-center max-w-7xl">

                <div className="relative mx-auto w-32 h-32 mb-10">

                  <div
                    className="
                      absolute inset-0
                      rounded-full
                      border-2 border-dashed
                      border-[#f0d7a2]
                    "
                  />

                  <div
                    className="
                      w-full h-full
                      rounded-full
                      bg-[#f5e7c5]
                      flex items-center justify-center
                    "
                  >

                    <Sun
                      size={42}
                      className="text-[#163b67]"
                    />

                  </div>

                </div>

                <h1
                  className="
                    text-2xl
                    font-black
                    text-[#163b67]
                    mb-8
                  "
                >

                  Agent Solaire IA

                </h1>

                <p
                  className="
                    text-2xl
                    text-[#6d6258]
                    leading-[40px]
                    max-w-2xl
                    mx-auto
                  "
                >

                  Je suis votre assistant intelligent
                  pour dimensionner votre installation

                  photovoltaïque. Posez-moi vos
                  questions ou cliquez sur

                  "Calculer maintenant".

                </p>

                <div
                  className="
                    mt-14
                    flex
                    flex-wrap
                    justify-center
                    gap-5
                  "
                >

                  {
                    [
  "Combien de panneaux pour ma maison ?",
  "Quelle batterie me recommandes-tu ?",
  "Quel est le retour sur investissement ?",
  "Quelle inclinaison est idéale ?",
  "Guide complet d'installation",
  "Explique-moi le dimensionnement"].map((q, index) => (

                    <button
                      key={index}
                      onClick={() =>
                        sendQuestion(q)
                      }
                      className="
                        px-5 py-2
                       
                        rounded-full
                        bg-white
                        border border-[#ddd5c7]
                        text-[#6a6157]
                        hover:bg-[#163b67]
                        hover:text-white
                        transition-all
                        duration-300
                        shadow-sm
                        text-lg
                        font-medium
                      "
                    >

                      {q}

                    </button>

                  ))}

                </div>

              </div>

            </div>

          ) : (

            <div className="flex-1 overflow-y-scroll px-10 py-10 pb-40">

              <div className="max-w-4xl mx-auto">

                <div className="space-y-6 text-left">

                  {messages.map(
                    (msg, index) => (

                      <div
                        key={index}
                        className={`p-6 rounded-3xl shadow whitespace-pre-line max-w-3xl ${
                          msg.type === "user"
                            ? "bg-[#163b67] text-white ml-auto"
                            : "bg-white text-black"
                        }`}
                      >

                        <div>{msg.text}</div>

                        {msg.pdf && (
  <div className="mt-5">
    <button
      onClick={() => window.open(msg.pdfUrl, "_blank")}
      className="
        text-blue-600
        hover:text-blue-800
        hover:underline
        font-semibold
      "
    >
      Ouvrir le rapport PDF
    </button>
  </div>
)}


                        {msg.showGeneratePdf && (

                          <div className="mt-5">

                            <button
                              onClick={downloadPdf}
                              className="
                                text-blue-600
                                hover:text-blue-800
                                hover:underline
                                font-semibold
                              "
                            >

                              Générer le rapport PDF détaillé

                            </button>

                          </div>

                        )}

                      

                      </div>

                    )
                  )}

                  <div ref={messagesEndRef} />

                </div>

              </div>

            </div>

          )}

          {/* INPUT */}

          <div className="border-t border-gray-300 bg-[#ece8e1] p-8">

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
                placeholder="Posez votre question..."
                className="flex-1 outline-none text-gray-700 text-lg"
              />

              <button
                onClick={() =>
                  sendQuestion()
                }
                className="
                  bg-[#f5a623]
                  hover:bg-[#e89914]
                  transition
                  p-4
                  rounded-2xl
                  text-white
                "
              >

                <Send size={22} />

              </button>

            </div>

          </div>

        </main>

        {/* RIGHT */}

        <aside className="w-[300px] bg-white border-l border-gray-200 overflow-y-auto">
          

          <h2 className="text-gray-700 font-bold tracking-[6px] text-sm mt-4 p-3 mb-8">

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

              <p className="text-gray-500 text-lg">

                Les résultats du dimensionnement
                apparaîtront ici après le calcul.

              </p>

            </div>

          ) : (

            <div className="space-y-5">

  <div className="bg-[#f7f4ef] border rounded-2xl p-5">
    <h3 className="font-bold mb-3">
      ☀️ PANNEAUX
    </h3>

    <p>
      {results?.panels?.panel_count}
      {" × "}
      {results?.panels?.panel_model}
    </p>
  </div>

  <div className="bg-[#f7f4ef] border rounded-2xl p-5">
    <h3 className="font-bold mb-3">
      🔋 BATTERIES
    </h3>

    <p>
      {results?.battery?.battery_count}
      {" × "}
      {results?.battery?.battery_type}
    </p>
  </div>

  <div className="bg-[#f7f4ef] border rounded-2xl p-5">
    <h3 className="font-bold mb-3">
      💰 BUDGET FINAL
    </h3>

    <p className="text-2xl font-bold text-[#163b67]">
      {results?.cost?.total_cost} DH
    </p>
  </div>

  {results?.installation && (
    <div className="bg-[#f7f4ef] border rounded-2xl p-5">
      <h3 className="font-bold mb-3">
        📐 INSTALLATION
      </h3>

      <p>
        Inclinaison : {results.installation.tilt_angle}°
      </p>

      <p>
        Orientation : {results.installation.orientation}
      </p>
    </div>
  )}

  {results?.roi && (
    <div className="bg-[#f7f4ef] border rounded-2xl p-5">
      <h3 className="font-bold mb-3">
        📈 ROI
      </h3>

      <p className="text-xl font-bold text-green-700">
        {results.roi.roi_years} ans
      </p>
    </div>
  )}

  {results?.recommendations?.length > 0 && (
    <div className="bg-[#f7f4ef] border rounded-2xl p-5">
      <h3 className="font-bold mb-3">
        🤖 Recommandations IA
      </h3>

      <ul className="space-y-2">
        {results.recommendations.map((item, i) => (
          <li key={i}>
            • {item}
          </li>
        ))}
      </ul>
    </div>
  )}

         </div>
)}
        </aside>

      </div>

    </div>
  );
}

export default App;