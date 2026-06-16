import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Bot,
  BarChart3,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";
import "./HomePage.css";

// --- COMPOSANT ANIMATED COUNTER (QUI SE REPETE) ---
function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  // Détecte quand la section apparaît ou disparaît de l'écran
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true); // Démarre l'animation
        } else {
          // Dès qu'on scrolle ailleurs, on remet à 0 pour que ça se relance la prochaine fois
          setIsVisible(false);
          setCount(0);
        }
      },
      { threshold: 0.2 }, // Se déclenche quand 20% de la section est visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animation du compteur
  useEffect(() => {
    if (!isVisible) return;

    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Effet d'accélération (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = window.requestAnimationFrame(animate);

    // Nettoyage si le composant disparaît pendant l'animation
    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isVisible, target, duration]);

  return <span ref={ref}>{count}</span>;
}

// --- COMPOSANT PRINCIPAL ---
export default function HomePage() {
  const navigate = useNavigate();

  const carouselImages = [1, 2, 3, 4, 1, 2, 3, 4];

  return (
    <div className="home-page">
      {/* HEADER */}
      <header className="home-header">
        <div className="home-logo">
          <div className="home-logo-icon">
            <Sun size={22} color="white" />
          </div>
          <h1>
            Solar<span className="home-logo-accent">AI</span>
          </h1>
        </div>

        <div className="home-actions">
          <button className="home-login-btn" onClick={() => navigate("/login")}>
            Connexion
          </button>
          <button
            className="home-register-btn"
            onClick={() => navigate("/register")}
          >
            Inscription
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-left">
          <h2>
            Libérez le plein potentiel de votre{" "}
            <span className="text-highlight">installation solaire</span>
          </h2>
          <p>
            Dimensionnement intelligent, analyse des performances et suivi en
            temps réel avec recommandations adaptées.
          </p>
          <div className="home-buttons">
            <button
              className="home-primary-btn"
              onClick={() => navigate("/register")}
            >
              Commencer gratuitement
              <ArrowRight size={18} />
            </button>
            <button
              className="home-secondary-btn"
              onClick={() => navigate("/login")}
            >
              Se connecter
            </button>
          </div>
        </div>

        {/* CAROUSEL INFINI */}
        <div className="home-hero-right">
          <div className="carousel-glow"></div>
          <div className="home-carousel-wrapper">
            <div className="home-carousel-viewport">
              <div className="home-carousel-track-infinite">
                {carouselImages.map((n, i) => (
                  <div key={i} className="home-carousel-item-infinite">
                    <img src={`/images/solar${n}.png`} alt={`solar ${n}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-features">
        <div className="home-feature-card">
          <div className="feature-icon-box icon-yellow">
            <Sun size={28} />
          </div>
          <h3>Dimensionnement IA</h3>
          <p>
            Calcule automatiquement les panneaux, batteries et onduleurs
            adaptés.
          </p>
        </div>
        <div className="home-feature-card">
          <div className="feature-icon-box icon-blue">
            <BarChart3 size={28} />
          </div>
          <h3>Monitoring Intelligent</h3>
          <p>
            Suivi en temps réel des performances de votre système
            photovoltaïque.
          </p>
        </div>
        <div className="home-feature-card">
          <div className="feature-icon-box icon-orange">
            <Bot size={28} />
          </div>
          <h3>Agent IA</h3>
          <p>
            Obtenez des recommandations, analyses et diagnostics automatiques.
          </p>
        </div>
      </section>

      {/* STATS AVEC VIDEO ET COMPTEURS (SANS ICÔNES) */}
      <section className="home-stats-section">
        <video className="stats-video" autoPlay loop muted playsInline>
          <source src="/videos/solar-bg.mp4" type="video/mp4" />
        </video>
        <div className="stats-overlay"></div>

        <div className="home-stats">
          <div className="home-stat-item">
            {/* Icône supprimée ici */}
            <h3>
              <AnimatedCounter target={300} duration={2000} />+
            </h3>
            <p>jours d'ensoleillement par an</p>
          </div>

          <div className="home-stat-item">
            {/* Icône supprimée ici */}
            <h3>
              <AnimatedCounter target={2} duration={2500} /> GW+
            </h3>
            <p>capacité solaire installée</p>
          </div>

          <div className="home-stat-item">
            {/* Icône supprimée ici */}
            <h3>
              <AnimatedCounter target={52} duration={2000} />%
            </h3>
            <p>objectif d'énergies renouvelables d'ici 2030</p>
          </div>
        </div>
      </section>

      {/* SECTION CONTACT */}
      <section className="home-contact">
        <div className="contact-container">
          <div className="contact-left">
            <h2>
              Une question ?{" "}
              <span className="text-highlight">Contactez-nous</span>
            </h2>
            <p>
              Notre équipe est à votre disposition pour vous accompagner dans
              votre projet de transition énergétique.
            </p>

            <div className="contact-info">
              <div className="contact-info-item">
                <div className="contact-icon-box">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4>Adresse</h4>
                  <p>Sidi Slimane Charaa, BERKANE</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon-box">
                  <Phone size={20} />
                </div>
                <div>
                  <h4>Téléphone</h4>
                  <p>+212 06 11 22 33 44</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon-box">
                  <Mail size={20} />
                </div>
                <div>
                  <h4>Email</h4>
                  <p>contact@solarai.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-right">
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Votre nom"
                  className="form-input"
                  required
                />
                <input
                  type="email"
                  placeholder="Votre email"
                  className="form-input"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Sujet"
                className="form-input"
                required
              />
              <textarea
                placeholder="Votre message..."
                className="form-textarea"
                rows="5"
                required
              ></textarea>
              <button type="submit" className="home-primary-btn">
                Envoyer le message <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-col">
            <div className="home-logo">
              <div className="home-logo-icon">
                <Sun size={22} color="white" />
              </div>
              <h1>
                Solar<span className="home-logo-accent">AI</span>
              </h1>
            </div>
            <p>
              Optimisez votre production d'énergie solaire grâce à
              l'intelligence artificielle.
            </p>
          </div>

          <div className="footer-col">
            <h3>Liens Rapides</h3>
            <ul>
              <li>
                <a href="#features">Fonctionnalités</a>
              </li>
              <li>
                <a href="#stats">Statistiques</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Services</h3>
            <ul>
              <li>
                <a href="#!">Dimensionnement</a>
              </li>
              <li>
                <a href="#!">Monitoring</a>
              </li>
              <li>
                <a href="#!">Agent IA</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Légal</h3>
            <ul>
              <li>
                <a href="#!">Conditions d'utilisation</a>
              </li>
              <li>
                <a href="#!">Politique de confidentialité</a>
              </li>
              <li>
                <a href="#!">Mentions légales</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} SolarAI. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
