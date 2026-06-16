import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Send, BarChart3 } from "lucide-react";
import LocationMap from "../../components/LocationMap";
import "leaflet/dist/leaflet.css";
import "./AssistantPage.css";

export default function AssistantPage({ onReportReady }) {
  const navigate = useNavigate();

  const [showMap, setShowMap] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [localisation, setLocalisation] = useState("");
  const [consommation, setConsommation] = useState(15);
  const [surface, setSurface] = useState(30);
  const [budget, setBudget] = useState(50000);
  const [orientation, setOrientation] = useState("Sud");
  const [installationType, setInstallationType] = useState("hybride");
  const [results, setResults] = useState(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Bonjour 👋 Je suis votre assistant intelligent pour le dimensionnement photovoltaïque.",
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLocationSelect = (location) => {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setLocalisation(location.city);
  };

  const sendQuestion = async (text = question) => {
    if (!String(text).trim()) return;
    const currentQuestion = typeof text === "string" ? text : question;
    setMessages((prev) => [...prev, { type: "user", text: currentQuestion }]);
    setQuestion("");
    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: data.response || "Aucune réponse." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "❌ Erreur connexion backend." },
      ]);
    }
  };

  const calculateSolar = async () => {
    try {
      setLoading(true);
      const payload = {
        city: localisation,
        latitude,
        longitude,
        daily_consumption_kwh: Number(consommation),
        available_area_m2: Number(surface),
        budget: Number(budget),
        orientation,
        installation_type: installationType,
        autonomy_days: 1,
        shade_factor: 1,
        roof_type: "terrasse",
        distance_to_load_m: 10,
      };
      const response = await fetch("http://127.0.0.1:8000/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setResults(data);
      if (onReportReady) onReportReady(data, payload);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: `📊 Calcul terminé — Voici une synthèse pour ${data.location || localisation}

━━━━━━━━━━━━━━━━━━
 PANNEAUX SOLAIRES
━━━━━━━━━━━━━━━━━━
- Nombre : ${data?.panels?.panel_count || 0}
- Type : ${data?.panels?.panel_model || "-"}
- Puissance : ${data?.panels?.total_power_kwp || 0} kWp
- Production : ${data?.panels?.estimated_daily_production_kwh || 0} kWh/j

━━━━━━━━━━━━━━━━━━
 BATTERIES
━━━━━━━━━━━━━━━━━━
- Nombre : ${data?.battery?.battery_count || 0}
- Type : ${data?.battery?.battery_type || "-"}
- Capacité : ${data?.battery?.required_capacity_kwh || 0} kWh

━━━━━━━━━━━━━━━━━━
⚡ ONDULEUR
━━━━━━━━━━━━━━━━━━
- Modèle : ${data?.inverter?.inverter_model || "-"}
- Puissance : ${data?.inverter?.recommended_power_kw || 0} kW

━━━━━━━━━━━━━━━━━━
 ROI
━━━━━━━━━━━━━━━━━━
- Retour sur investissement : ${data?.roi?.roi_years || 0} ans

━━━━━━━━━━━━━━━━━━
 BUDGET FINAL
━━━━━━━━━━━━━━━━━━
${data?.cost?.total_cost || 0} DH`,
          showGeneratePdf: true,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "❌ Erreur backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const payload = {
        city: localisation,
        latitude,
        longitude,
        daily_consumption_kwh: Number(consommation),
        available_area_m2: Number(surface),
        budget: Number(budget),
        orientation,
        installation_type: installationType,
        autonomy_days: 1,
        shade_factor: 1,
        roof_type: "terrasse",
        distance_to_load_m: 10,
      };
      const response = await fetch("http://127.0.0.1:8000/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      const pdfUrl = "http://127.0.0.1:8000" + data.pdf_url;
      window.open(pdfUrl, "_blank");
    } catch {
      alert("Erreur PDF");
    }
  };

  return (
    <div className="assistant-page">

      {/* HEADER */}
      <header className="assistant-header">
        <div className="assistant-logo">
          <div className="assistant-logo-icon">
            <Sun size={20} color="white" />
          </div>
          <h1>Solar<span className="assistant-logo-accent"> AI</span></h1>
        </div>
        <button
          className="assistant-monitoring-btn"
          onClick={() => navigate("/monitoring")}
        >
          Monitoring PV
        </button>
      </header>

      {/* MAIN */}
      <div className="assistant-main">

        {/* LEFT */}
        <aside className="assistant-sidebar-left">
          <h2 className="assistant-sidebar-title">PARAMÈTRES</h2>
          <div className="assistant-form">

            {/* LOCALISATION */}
            <div className="assistant-field">
              <label>Localisation</label>
              <div
                style={{ position: "relative", cursor: "pointer" }}
                onClick={() => setShowMap(true)}
              >
                <LocationMap
                  onLocationSelect={handleLocationSelect}
                  small={true}
                />
                {/* overlay qui bloque les clics sur la small map */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 999,
                  background: "transparent",
                }} />
              </div>
              {localisation && (
                <div style={{ fontSize: "13px", color: "#374151", marginTop: "6px" }}>
                  <p><strong>Ville :</strong> {localisation}</p>
                  <p><strong>Lat :</strong> {latitude?.toFixed(4)}</p>
                  <p><strong>Lng :</strong> {longitude?.toFixed(4)}</p>
                </div>
              )}
            </div>

            <div className="assistant-field">
              <label>Consommation journalière (kWh)</label>
              <input
                type="number"
                value={consommation}
                onChange={(e) => setConsommation(e.target.value)}
              />
            </div>

            <div className="assistant-field">
              <label>Surface disponible (m²)</label>
              <input
                type="number"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
              />
            </div>

            <div className="assistant-field">
              <label>Budget disponible (DH)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="assistant-field">
              <label>Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
              >
                <option>Sud</option>
                <option>Nord</option>
                <option>Est</option>
                <option>Ouest</option>
              </select>
            </div>

            <div className="assistant-field">
              <label>Type d'installation</label>
              <select
                value={installationType}
                onChange={(e) => setInstallationType(e.target.value)}
              >
                <option value="hybride">Hybride</option>
                <option value="on-grid">On-Grid</option>
                <option value="off-grid">Off-Grid</option>
              </select>
            </div>

            <button
              className="assistant-calculate-btn"
              onClick={calculateSolar}
              disabled={loading}
            >
              {loading ? "Calcul..." : "⚡ Calculer maintenant"}
            </button>
          </div>
        </aside>

        {/* CENTER */}
        <main className="assistant-center">
          {messages.length === 1 ? (
            <div className="assistant-welcome">
              <div className="assistant-welcome-icon">
                <Sun size={42} />
              </div>
              <h1>Agent Solaire IA</h1>
              <p>
                Je suis votre assistant intelligent pour dimensionner votre
                installation photovoltaïque.
              </p>
              <div className="assistant-suggestions">
                {[
                  "Combien de panneaux pour ma maison ?",
                  "Quelle batterie me recommandes-tu ?",
                  "Quel est le retour sur investissement ?",
                  "Quelle inclinaison est idéale ?",
                  "Guide complet d'installation",
                  "Explique-moi le dimensionnement",
                ].map((q, i) => (
                  <button key={i} onClick={() => sendQuestion(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="assistant-messages">
              <div className="assistant-messages-inner">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`assistant-msg ${msg.type === "user" ? "assistant-msg-user" : "assistant-msg-bot"}`}
                  >
                    <div>{msg.text}</div>
                    {msg.pdf && (
                      <button onClick={() => window.open(msg.pdfUrl, "_blank")}>
                        Ouvrir le rapport PDF
                      </button>
                    )}
                    {msg.showGeneratePdf && (
                      <button onClick={downloadPdf}>
                        Générer le rapport PDF détaillé
                      </button>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* INPUT */}
          <div className="assistant-input-bar">
            <div className="assistant-input-inner">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
                placeholder="Posez votre question..."
              />
              <button onClick={() => sendQuestion()}>
                <Send size={22} />
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT */}
        <aside className="assistant-sidebar-right">
          <h2 className="assistant-sidebar-title">RÉSULTATS</h2>
          {!results ? (
            <div className="assistant-no-results">
              <div className="assistant-no-results-icon">
                <BarChart3 size={40} />
              </div>
              <p>Les résultats apparaîtront ici après le calcul.</p>
            </div>
          ) : (
            <div className="assistant-results">
              <div className="assistant-result-card">
                <h3>☀️ PANNEAUX</h3>
                <p>{results?.panels?.panel_count} × {results?.panels?.panel_model}</p>
              </div>
              <div className="assistant-result-card">
                <h3>🔋 BATTERIES</h3>
                <p>{results?.battery?.battery_count} × {results?.battery?.battery_type}</p>
              </div>
              <div className="assistant-result-card">
                <h3>💰 BUDGET FINAL</h3>
                <p className="assistant-result-big">{results?.cost?.total_cost} DH</p>
              </div>
              {results?.installation && (
                <div className="assistant-result-card">
                  <h3>📐 INSTALLATION</h3>
                  <p>Inclinaison : {results.installation.tilt_angle}°</p>
                  <p>Orientation : {results.installation.orientation}</p>
                </div>
              )}
              {results?.roi && (
                <div className="assistant-result-card">
                  <h3>📈 ROI</h3>
                  <p className="assistant-result-roi">{results.roi.roi_years} ans</p>
                </div>
              )}
              {results?.recommendations?.length > 0 && (
                <div className="assistant-result-card">
                  <h3>🤖 Recommandations IA</h3>
                  <ul>
                    {results.recommendations.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* MODAL CARTE PLEIN ÉCRAN */}
      {showMap && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: "white",
            width: "95%",
            height: "90%",
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: "1px solid #e5e7eb",
            }}>
              <h2 style={{ fontWeight: 700, fontSize: "18px", color: "#163b67" }}>
                Choisir une localisation
              </h2>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setShowMap(false)}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => setShowMap(false)}
                  style={{
                    padding: "8px 16px",
                    background: "#f5a623",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Confirmer
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <LocationMap onLocationSelect={handleLocationSelect} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}