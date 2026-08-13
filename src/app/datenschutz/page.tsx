'use client'

import Header from '@/components/Header'
import Link from 'next/link'
import { operator } from '@/config/site'

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--dl-bg)', color: 'var(--dl-text)' }}>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 pb-4" style={{ borderBottom: '2px solid var(--dl-border)' }}>
            Datenschutzerklärung
          </h1>
          <p className="mb-8" style={{ color: 'var(--dl-muted)' }}><strong>Stand:</strong> 25. Januar 2026</p>

          {/* 1. Verantwortlicher */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              1. Verantwortlicher
            </h2>
            <div className="p-5 rounded-lg" style={{ background: 'var(--dl-card)', border: '1px solid var(--dl-border)', borderLeft: '4px solid var(--dl-accent)' }}>
              <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
                <strong style={{ color: 'var(--dl-text)' }}>{operator.name}</strong><br />
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

          {/* 2. Allgemeine Hinweise */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              2. Allgemeine Hinweise
            </h2>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--dl-text)' }}>2.1 Verzeichnis von Verarbeitungstätigkeiten</h3>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              Wir führen ein Verzeichnis von Verarbeitungstätigkeiten gemäß Art. 30 DSGVO, in dem alle Verarbeitungsprozesse personenbezogener Daten dokumentiert sind. Auf Anfrage können Sie dieses Verzeichnis einsehen. Bitte wenden Sie sich hierfür an die im Abschnitt &quot;1. Verantwortlicher&quot; genannte Kontaktadresse.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--dl-text)' }}>2.2 Datenschutzfolgenabschätzung</h3>
            <p style={{ color: 'var(--dl-muted)' }}>
              Wir haben eine Datenschutzfolgenabschätzung gemäß Art. 35 DSGVO für die Verarbeitung personenbezogener Daten auf unserer Plattform durchgeführt. Diese hat ergeben, dass durch die ausschließliche Verarbeitung öffentlicher GitHub-Daten, den Einsatz geprüfter Dienstleister mit angemessenen Sicherheitsmaßnahmen und die transparente Dokumentation aller Verarbeitungsprozesse keine erheblichen Risiken für die Rechte und Freiheiten der betroffenen Personen bestehen.
            </p>
          </section>

          {/* 3. Datenerfassung auf dieser Website */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              3. Datenerfassung auf dieser Website
            </h2>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--dl-text)' }}>3.1 Hosting</h3>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Diese Website wird auf Servern von <strong style={{ color: 'var(--dl-text)' }}>Vercel Inc.</strong> gehostet. Der Anbieter erhebt in sogenannten Logfiles folgende Daten:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-3" style={{ color: 'var(--dl-muted)' }}>
              <li>IP-Adresse</li>
              <li>Browsertyp und -version</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer URL (zuvor besuchte Seite)</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
            </ul>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Unser berechtigtes Interesse liegt in der Verbesserung, Stabilität, Funktionalität und Sicherheit unserer Website.
            </p>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Die Daten werden gelöscht, sobald der Zweck der Erhebung entfallen ist. Die Erfassung der Daten zur Bereitstellung der Website und die Speicherung der Daten in Logfiles ist für den Betrieb der Internetseite zwingend erforderlich.
            </p>
            <p style={{ color: 'var(--dl-muted)' }}>
              <strong style={{ color: 'var(--dl-text)' }}>Serverstandort:</strong> USA<br />
              Vercel hat sich dem EU-US Data Privacy Framework unterworfen.<br />
              Weitere Informationen:{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--dl-accent)' }}>
                https://vercel.com/legal/privacy-policy
              </a>
            </p>

            <h3 className="text-lg font-medium mb-2 mt-8" style={{ color: 'var(--dl-text)' }}>3.2 Anmeldung über GitHub OAuth</h3>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Auf dieser Website haben Sie die Möglichkeit, sich mit Ihrem GitHub-Account anzumelden. Wenn Sie sich über GitHub anmelden, werden folgende Daten von GitHub an uns übermittelt und von uns gespeichert:
            </p>

            <h4 className="font-medium mb-2 mt-4" style={{ color: 'var(--dl-text)' }}>Bei der Registrierung (einmalig):</h4>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--dl-card)' }}>
                    <th className="p-3 text-left font-semibold" style={{ border: '1px solid var(--dl-border)' }}>Datenart</th>
                    <th className="p-3 text-left font-semibold" style={{ border: '1px solid var(--dl-border)' }}>Zweck</th>
                    <th className="p-3 text-left font-semibold" style={{ border: '1px solid var(--dl-border)' }}>Quelle</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--dl-muted)' }}>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub User ID</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Eindeutige Identifikation Ihres Accounts</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Benutzername (login)</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Anzeige und Identifikation</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>E-Mail-Adresse</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Kontaktaufnahme und Account-Verwaltung</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user und /user/emails Endpoints</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Profilbild-URL (avatar_url)</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Visuelle Darstellung des Profils</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Anzeigename (name)</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Personalisierung</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Biografie (bio)</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Profilinformationen</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Standort (location)</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Profilinformationen</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Firma (company)</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Profilinformationen</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Blog-URL (blog)</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Profilinformationen</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Anzahl öffentlicher Repositories</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Statistiken</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Anzahl öffentlicher Gists</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Statistiken</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Anzahl Follower</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Statistiken</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Anzahl Following</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Statistiken</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub /user Endpoint</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub Access Token</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Abruf weiterer GitHub-Daten</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub OAuth</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-medium mb-2 mt-4" style={{ color: 'var(--dl-text)' }}>Bei der laufenden Nutzung (kontinuierlich):</h4>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Während Sie devlog.today nutzen, werden folgende zusätzliche Daten von GitHub abgerufen, um Ihre Entwicklungsaktivität darzustellen:
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--dl-card)' }}>
                    <th className="p-3 text-left font-semibold" style={{ border: '1px solid var(--dl-border)' }}>Datenart</th>
                    <th className="p-3 text-left font-semibold" style={{ border: '1px solid var(--dl-border)' }}>Zweck</th>
                    <th className="p-3 text-left font-semibold" style={{ border: '1px solid var(--dl-border)' }}>Quelle</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--dl-muted)' }}>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Gesamtanzahl Commits</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Aktivitätsstatistiken für Devlogs</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub GraphQL API</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Gesamtanzahl Issues</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Aktivitätsstatistiken für Devlogs</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub GraphQL API</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Gesamtanzahl Pull Requests</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Aktivitätsstatistiken für Devlogs</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub GraphQL API</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Gesamtanzahl Code Reviews</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Aktivitätsstatistiken für Devlogs</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub GraphQL API</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Gesamtanzahl neue Repositories</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Aktivitätsstatistiken für Devlogs</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub GraphQL API</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Contribution Calendar (Aktivitäts-Heatmap)</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Visualisierung der täglichen Aktivität</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub GraphQL API</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Contribution Years (Jahressummen)</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Historische Aktivitätsübersicht</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub GraphQL API</td></tr>
                  <tr><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Öffentliche Events</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>Detaillierte Aktivitätsinformationen</td><td className="p-3" style={{ border: '1px solid var(--dl-border)' }}>GitHub REST API (/users/&#123;username&#125;/events/public)</td></tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-lg mb-4" style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', color: '#856404' }}>
              <strong>Wichtig:</strong> Alle diese Daten sind bereits auf GitHub öffentlich einsehbar. devlog.today greift nur auf öffentlich verfügbare Informationen zu, die jeder auch ohne Anmeldung bei GitHub einsehen kann.
            </div>

            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              <strong style={{ color: 'var(--dl-text)' }}>Rechtsgrundlage:</strong> Die Datenverarbeitung erfolgt auf Grundlage Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Sie erteilen diese Einwilligung durch die Anmeldung über GitHub OAuth.
            </p>
            <p style={{ color: 'var(--dl-muted)' }}>
              <strong style={{ color: 'var(--dl-text)' }}>Widerruf:</strong> Sie können Ihre Einwilligung jederzeit widerrufen, indem Sie Ihren Account löschen oder die Zugriffsrechte in Ihren GitHub-Einstellungen unter &quot;Applications&quot; → &quot;Authorized OAuth Apps&quot; entziehen.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-8" style={{ color: 'var(--dl-text)' }}>3.3 Speicherung Ihrer Devlog-Einträge</h3>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Wenn Sie Devlog-Einträge verfassen, werden diese zusammen mit folgenden Daten gespeichert:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-3" style={{ color: 'var(--dl-muted)' }}>
              <li>Inhalt des Devlog-Eintrags</li>
              <li>Erstellungsdatum und -uhrzeit</li>
              <li>Ihre GitHub User ID (zur Zuordnung)</li>
              <li>Eventuell hochgeladene Medien oder Anhänge</li>
            </ul>
            <p style={{ color: 'var(--dl-muted)' }}>
              <strong style={{ color: 'var(--dl-text)' }}>Speicherort:</strong> Supabase (PostgreSQL-Datenbank)<br />
              <strong style={{ color: 'var(--dl-text)' }}>Serverstandort:</strong> EU-West-3 (Paris, Frankreich)<br />
              <strong style={{ color: 'var(--dl-text)' }}>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
            </p>

            <h3 className="text-lg font-medium mb-2 mt-8" style={{ color: 'var(--dl-text)' }}>3.4 Supabase Analytics</h3>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Wir nutzen die integrierten Analytics-Funktionen von Supabase zur Analyse der Nutzung unserer Plattform. Dabei werden anonymisierte Daten über die Nutzung der Datenbank erfasst (z.B. Anzahl der Anfragen, Ladezeiten). Diese Daten enthalten keine personenbezogenen Informationen.
            </p>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              <strong style={{ color: 'var(--dl-text)' }}>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Optimierung unserer Plattform)
            </p>

            <h3 className="text-lg font-medium mb-2 mt-8" style={{ color: 'var(--dl-text)' }}>3.5 Kontaktformular</h3>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Wenn Sie unser Kontaktformular oder unsere Support-Funktion nutzen, verarbeiten wir folgende Daten:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-3" style={{ color: 'var(--dl-muted)' }}>
              <li>Name (optional, falls angegeben)</li>
              <li>E-Mail-Adresse (Pflichtfeld)</li>
              <li>Nachrichteninhalt</li>
              <li>Zeitpunkt der Anfrage</li>
            </ul>
            <p className="mb-2" style={{ color: 'var(--dl-muted)' }}>
              <strong style={{ color: 'var(--dl-text)' }}>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Kommunikation mit Nutzern)
            </p>
            <p className="mb-2" style={{ color: 'var(--dl-muted)' }}>
              <strong style={{ color: 'var(--dl-text)' }}>Speicherdauer:</strong> Bis zur vollständigen Bearbeitung Ihrer Anfrage, danach weitere 3 Monate für Dokumentationszwecke
            </p>
            <p style={{ color: 'var(--dl-muted)' }}>
              <strong style={{ color: 'var(--dl-text)' }}>Verschlüsselung:</strong> Die Daten werden verschlüsselt über HTTPS/TLS übertragen und sicher in unserer Datenbank gespeichert.
            </p>
          </section>

          {/* 4. Cookies */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              4. Cookies
            </h2>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Diese Website verwendet derzeit folgende Cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-3" style={{ color: 'var(--dl-muted)' }}>
              <li><strong style={{ color: 'var(--dl-text)' }}>Session-Cookie:</strong> Technisch notwendig für die Authentifizierung und Sitzungsverwaltung. Wird nach dem Logout oder automatisch nach 7 Tagen gelöscht.</li>
            </ul>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Weitere Cookies können in Zukunft hinzugefügt werden. Diese Datenschutzerklärung wird dann entsprechend aktualisiert.
            </p>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              <strong style={{ color: 'var(--dl-text)' }}>Rechtsgrundlage für technisch notwendige Cookies:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am Betrieb der Website)
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--dl-text)' }}>4.1 Cookie-Consent und TDDDG-Konformität</h3>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Gemäß § 25 TDDDG (Telekommunikation-Telemedien-Datenschutz-Gesetz, ehemals TTDSG) informieren wir Sie über die Verwendung von Cookies. Die oben genannten Session-Cookies sind technisch unbedingt erforderlich für den Betrieb der Website und bedürfen keiner Einwilligung.
            </p>
            <p className="mb-2" style={{ color: 'var(--dl-muted)' }}>
              <strong style={{ color: 'var(--dl-text)' }}>Session-Cookie (unbedingt erforderlich):</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-3" style={{ color: 'var(--dl-muted)' }}>
              <li><strong style={{ color: 'var(--dl-text)' }}>Name:</strong> Authentifizierungs-Session-Cookie</li>
              <li><strong style={{ color: 'var(--dl-text)' }}>Zweck:</strong> Authentifizierung und Sitzungsverwaltung nach dem Login</li>
              <li><strong style={{ color: 'var(--dl-text)' }}>Laufzeit:</strong> 7 Tage oder bis zum Logout</li>
              <li><strong style={{ color: 'var(--dl-text)' }}>Rechtsgrundlage:</strong> § 25 Abs. 2 Nr. 2 TDDDG (unbedingt erforderlich)</li>
            </ul>
            <p style={{ color: 'var(--dl-muted)' }}>
              Sollten in Zukunft weitere Cookies eingesetzt werden, die nicht unbedingt erforderlich sind (z.B. Analytics, Marketing), werden wir ein Cookie-Consent-Banner implementieren und Sie vorab um Ihre Einwilligung bitten. Diese Datenschutzerklärung wird dann entsprechend aktualisiert und beinhaltet Informationen zum eingesetzten Cookie-Consent-Tool.
            </p>
          </section>

          {/* 5. Weitergabe von Daten an Dritte */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              5. Weitergabe von Daten an Dritte
            </h2>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Wir geben Ihre personenbezogenen Daten nur an Dritte weiter, wenn:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4" style={{ color: 'var(--dl-muted)' }}>
              <li>Sie Ihre ausdrückliche Einwilligung dazu erteilt haben (Art. 6 Abs. 1 lit. a DSGVO)</li>
              <li>die Weitergabe zur Erfüllung eines Vertrags erforderlich ist (Art. 6 Abs. 1 lit. b DSGVO)</li>
              <li>eine gesetzliche Verpflichtung zur Weitergabe besteht (Art. 6 Abs. 1 lit. c DSGVO)</li>
              <li>die Weitergabe zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich ist (Art. 6 Abs. 1 lit. f DSGVO)</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--dl-text)' }}>5.1 Auftragsverarbeiter</h3>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Wir setzen folgende Dienstleister als Auftragsverarbeiter gemäß Art. 28 DSGVO ein:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-3" style={{ color: 'var(--dl-muted)' }}>
              <li><strong style={{ color: 'var(--dl-text)' }}>Vercel Inc.</strong> (Hosting) - Serverstandort: USA (EU-US Data Privacy Framework)</li>
              <li><strong style={{ color: 'var(--dl-text)' }}>Supabase Inc.</strong> (Datenbank) - Serverstandort: EU-West-3 (Paris, Frankreich)</li>
              <li>
                <strong style={{ color: 'var(--dl-text)' }}>GitHub Inc.</strong> (OAuth-Authentifizierung & API) - Serverstandort: USA (EU-US Data Privacy Framework)<br />
                Datenverarbeitungsvertrag:{' '}
                <a href="https://github.com/customer-terms/github-data-protection-agreement" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--dl-accent)' }}>
                  https://github.com/customer-terms/github-data-protection-agreement
                </a>
              </li>
            </ul>
            <p style={{ color: 'var(--dl-muted)' }}>
              Mit allen Auftragsverarbeitern wurden entsprechende Vereinbarungen zur Auftragsverarbeitung gemäß Art. 28 DSGVO abgeschlossen bzw. gelten deren standardisierte Datenverarbeitungsbedingungen.
            </p>
          </section>

          {/* 6. Datenübermittlung in Drittländer */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              6. Datenübermittlung in Drittländer
            </h2>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Einige unserer Dienstleister (Vercel, GitHub) haben ihren Sitz in den USA. Die Datenübermittlung in die USA erfolgt auf Grundlage des EU-US Data Privacy Framework, dem sich beide Unternehmen unterworfen haben.
            </p>
            <p className="mb-2" style={{ color: 'var(--dl-muted)' }}>Weitere Informationen:</p>
            <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--dl-muted)' }}>
              <li>Vercel:{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--dl-accent)' }}>
                  https://vercel.com/legal/privacy-policy
                </a>
              </li>
              <li>GitHub:{' '}
                <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--dl-accent)' }}>
                  https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement
                </a>
              </li>
            </ul>
          </section>

          {/* 7. Speicherdauer */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              7. Speicherdauer
            </h2>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies für die Erfüllung der Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--dl-muted)' }}>
              <li><strong style={{ color: 'var(--dl-text)' }}>Account-Daten:</strong> Bis zur Löschung Ihres Accounts</li>
              <li><strong style={{ color: 'var(--dl-text)' }}>Devlog-Einträge:</strong> Bis zur Löschung durch Sie oder Löschung Ihres Accounts</li>
              <li><strong style={{ color: 'var(--dl-text)' }}>Server-Logfiles:</strong> Maximal 7 Tage</li>
              <li><strong style={{ color: 'var(--dl-text)' }}>GitHub Access Token:</strong> Bis zum Widerruf der OAuth-Berechtigung oder Löschung des Accounts</li>
            </ul>
          </section>

          {/* 8. Ihre Rechte */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              8. Ihre Rechte
            </h2>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
            </p>

            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--dl-text)' }}>8.1 Auskunftsrecht (Art. 15 DSGVO)</h3>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              Sie haben das Recht, Auskunft über die von uns verarbeiteten personenbezogenen Daten zu erhalten.
            </p>

            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--dl-text)' }}>8.2 Recht auf Berichtigung (Art. 16 DSGVO)</h3>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              Sie haben das Recht, unverzüglich die Berichtigung unrichtiger personenbezogener Daten zu verlangen.
            </p>

            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--dl-text)' }}>8.3 Recht auf Löschung (Art. 17 DSGVO)</h3>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              Sie haben das Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen. Dies können Sie jederzeit über die Account-Einstellungen durchführen oder per E-Mail an uns richten.
            </p>

            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--dl-text)' }}>8.4 Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</h3>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
            </p>

            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--dl-text)' }}>8.5 Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</h3>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              Sie haben das Recht, die Sie betreffenden personenbezogenen Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.
            </p>

            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--dl-text)' }}>8.6 Widerspruchsrecht (Art. 21 DSGVO)</h3>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten Widerspruch einzulegen.
            </p>

            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--dl-text)' }}>8.7 Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)</h3>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              Sie haben das Recht, Ihre Einwilligung jederzeit zu widerrufen. Der Widerruf der Einwilligung lässt die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung unberührt.
            </p>

            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--dl-text)' }}>8.8 Beschwerderecht bei einer Aufsichtsbehörde (Art. 77 DSGVO)</h3>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
            </p>
            <p style={{ color: 'var(--dl-muted)' }}>
              Die für uns zuständige Aufsichtsbehörde ist:<br />
              <strong style={{ color: 'var(--dl-text)' }}>Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen</strong><br />
              Kavalleriestraße 2-4<br />
              40213 Düsseldorf<br />
              Telefon: 0211/38424-0<br />
              E-Mail: poststelle@ldi.nrw.de<br />
              Website:{' '}
              <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--dl-accent)' }}>
                https://www.ldi.nrw.de
              </a>
            </p>
          </section>

          {/* 9. Zukünftige kostenpflichtige Funktionen */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              9. Zukünftige kostenpflichtige Funktionen
            </h2>
            <div className="p-4 rounded-lg" style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', color: '#856404' }}>
              <p className="mb-3">
                <strong>Hinweis:</strong> devlog.today ist derzeit kostenlos. In Zukunft planen wir die Einführung kostenpflichtiger Premium-Funktionen.
              </p>
              <p className="mb-2">Sobald kostenpflichtige Funktionen verfügbar sind, werden wir:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Diese Datenschutzerklärung aktualisieren</li>
                <li>Informationen über die Verarbeitung von Zahlungsdaten hinzufügen</li>
                <li>Sie vor der ersten Zahlung umfassend informieren</li>
              </ul>
              <p>
                Bei Zahlungsabwicklung werden voraussichtlich Drittanbieter wie Stripe oder PayPal zum Einsatz kommen. Wir selbst werden keine Kreditkartendaten speichern.
              </p>
            </div>
          </section>

          {/* 10. Datensicherheit */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              10. Datensicherheit
            </h2>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder gegen den Zugriff unberechtigter Personen zu schützen. Unsere Sicherheitsmaßnahmen werden entsprechend der technologischen Entwicklung fortlaufend verbessert.
            </p>
            <p className="mb-2" style={{ color: 'var(--dl-muted)' }}>Dazu gehören unter anderem:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4" style={{ color: 'var(--dl-muted)' }}>
              <li>Verschlüsselte Datenübertragung (HTTPS/TLS)</li>
              <li>Verschlüsselte Datenspeicherung in der Datenbank</li>
              <li>Sichere Authentifizierung über GitHub OAuth 2.0</li>
              <li>Regelmäßige Sicherheitsupdates</li>
              <li>Zugriffskontrollen und Protokollierung</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-6" style={{ color: 'var(--dl-text)' }}>10.1 Meldung von Datenschutzverletzungen</h3>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Sollte es trotz aller Sicherheitsmaßnahmen zu einer Datenschutzverletzung kommen, werden wir gemäß Art. 33 und 34 DSGVO wie folgt vorgehen:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--dl-muted)' }}>
              <li><strong style={{ color: 'var(--dl-text)' }}>Meldung an die Aufsichtsbehörde:</strong> Bei Verletzungen, die voraussichtlich ein Risiko für die Rechte und Freiheiten betroffener Personen zur Folge haben, informieren wir unverzüglich (binnen 72 Stunden) die zuständige Datenschutz-Aufsichtsbehörde</li>
              <li><strong style={{ color: 'var(--dl-text)' }}>Benachrichtigung betroffener Personen:</strong> Bei hohem Risiko für Ihre Rechte und Freiheiten werden Sie unverzüglich direkt von uns informiert</li>
              <li><strong style={{ color: 'var(--dl-text)' }}>Dokumentation:</strong> Wir führen eine vollständige Dokumentation aller Datenschutzverletzungen, einschließlich der ergriffenen Abhilfemaßnahmen</li>
              <li><strong style={{ color: 'var(--dl-text)' }}>Abhilfemaßnahmen:</strong> Wir ergreifen umgehend geeignete Maßnahmen zur Behebung der Verletzung und zur Minimierung möglicher Schäden</li>
            </ul>
          </section>

          {/* 11. Änderungen dieser Datenschutzerklärung */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              11. Änderungen dieser Datenschutzerklärung
            </h2>
            <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, um sie an geänderte Rechtslage oder bei Änderungen unseres Dienstes sowie der Datenverarbeitung anzupassen. Es gilt stets die zum Zeitpunkt Ihres Besuchs abrufbare Fassung.
            </p>
            <p style={{ color: 'var(--dl-muted)' }}>
              <strong style={{ color: 'var(--dl-text)' }}>Letzte Aktualisierung:</strong> 25. Januar 2026
            </p>
          </section>

          {/* 12. Kontakt */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--dl-accent)' }}>
              12. Kontakt
            </h2>
            <p className="mb-4" style={{ color: 'var(--dl-muted)' }}>
              Bei Fragen zum Datenschutz, zur Ausübung Ihrer Rechte oder bei Beschwerden können Sie uns jederzeit kontaktieren:
            </p>
            <div className="p-5 rounded-lg" style={{ background: 'var(--dl-card)', border: '1px solid var(--dl-border)', borderLeft: '4px solid var(--dl-accent)' }}>
              <p className="mb-3" style={{ color: 'var(--dl-muted)' }}>
                <strong style={{ color: 'var(--dl-text)' }}>{operator.name}</strong><br />
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
