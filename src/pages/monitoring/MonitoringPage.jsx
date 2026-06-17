import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Battery,
  CheckCircle2,
  Gauge,
  Home,
  LineChart,
  Plug,
  Sun,
  Thermometer,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MonitoringPage.css";

const CHART_TABS = [
  { key: "energy", label: "Production / Conso" },
  { key: "battery", label: "Batterie" },
  { key: "irradiance", label: "Irradiance" },
  { key: "temperature", label: "Température" },
];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function MiniChart({ data, series, unit = "" }) {
  const width = 720;
  const height = 190;
  const padding = 28;
  const values = data.flatMap((item) => series.map((line) => item[line.key] ?? 0));
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const xFor = (index) => padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
  const yFor = (value) =>
    height - padding - ((value - min) / Math.max(max - min, 1)) * (height - padding * 2);

  return (
    <div className="mon-chart-shell">
      <svg viewBox={`0 0 ${width} ${height}`}>
        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const y = padding + step * (height - padding * 2);
          return <line key={step} x1={padding} x2={width - padding} y1={y} y2={y} className="chart-grid" />;
        })}
        {series.map((line) => {
          const points = data.map((item, index) => `${xFor(index)},${yFor(item[line.key] ?? 0)}`).join(" ");
          return (
            <polyline key={line.key} points={points} fill="none" stroke={line.color}
              strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={line.dashed ? "8 6" : undefined} />
          );
        })}
        {data.filter((_, i) => i % 3 === 0).map((item, i) => (
          <text key={item.hour} x={xFor(i * 3)} y={height - 7} className="chart-axis">{item.hour}</text>
        ))}
        <text x={padding} y={15} className="chart-axis">{Math.round(max)}{unit}</text>
      </svg>
      <div className="chart-legend">
        {series.map((line) => (
          <span key={line.key}><i style={{ background: line.color }} />{line.label}</span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, dataKey, color, unit = "" }) {
  const max = Math.max(1, ...data.map((item) => Math.abs(item[dataKey] || 0)));
  return (
    <div className="bar-chart">
      {data.map((item, index) => {
        const value = item[dataKey] || 0;
        const heightPct = Math.max(4, (Math.abs(value) / max) * 100);
        return (
          <div className="bar-col" key={`${item.hour}-${index}`}>
            <div className={`bar-value ${value < 0 ? "negative" : ""}`}
              style={{ height: `${heightPct}%`, background: value < 0 ? "#E24B4A" : color }}
              title={`${item.hour}: ${value}${unit}`} />
            {index % 4 === 0 && <span>{item.hour}</span>}
          </div>
        );
      })}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, unit, sub, color, children }) {
  return (
    <div className="kpi-card">
      <div>
        <div className="kpi-label"><Icon size={15} color={color} />{label}</div>
        <div className="kpi-val" style={{ color }}>{value}<span className="kpi-unit">{unit}</span></div>
      </div>
      <div>
        {sub && <div className="kpi-sub">{sub}</div>}
        {children}
      </div>
    </div>
  );
}

function BatteryBar({ value }) {
  const color = value < 20 ? "#E24B4A" : value < 40 ? "#EF9F27" : "#1D9E75";
  return (
    <div className="bar-wrap">
      <div className="bar-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  );
}

function SystemConfig({ config }) {
  if (!config || !config.location) return null;
  const panels = config.panels || {};
  const battery = config.battery || {};
  const inverter = config.inverter || {};
  const installation = config.installation || {};
  const cost = config.cost || {};
  const roi = config.roi || {};

  const items = [
    { label: "Localisation", val: config.location || "-", sub: "" },
    { label: "Panneaux", val: `${panels.panel_count || "-"} × ${panels.panel_model || "-"}`, sub: `${panels.total_power_kwp || 0} kWp` },
    { label: "Batteries", val: `${battery.battery_count || 0} × ${battery.battery_type || "Aucune"}`, sub: `${battery.required_capacity_kwh || 0} kWh` },
    { label: "Onduleur", val: inverter.inverter_model || "-", sub: `${inverter.recommended_power_kw || 0} kW` },
    { label: "Installation", val: `${installation.orientation || "-"} - ${installation.tilt_angle || 30}°`, sub: installation.installation_type || "-" },
    { label: "Budget", val: `${toNumber(cost.total_cost).toLocaleString()} DH`, sub: `ROI: ${roi.roi_years || "-"} ans` },
  ];

  return (
    <div className="sys-info">
      <div className="sys-title"><Sun size={16} />Configuration système (depuis votre rapport)</div>
      <div className="sys-grid">
        {items.map((item) => (
          <div key={item.label} className="sys-item">
            <div className="sys-item-label">{item.label}</div>
            <div className="sys-item-val">{item.val}</div>
            <div className="sys-item-sub">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MainChart({ data, tab }) {
  if (tab === "battery") return <MiniChart data={data} unit="%" series={[{ key: "batteryPct", label: "Batterie", color: "#1D9E75" }]} />;
  if (tab === "irradiance") return <MiniChart data={data} unit=" W/m²" series={[{ key: "irradiance", label: "Irradiance", color: "#EF9F27" }]} />;
  if (tab === "temperature") return (
    <MiniChart data={data} unit=" °C" series={[
      { key: "ambientTemp", label: "Ambiante", color: "#378ADD", dashed: true },
      { key: "panelTemp", label: "Panneaux", color: "#D85A30" },
    ]} />
  );
  return (
    <MiniChart data={data} unit=" kWh" series={[
      { key: "production", label: "Production", color: "#F5A623" },
      { key: "consumption", label: "Consommation", color: "#163b67", dashed: true },
    ]} />
  );
}

export default function MonitoringPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("energy");
  const [closedAlerts, setClosedAlerts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [systemConfig, setSystemConfig] = useState(null);
  const [hasReport, setHasReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadMySimulation() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("http://127.0.0.1:8000/api/v1/monitoring/my-simulation", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erreur chargement monitoring.");

        const result = await response.json();

        const normalized = (result.data || []).map((point, index) => {
          const timestamp = point.timestamp ? new Date(point.timestamp) : null;
          const hour = timestamp && !isNaN(timestamp) ? `${timestamp.getHours()}h` : `${index}h`;
          return {
            hour,
            production: toNumber(point.production_kwh),
            consumption: toNumber(point.consumption_kwh),
            batteryPct: toNumber(point.battery_level_percent),
            irradiance: toNumber(point.irradiance_w_m2),
            ambientTemp: toNumber(point.temperature),
            panelTemp: toNumber(point.panel_temperature_c || point.temperature),
            pr: toNumber(point.performance_ratio_percent),
            balance: toNumber(point.energy_balance_kwh),
            gridImport: toNumber(point.grid_import_kwh),
            gridExport: toNumber(point.grid_export_kwh),
            status: point.system_status || "normal",
          };
        });

        setData(normalized);
        setSummary(result.summary || null);
        setHasReport(result.has_report || false);
        setSystemConfig(result.system_config || null);

        const normalizedAlerts = (result.alerts || []).map((alert, i) => ({
          id: `${alert.alert_type || "alert"}-${i}`,
          type: alert.severity === "critical" ? "critique" : "important",
          msg: alert.message || "Alerte détectée.",
        }));
        setAlerts(normalizedAlerts);

      } catch (err) {
        setError(err.message || "Erreur monitoring.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMySimulation();
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((i) => (data.length ? (i + 1) % data.length : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, [data.length]);

  const current = data[currentIndex] || data[0] || {};
  const totalProd = summary?.total_production_kwh ?? 0;
  const totalConso = summary?.total_consumption_kwh ?? 0;
  const batColor = current.batteryPct < 20 ? "#E24B4A" : current.batteryPct < 40 ? "#EF9F27" : "#1D9E75";
  const visibleAlerts = alerts.filter((a) => !closedAlerts.includes(a.id));
  const grid = current.gridImport > 0.05
    ? { val: current.gridImport.toFixed(2), label: "Import réseau", color: "#E24B4A" }
    : current.gridExport > 0.05
      ? { val: current.gridExport.toFixed(2), label: "Export réseau", color: "#1D9E75" }
      : { val: "0.00", label: "Équilibre", color: "#534AB7" };

  return (
    <div className="mon-page">
      <header className="home-header">
        <div className="home-logo">
          <div className="home-logo-icon">
            <Sun size={22} color="white" />
          </div>
          <h1>
            Solar<span className="home-logo-accent">AI</span>
          </h1>
        </div>
        
        <span className="mon-badge-header">
          {systemConfig?.location || "Monitoring PV"}
        </span>
        
        <button className="back-btn header-back" onClick={() => navigate("/assistant")}>
          <ArrowLeft size={17} />Retour
        </button>
      </header>

      <div className="mon-body">
        {/* STATUT SYSTEM NOTIFICATIONS */}
        <div className="notif-container">
          {isLoading ? (
            <div className="notif notif-ok"><Activity size={17} /><span>Chargement des données...</span></div>
          ) : error ? (
            <div className="notif notif-critique"><AlertTriangle size={17} /><span>{error}</span></div>
          ) : !hasReport ? (
            <div className="notif notif-ok" style={{ background: "#fff7ed", borderColor: "#f5a623" }}>
              <AlertCircle size={17} color="#f5a623" />
              <span>Simulation disponible — <strong>Confirmez votre rapport</strong> depuis l'assistant pour voir votre configuration personnelle.</span>
            </div>
          ) : visibleAlerts.length === 0 ? (
            <div className="notif notif-ok"><CheckCircle2 size={17} /><span>Système en bonne santé — aucune anomalie détectée</span></div>
          ) : (
            visibleAlerts.map((alert) => (
              <div key={alert.id} className={`notif notif-${alert.type}`}>
                {alert.type === "critique" ? <AlertTriangle size={17} /> : <AlertCircle size={17} />}
                <span>{alert.msg}</span>
                <button className="notif-close" onClick={() => setClosedAlerts((prev) => [...prev, alert.id])}>×</button>
              </div>
            ))
          )}
        </div>

        {/* METRICS SUMMARY ATTACHMENT BADGE */}
        {hasReport && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "#f0fdf4", border: "1px solid #1D9E75",
            borderRadius: "8px", padding: "8px 16px", marginBottom: "16px",
            color: "#1D9E75", fontWeight: "600", fontSize: "14px"
          }}>
            <CheckCircle2 size={16} />
            Données mergées : votre rapport + simulation 24h
          </div>
        )}

        {/* KPI METRICS CARD BOARD */}
        <div className="kpi-grid">
          <KpiCard icon={Zap} label="Production" value={(current.production || 0).toFixed(2)} unit=" kWh" sub={`${totalProd} kWh aujourd'hui`} color="#F5A623" />
          <KpiCard icon={Home} label="Consommation" value={(current.consumption || 0).toFixed(2)} unit=" kWh" sub={`${totalConso} kWh aujourd'hui`} color="#1A3A5C" />
          <KpiCard icon={Battery} label="Batterie" value={(current.batteryPct || 0).toFixed(1)} unit="%" color={batColor}>
            <BatteryBar value={current.batteryPct || 0} />
          </KpiCard>
          <KpiCard icon={Sun} label="Irradiance" value={current.irradiance || 0} unit=" W/m²" sub={`${current.ambientTemp || "-"} °C ambiante`} color="#EF9F27" />
          <KpiCard icon={Thermometer} label="Temp. panneaux" value={(current.panelTemp || 0).toFixed(1)} unit=" °C" sub={`PR : ${current.pr || 0}%`} color="#D85A30" />
          <KpiCard icon={Plug} label="Réseau" value={grid.val} unit=" kWh" sub={grid.label} color={grid.color} />
        </div>

        {/* SYSTEM SCHEMATIC SUMMARY MODULE */}
        {hasReport && systemConfig && <SystemConfig config={systemConfig} />}

        {/* PRIMARY CHRONO OVERVIEW AREA */}
        <div className="chart-card chart-full">
          <div className="chart-title"><LineChart size={16} />Monitoring 24h</div>
          <div className="tabs">
            {CHART_TABS.map((item) => (
              <button key={item.key} className={`tab-btn ${tab === item.key ? "active" : ""}`} onClick={() => setTab(item.key)}>
                {item.label}
              </button>
            ))}
          </div>
          {data.length > 0 ? <MainChart data={data} tab={tab} /> : (
            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* DUAL COMPARATIVE BAR GRAPH CHARTS */}
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-title"><Gauge size={16} />Performance ratio horaire</div>
            <BarChart data={data} dataKey="pr" color="#1D9E75" unit="%" />
          </div>
          <div className="chart-card">
            <div className="chart-title"><Activity size={16} />Bilan énergétique net</div>
            <BarChart data={data} dataKey="balance" color="#1D9E75" unit=" kWh" />
          </div>
        </div>

        {/* DAILY CONCLUSION REPORT SHEET */}
        {summary && (
          <div className="sys-info" style={{ marginTop: "16px" }}>
            <div className="sys-title">📊 Résumé de la journée</div>
            <div className="sys-grid">
              <div className="sys-item">
                <div className="sys-item-label">Production totale</div>
                <div className="sys-item-val">{summary.total_production_kwh} kWh</div>
              </div>
              <div className="sys-item">
                <div className="sys-item-label">Consommation totale</div>
                <div className="sys-item-val">{summary.total_consumption_kwh} kWh</div>
              </div>
              <div className="sys-item">
                <div className="sys-item-label">Bilan énergétique</div>
                <div className="sys-item-val" style={{ color: summary.energy_balance_kwh >= 0 ? "#1D9E75" : "#E24B4A" }}>
                  {summary.energy_balance_kwh} kWh
                </div>
              </div>
              <div className="sys-item">
                <div className="sys-item-label">Batterie moyenne</div>
                <div className="sys-item-val">{summary.average_battery_level_percent}%</div>
              </div>
              <div className="sys-item">
                <div className="sys-item-label">Statut global</div>
                <div className="sys-item-val" style={{ color: summary.global_status === "normal" ? "#1D9E75" : "#EF9F27" }}>
                  {summary.global_status === "normal" ? "✅ Normal" : "⚠️ Attention"}
                </div>
              </div>
              <div className="sys-item">
                <div className="sys-item-label">Points anormaux</div>
                <div className="sys-item-val">{summary.abnormal_points_count}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}