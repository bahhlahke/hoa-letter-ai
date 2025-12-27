'use client';

// Updated homepage layout for HOA Letter AI
import Layout from './components/Layout';
import LetterForm from './components/LetterForm';
import CommunityProfileForm from './components/CommunityProfileForm';
import FAQ from './components/FAQ';

export default function Home() {
  return (
    <Layout>
      <section className="hero">
        <h1>HOA Letter AI</h1>
        <p>Authority-grade HOA communication</p>
        <button onClick={() => document.getElementById('draft-section')?.scrollIntoView({ behavior: 'smooth' })}>
          Draft My Notice
        </button>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <ol>
          <li>Enter your HOA and violation details</li>
          <li>Choose tone and due date</li>
          <li>Generate a ready-to-send letter</li>
        </ol>
      </section>

      <section className="features">
        <h2>Features</h2>
        <ul>
          <li>Auto-cite guideline sections</li>
          <li>Branded HOA PDFs</li>
          <li>Email delivery (optional)</li>
        </ul>
      </section>

      <section id="draft-section">
        <CommunityProfileForm />
        <LetterForm />
      </section>

      <FAQ />
    </Layout>
  );
}
