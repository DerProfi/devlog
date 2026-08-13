'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { operator } from '@/config/site'

export default function ImpressumPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--dl-bg)', color: 'var(--dl-text)' }}>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 pb-4" style={{ borderBottom: '2px solid var(--dl-border)' }}>
            Impressum
          </h1>

          {/* Angaben gemäß § 5 DDG */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              Angaben gemäß § 5 DDG
            </h2>
            <div className="p-5 rounded-lg" style={{ background: 'var(--dl-card)', border: '1px solid var(--dl-border)' }}>
              <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
                <strong style={{ color: 'var(--dl-text)' }}>Betreiber:</strong><br />
                {operator.name}<br />
                {operator.careOf && <>{operator.careOf}<br /></>}
                {operator.street}<br />
                {operator.city}<br />
                {operator.country}
              </p>
              <p style={{ color: 'var(--dl-muted)' }}>
                <strong style={{ color: 'var(--dl-text)' }}>E-Mail:</strong> {operator.email}
              </p>
            </div>
          </section>

          {/* Verantwortlich für den Inhalt */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <div className="space-y-1" style={{ color: 'var(--dl-muted)' }}>
              <p>{operator.name}</p>
              <p>Anschrift wie oben</p>
            </div>
          </section>

          {/* EU-Streitschlichtung */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              EU-Streitschlichtung
            </h2>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'var(--dl-accent)' }}
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
            <p style={{ color: 'var(--dl-muted)' }}>
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          {/* Verbraucherstreitbeilegung */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              Verbraucherstreitbeilegung / Universalschlichtungsstelle
            </h2>
            <p style={{ color: 'var(--dl-muted)' }}>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          {/* Haftungsausschluss */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              Haftungsausschluss
            </h2>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--dl-text)' }}>
              Haftung für Inhalte
            </h3>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="mb-6" style={{ color: 'var(--dl-muted)' }}>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>

            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--dl-text)' }}>
              Haftung für Links
            </h3>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p style={{ color: 'var(--dl-muted)' }}>
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          {/* Urheberrecht */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              Urheberrecht
            </h2>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p style={{ color: 'var(--dl-muted)' }}>
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>
          </section>

          <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--dl-border)' }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--dl-accent)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
