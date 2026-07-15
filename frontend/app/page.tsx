import { Footer } from "./components/Footer";

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="hero">
        <p className="home-eyebrow">Multiplayer Stealth Arena</p>

        <h1 className="home-title">Shadow Seek</h1>

        <p className="home-description">
          A dark multiplayer hide-and-seek arena.
        </p>

        <button className="home-login-button">Login</button>
      </section>

      <Footer />
    </main>
  );
}
