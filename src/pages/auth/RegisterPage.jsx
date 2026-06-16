import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sun } from "lucide-react";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [knowledgeLevel, setKnowledgeLevel] = useState("debutant");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authAPI.register({
        full_name: fullName,
        email,
        password,
        knowledge_level: knowledgeLevel,
      });
      if (data.id) {
        const loginData = await authAPI.login({ email, password });
        if (loginData.access_token) {
          login(loginData.user, loginData.access_token);
          navigate("/assistant");
        }
      } else {
        setError(data.detail || "Erreur lors de l'inscription.");
      }
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Sun size={28} className="text-white" />
          </div>
          <h1>
            Solar<span className="auth-logo-accent">AI</span>
          </h1>
        </div>

        <h2 className="auth-title">Créer un compte</h2>
        <p className="auth-subtitle">
          Rejoignez votre espace de surveillance PV
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom"
              required
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="auth-field">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <div className="auth-field">
            <label>Niveau de connaissance PV</label>
            <div className="auth-level-group">
              {[
                {
                  value: "debutant",
                  label: "Débutant",
                  icon: "🌱",
                  desc: "Je découvre le solaire",
                },
                {
                  value: "intermediaire",
                  label: "Intermédiaire",
                  icon: "⚡",
                  desc: "J'ai quelques notions",
                },
                {
                  value: "expert",
                  label: "Expert",
                  icon: "🔆",
                  desc: "Je maîtrise le domaine",
                },
              ].map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`auth-level-btn ${knowledgeLevel === level.value ? "active" : ""}`}
                  onClick={() => setKnowledgeLevel(level.value)}
                >
                  <span className="auth-level-icon">{level.icon}</span>
                  <div className="auth-level-text">
                    <span className="auth-level-label">{level.label}</span>
                    <span className="auth-level-desc">{level.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="auth-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
