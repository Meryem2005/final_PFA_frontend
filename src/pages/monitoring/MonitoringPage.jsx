import { useEffect, useMemo, useState } from "react";
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
import API_BASE_URL from "../../services/api";
import "./MonitoringPage.css";

const SCENARIOS = {
  normal: { label: "Normal" },
  panne: { label: "Panne panneau" },
  batterie_faible: { label: "Batterie faible" },
  surcharge: { label: "Surcharge" },
};

const CHART_TABS = [
  { key: "energy", label: "Production / Conso" },
  { key: "battery", label: "Batterie" },
  { key: "irradiance", label: "Irradiance" },
  { key: "temperature", label: "Temperature" },
];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildSystemConfig(reportData, inputData) {
  const panels = reportData?.panels || {};
  const battery = reportData?.battery || {};
  const inverter = reportData?.inverter || {};
  const cost = reportData?.cost || {};
  const performance = reportData?.performance || {};
  const installation = reportData?.installation || {};

  return {
    location: reportData?.location || inputData?.city || "Localisation non definie",
    panels: {
      brand: panels.panel_brand || "Panneau solaire",
      model: panels.panel_model || "-",
      count: toNumber(panels.panel_count, 0),
      powerW: toNumber(panels.panel_power_w, 0),
      totalKwp: toNumber(panels.total_power_kwp, performance.installed_power_kw || 0),
      dailyProduction: toNumber(panels.estimated_daily_production_kwh, 0),
    },
    batteries: {
      count: toNumber(battery.battery_count, 0),
      type: battery.battery_type || "Aucune",
      unitCapacity: toNumber(battery.battery_unit_capacity_kwh, 0),
      requiredCapacity: toNumber(
        battery.required_capacity_kwh,
        performance.storage_capacity_kwh || 0
      ),
      storageCapacity: toNumber(performance.storage_capacity_kwh, 0),
    },
    inverter: {
      model: inverter.inverter_model || "-",
      powerKw: toNumber(inverter.recommended_power_kw, 0),
      type: inverter.inverter_type || "-",
    },
    installation: {
      orientation: installation.orientation || panels.orientation || inputData?.orientation || "-",
      tiltAngle: toNumber(installation.tilt_angle, panels.tilt_angle || 30),
    },
    totalCost: toNumber(cost.total_cost, 0),
    roiYears: toNumber(reportData?.roi?.roi_years, 0),
    dailyConsumption: toNumber(inputData?.daily_consumption_kwh, 15),
    coverageRate: toNumber(performance.coverage_rate_percent, 0),
    performanceRatio: toNumber(reportData?.solar_data?.performance_ratio, 0.82),
    irradiation: toNumber(reportData?.solar_data?.irradiation, 5.2),
  };
}

function buildMonitoringPayload(config, scenario) {
  const batteryCapacity = Math.max(
    config.batteries.storageCapacity,
    config.batteries.requiredCapacity,
    config.batteries.count * config.batteries.unitCapacity,
    0
  );

  return {
    daily_consumption_kwh: Math.max(config.dailyConsumption, 0.1),
    panel_count: Math.max(Math.round(config.panels.count), 1),
    total_power_kwp: Math.max(config.panels.totalKwp, 0.1),
    battery_capacity_kwh: batteryCapacity > 0 ? batteryCapacity : null,
    scenario,
    duration_hours: 24,
  };
}

function normalizeMonitoringPoint(point, index) {
  const timestamp = point.timestamp ? new Date(point.timestamp) : null;
  const hour = timestamp && !Number.isNaN(timestamp.getTime())
    ? `${timestamp.getHours()}h`
    : `${index}h`;

  return {
    hour,
    production: toNumber(point.production_kwh, 0),
    consumption: toNumber(point.consumption_kwh, 0),
    batteryPct: toNumber(point.battery_level_percent, 0),
    irradiance: toNumber(point.irradiance_w_m2, 0),
    ambientTemp: toNumber(point.temperature, 0),
    panelTemp: toNumber(point.panel_temperature_c, point.temperature || 0),
    pr: toNumber(point.performance_ratio_percent, 0),
    balance: toNumber(point.energy_balance_kwh, 0),
    gridImport: toNumber(point.grid_import_kwh, 0),
    gridExport: toNumber(point.grid_export_kwh, 0),
    status: point.system_status || "normal",
  };
}

function normalizeAlert(alert, index) {
  const severity = alert.severity || "info";

  return {
    id: `${alert.alert_type || severity}-${index}`,
    type: severity === "critical" ? "critique" : severity === "important" ? "important" : "important",
    msg: alert.message || "Alerte monitoring detectee.",
  };
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
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Graphique monitoring">
        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const y = padding + step * (height - padding * 2);
          return <line key={step} x1={padding} x2={width - padding} y1={y} y2={y} className="chart-grid" />;
        })}
        {series.map((line) => {
          const points = data.map((item, index) => `${xFor(index)},${yFor(item[line.key] ?? 0)}`).join(" ");
          return (
            <polyline
              key={line.key}
              points={points}
              fill="none"
              stroke={line.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={line.dashed ? "8 6" : undefined}
            />
          );
        })}
        {data.filter((_, index) => index % 3 === 0).map((item, index) => {
          const realIndex = index * 3;
          return (
            <text key={item.hour} x={xFor(realIndex)} y={height - 7} className="chart-axis">
              {item.hour}
            </text>
          );
        })}
        <text x={padding} y={15} className="chart-axis">
          {Math.round(max)}{unit}
        </text>
      </svg>
      <div className="chart-legend">
        {series.map((line) => (
          <span key={line.key}>
            <i style={{ background: line.color }} />
            {line.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, dataKey, color, unit = "" }) {
  const max = Math.max(1, ...data.map((item) => Math.abs(item[dataKey] || 0)));
  return (
    <div className="bar-chart" role="img" aria-label="Graphique en barres">
      {data.map((item, index) => {
        const value = item[dataKey] || 0;
        return (
          <div className="bar-col" key={`${item.hour}-${index}`}>
            <div
              className={`bar-value ${value < 0 ? "negative" : ""}`}
              style={{
                height: `${Math.max(4, (Math.abs(value) / max) * 100)}%`,
                background: value < 0 ? "#E24B4A" : color,
              }}
              title={`${item.hour}: ${value}${unit}`}
            />
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
      <div className="kpi-label">
        <Icon size={15} color={color} aria-hidden="true" />
        {label}
      </div>
      <div className="kpi-val" style={{ color }}>
        {value}
        <span className="kpi-unit">{unit}</span>
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {children}
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

function SystemInfo({ config }) {
  const items = [
    {
      label: "Panneaux",
      val: `${config.panels.count} x ${config.panels.model}`,
      sub: `${config.panels.totalKwp} kWp installes`,
    },
    {
      label: "Batteries",
      val: `${config.batteries.count} x ${config.batteries.type}`,
      sub: `${config.batteries.storageCapacity || config.batteries.requiredCapacity} kWh stockage`,
    },
    {
      label: "Onduleur",
      val: config.inverter.model,
      sub: `${config.inverter.powerKw} kW - ${config.inverter.type}`,
    },
    {
      label: "Installation",
      val: `${config.installation.orientation} - ${config.installation.tiltAngle} deg`,
      sub: `${config.coverageRate}% couverture estimee`,
    },
    {
      label: "Localisation",
      val: config.location,
      sub: `${config.irradiation} kWh/m2/j`,
    },
    {
      label: "Cout total",
      val: `${Math.round(config.totalCost).toLocaleString()} DH`,
      sub: `ROI estime: ${config.roiYears} ans`,
    },
  ];

  return (
    <div className="sys-info">
      <div className="sys-title">
        <Sun size={16} aria-hidden="true" />
        Configuration systeme issue du rapport
      </div>
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
  if (tab === "battery") {
    return <MiniChart data={data} unit="%" series={[{ key: "batteryPct", label: "Batterie", color: "#1D9E75" }]} />;
  }

  if (tab === "irradiance") {
    return <MiniChart data={data} unit=" W/m2" series={[{ key: "irradiance", label: "Irradiance", color: "#EF9F27" }]} />;
  }

  if (tab === "temperature") {
    return (
      <MiniChart
        data={data}
        unit=" C"
        series={[
          { key: "ambientTemp", label: "Ambiante", color: "#378ADD", dashed: true },
          { key: "panelTemp", label: "Panneaux", color: "#D85A30" },
        ]}
      />
    );
  }

  return (
    <MiniChart
      data={data}
      unit=" kW"
      series={[
        { key: "production", label: "Production", color: "#F5A623" },
        { key: "consumption", label: "Consommation", color: "#1A3A5C", dashed: true },
      ]}
    />
  );
}

export default function MonitoringPage({ reportData, inputData, onBack }) {
  const [scenario, setScenario] = useState("normal");
  const [tab, setTab] = useState("energy");
  const [closedAlerts, setClosedAlerts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const config = useMemo(() => buildSystemConfig(reportData, inputData), [reportData, inputData]);
  const payload = useMemo(() => buildMonitoringPayload(config, scenario), [config, scenario]);

  useEffect(() => {
    setClosedAlerts([]);
  }, [scenario]);

  useEffect(() => {
    if (!reportData) return;

    const controller = new AbortController();

    async function loadMonitoring() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/monitoring/simulate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Erreur pendant le chargement du monitoring.");
        }

        const result = await response.json();

        setData((result.data || []).map(normalizeMonitoringPoint));
        setAlerts((result.alerts || []).map(normalizeAlert));
        setSummary(result.summary || null);
        setCurrentIndex(0);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Erreur monitoring.");
          setData([]);
          setAlerts([]);
          setSummary(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadMonitoring();

    return () => controller.abort();
  }, [payload, reportData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((index) => (data.length ? (index + 1) % data.length : 0));
    }, 4000);

    return () => clearInterval(timer);
  }, [data.length]);

  if (!reportData) {
    return (
      <div className="mon-page empty-monitoring">
        <div className="empty-panel">
          <Sun size={36} />
          <h1>Monitoring indisponible</h1>
          <p>Lancez d'abord le calcul solaire pour generer les donnees du rapport.</p>
          <button onClick={onBack} className="back-btn">
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>
      </div>
    );
  }

  const current = data[currentIndex] || data[0] || {};
  const totalProd = summary?.total_production_kwh ?? Math.round(data.reduce((sum, item) => sum + item.production, 0) * 10) / 10;
  const totalConso = summary?.total_consumption_kwh ?? Math.round(data.reduce((sum, item) => sum + item.consumption, 0) * 10) / 10;
  const batColor = current.batteryPct < 20 ? "#E24B4A" : current.batteryPct < 40 ? "#EF9F27" : "#1D9E75";
  const visibleAlerts = alerts.filter((alert) => !closedAlerts.includes(alert.id));
  const grid =
    current.gridImport > 0.05
      ? { val: current.gridImport.toFixed(2), label: "Import reseau", color: "#E24B4A" }
      : current.gridExport > 0.05
        ? { val: current.gridExport.toFixed(2), label: "Export reseau", color: "#1D9E75" }
        : { val: "0.00", label: "Equilibre", color: "#534AB7" };

  return (
    <div className="mon-page">
      <header className="mon-header">
        <div className="mon-logo">
          <div className="mon-logo-icon">
            <Sun size={18} aria-hidden="true" />
          </div>
          Solar<span className="sun-c">AI</span>
        </div>
        <span className="mon-badge-header">{config.location}</span>
        <button className="back-btn header-back" onClick={onBack}>
          <ArrowLeft size={17} />
          Retour
        </button>
      </header>

      <div className="mon-body">
        <div className="notif-container" role="alert" aria-live="polite">
          {isLoading ? (
            <div className="notif notif-ok">
              <Activity size={17} aria-hidden="true" />
              <span>Chargement des donnees monitoring depuis le backend...</span>
            </div>
          ) : error ? (
            <div className="notif notif-critique">
              <AlertTriangle size={17} aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : visibleAlerts.length === 0 ? (
            <div className="notif notif-ok">
              <CheckCircle2 size={17} aria-hidden="true" />
              <span>Systeme en bonne sante: aucune anomalie detectee</span>
            </div>
          ) : (
            visibleAlerts.map((alert) => (
              <div key={alert.id} className={`notif notif-${alert.type}`}>
                {alert.type === "critique" ? <AlertTriangle size={17} /> : <AlertCircle size={17} />}
                <span>{alert.msg}</span>
                <button className="notif-close" onClick={() => setClosedAlerts((prev) => [...prev, alert.id])} aria-label="Fermer">
                  x
                </button>
              </div>
            ))
          )}
        </div>

        <div className="scenario-row">
          <span className="scenario-label">Scenario :</span>
          {Object.entries(SCENARIOS).map(([key, value]) => (
            <button key={key} className={`sc-btn ${scenario === key ? "active" : ""}`} onClick={() => setScenario(key)}>
              {value.label}
            </button>
          ))}
        </div>

        <div className="kpi-grid">
          <KpiCard icon={Zap} label="Production" value={(current.production || 0).toFixed(2)} unit=" kW" sub={`${totalProd} kWh aujourd'hui`} color="#F5A623" />
          <KpiCard icon={Home} label="Consommation" value={(current.consumption || 0).toFixed(2)} unit=" kW" sub={`${totalConso} kWh aujourd'hui`} color="#1A3A5C" />
          <KpiCard icon={Battery} label="Batterie" value={(current.batteryPct || 0).toFixed(1)} unit="%" color={batColor}>
            <BatteryBar value={current.batteryPct || 0} />
          </KpiCard>
          <KpiCard icon={Sun} label="Irradiance" value={current.irradiance || 0} unit=" W/m2" sub={`${current.ambientTemp || "-"} C ambiante`} color="#EF9F27" />
          <KpiCard icon={Thermometer} label="Temp. panneaux" value={(current.panelTemp || 0).toFixed(1)} unit=" C" sub={`PR : ${current.pr || 0}%`} color="#D85A30" />
          <KpiCard icon={Plug} label="Reseau" value={grid.val} unit=" kW" sub={grid.label} color={grid.color} />
        </div>

        <SystemInfo config={config} />

        <div className="chart-card chart-full">
          <div className="chart-title">
            <LineChart size={16} aria-hidden="true" />
            Monitoring 24h genere depuis le rapport
          </div>
          <div className="tabs">
            {CHART_TABS.map((item) => (
              <button key={item.key} className={`tab-btn ${tab === item.key ? "active" : ""}`} onClick={() => setTab(item.key)}>
                {item.label}
              </button>
            ))}
          </div>
          <MainChart data={data} tab={tab} />
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-title">
              <Gauge size={16} aria-hidden="true" />
              Performance ratio horaire
            </div>
            <BarChart data={data} dataKey="pr" color="#1D9E75" unit="%" />
          </div>
          <div className="chart-card">
            <div className="chart-title">
              <Activity size={16} aria-hidden="true" />
              Bilan energetique net
            </div>
            <BarChart data={data} dataKey="balance" color="#1D9E75" unit=" kW" />
          </div>
        </div>
      </div>
    </div>
  );
}
