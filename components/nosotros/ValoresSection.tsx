// ── ValoresSection — Nosotros Page ──
import { IconCommunity, IconStar, IconPassion, IconGlobe } from '@/components/ui/Icons';

const VALUES = [
  {
    icon: <IconCommunity />,
    title: 'Comunidad',
    desc: 'Un espacio inclusivo donde la música une a personas de todos los orígenes y niveles.',
  },
  {
    icon: <IconStar />,
    title: 'Excelencia',
    desc: 'Buscamos la calidad artística sin perder de vista que la música es ante todo disfrute.',
  },
  {
    icon: <IconPassion />,
    title: 'Pasión',
    desc: 'Cada ensayo, cada nota, cada concierto nace de una profunda pasión compartida por la música.',
  },
  {
    icon: <IconGlobe />,
    title: 'Apertura',
    desc: 'Abiertos a toda la sociedad, sin distinción. La música como puente entre personas y culturas.',
  },
];

export default function ValoresSection() {
  return (
    <section className="section-full bg-light" style={{ paddingBlock: 'var(--sp-20)' }} aria-labelledby="valores-heading">
      <div style={{ maxWidth: 'var(--max-w)', marginInline: 'auto', paddingInline: 'var(--sp-8)' }}>
        <div className="text-center" style={{ marginBottom: 'var(--sp-12)' }}>
          <span className="section-eyebrow">Lo que nos mueve</span>
          <h2 id="valores-heading" className="section-title">Nuestros Valores</h2>
          <p className="section-subtitle">Los principios que guían cada ensayo, cada concierto y cada decisión de la OCGC.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-6)' }}>
          {VALUES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="card"
              style={{ padding: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', cursor: 'default' }}
            >
              <div style={{
                width: 56, height: 56,
                background: 'var(--clr-primary-lt)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--clr-primary)',
                flexShrink: 0,
              }}>
                {icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--clr-navy)', margin: 0 }}>{title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--clr-text-muted)', margin: 0, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
