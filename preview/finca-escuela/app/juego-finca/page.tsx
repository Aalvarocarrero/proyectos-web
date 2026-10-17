import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finca Escuela · Aprende jugando',
  description: 'Prototipo educativo: siembra, cuida, cosecha y registra cilantro en una finca ilustrada.',
  robots: { index: false, follow: false },
};

// The standalone document has no account dependencies, network calls or child data fields.
// Keep this preview isolated from the production farm, map and authentication flows.
export default function FarmLearningPreview() {
  return <main style={{ position: 'relative', zIndex: 80, minHeight: '100dvh', background: '#f6f8ee' }}>
    <iframe title="Finca Escuela: juego educativo de VenezuelaAgro" src="/learning/finca-escuela.html" style={{ display: 'block', width: '100%', height: '100dvh', border: 0 }} />
    <noscript>Este juego requiere JavaScript. <a href="/learning/finca-escuela.html">Abrir Finca Escuela</a>.</noscript>
  </main>;
}
