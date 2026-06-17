import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, AlertCircle } from "lucide-react";
import "./ConfirmPage.css";

export default function ConfirmPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  // Tous les champs sont modifiables
  const [city, setCity] = useState("");
  const [panelModel, setPanelModel] = useState("");
  const [inverterModel, setInverterModel] = useState("");
  const [annualSaving, setAnnualSaving] = useState(0);

  const [panelCount, setPanelCount] = useState(0);
  const [batteryCapacity, setBatteryCapacity] = useState(0);
  const [inverterPower, setInverterPower] = useState(0);
  const [dailyConsumption, setDailyConsumption] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [orientation, setOrientation] = useState("");
  const [installationType, setInstallationType] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const lastResult = localStorage.getItem("lastCalcResult");
    const lastInput = localStorage.getItem("lastCalcInput");

    if (lastResult) {
      const data = JSON.parse(lastResult);
      const input = lastInput ? JSON.parse(lastInput) : {};
      setReport({ ...data, input });

      // Infos générales
      setCity(data?.location || "");
      setPanelModel(data?.panels?.panel_model || "");
      setInverterModel(data?.inverter?.inverter_model || "");
      setAnnualSaving(data?.roi?.yearly_savings || 0);

      // Paramètres techniques
      setPanelCount(data?.panels?.panel_count || 0);
      setBatteryCapacity(data?.battery?.required_capacity_kwh || 0);
      setInverterPower(data?.inverter?.recommended_power_kw || 0);
      setDailyConsumption(input?.daily_consumption_kwh || 0);
      setTotalCost(data?.cost?.total_cost || 0);
      setOrientation(input?.orientation || "Sud");
      setInstallationType(input?.installation_type || "hybride");
    }
    setLoading(false);
  }, [navigate]);

  const handleConfirm = async () => {
    if (!report) return;
    try {
      setConfirming(true);
      const token = localStorage.getItem("token");
      const panelPowerW = report?.panels?.panel_power_w || 330;
      const totalPowerKwp = parseFloat((panelCount * panelPowerW / 1000).toFixed(2));

      const response = await fetch("http://127.0.0.1:8000/api/v1/monitoring/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          panel_count: panelCount,
          total_power_kwp: totalPowerKwp,
          battery_capacity_kwh: batteryCapacity,
          inverter_power_kw: inverterPower,
          city: city,
          installation_type: installationType,
          orientation: orientation,
          tilt_angle: report?.installation?.tilt_angle || 30,
          daily_consumption_kwh: dailyConsumption,
          total_cost: totalCost,
          annual_saving: annualSaving,
          panels_result: {
            ...report?.panels,
            panel_count: panelCount,
            panel_model: panelModel,
            total_power_kwp: totalPowerKwp,
          },
          battery_result: {
            ...report?.battery,
            required_capacity_kwh: batteryCapacity,
          },
          inverter_result: {
            ...report?.inverter,
            inverter_model: inverterModel,
            recommended_power_kw: inverterPower,
          },
          cost_result: {
            ...report?.cost,
            total_cost: totalCost,
          },
          solar_data: report?.solar_data,
          recommendations: report?.recommendations,
        })
      });

      const data = await response.json();
      if (data.success) {
        navigate("/monitoring");
      } else {
        setError("Erreur lors de la confirmation.");
      }
    } catch {
      setError("Erreur connexion backend.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div className="loading-screen">Chargement...</div>;

  if (!report) return (
    <div className="error-screen">
      <AlertCircle size={40} color="#f5a623" />
      <h2>Aucun rapport trouvé</h2>
      <p>Veuillez d'abord effectuer un calcul depuis l'assistant.</p>
      <button onClick={() => navigate("/assistant")}>
        Retour à l'assistant
      </button>
    </div>
  );

  return (
    <div>
      {/* HEADER AVEC LOGO UNIQUEMENT */}
      <header className="confirm-header">
        <div className="home-logo" onClick={() => navigate("/dashboard")}>
          <div className="home-logo-icon">
            <Sun size={22} color="white" />
          </div>
          <h1>
            Solar<span className="home-logo-accent">AI</span>
          </h1>
        </div>
      </header>

      {/* CONTENU DE LA PAGE */}
      <div className="confirm-page-container">
        <div className="confirm-form-wrapper">

          {/* INTRO */}
          <div className="intro-card">
            <h2 className="intro-title">Vérifiez et modifiez votre configuration</h2>
            <p className="intro-text">Tous les paramètres sont modifiables avant confirmation.</p>
          </div>

          {/* SECTION 1 : Infos générales */}
          <div className="section-card">
            <h3 className="section-title">📍 Informations générales</h3>
            <div className="form-grid">

              <div className="field-group">
                <label className="field-label">🌍 Ville</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="input-field orange" />
              </div>

              <div className="field-group">
                <label className="field-label">☀️ Modèle panneau</label>
                <input value={panelModel} onChange={(e) => setPanelModel(e.target.value)} className="input-field" />
              </div>

              <div className="field-group">
                <label className="field-label">⚙️ Modèle onduleur</label>
                <input value={inverterModel} onChange={(e) => setInverterModel(e.target.value)} className="input-field" />
              </div>

              <div className="field-group full-width">
                <label className="field-label">💹 Économies annuelles (DH)</label>
                <input type="number" value={annualSaving} onChange={(e) => setAnnualSaving(Number(e.target.value))} className="input-field" />
              </div>

            </div>
          </div>

          {/* SECTION 2 : Paramètres techniques */}
          <div className="section-card">
            <h3 className="section-title">✏️ Paramètres techniques</h3>
            <div className="form-grid">

              <div className="field-group">
                <label className="field-label">☀️ Nombre de panneaux</label>
                <input type="number" value={panelCount} onChange={(e) => setPanelCount(Number(e.target.value))} className="input-field orange" />
              </div>

              <div className="field-group">
                <label className="field-label">🔋 Capacité batterie (kWh)</label>
                <input type="number" value={batteryCapacity} onChange={(e) => setBatteryCapacity(Number(e.target.value))} className="input-field" />
              </div>

              <div className="field-group">
                <label className="field-label">⚡ Puissance onduleur (kW)</label>
                <input type="number" step="0.1" value={inverterPower} onChange={(e) => setInverterPower(Number(e.target.value))} className="input-field" />
              </div>

              <div className="field-group">
                <label className="field-label">📊 Consommation journalière (kWh)</label>
                <input type="number" value={dailyConsumption} onChange={(e) => setDailyConsumption(Number(e.target.value))} className="input-field" />
              </div>

              <div className="field-group">
                <label className="field-label">💰 Budget total (DH)</label>
                <input type="number" value={totalCost} onChange={(e) => setTotalCost(Number(e.target.value))} className="input-field" />
              </div>

              <div className="field-group">
                <label className="field-label">🧭 Orientation</label>
                <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="input-field">
                  <option>Sud</option>
                  <option>Nord</option>
                  <option>Est</option>
                  <option>Ouest</option>
                  <option>Sud-Est</option>
                  <option>Sud-Ouest</option>
                </select>
              </div>

              <div className="field-group full-width">
                <label className="field-label">🔌 Type d'installation</label>
                <select value={installationType} onChange={(e) => setInstallationType(e.target.value)} className="input-field">
                  <option value="hybride">Hybride</option>
                  <option value="on-grid">On-Grid</option>
                  <option value="off-grid">Off-Grid</option>
                </select>
              </div>

            </div>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* BOUTONS */}
          <div className="buttons-container">
            <button onClick={() => navigate("/assistant")} className="btn-back">
              ← Retour à l'assistant
            </button>
            <button onClick={handleConfirm} disabled={confirming} className="btn-confirm">
              {confirming ? "Confirmation..." : "Confirmer et accéder au Monitoring"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}