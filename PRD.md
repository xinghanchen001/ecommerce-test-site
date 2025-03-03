**PRD Einleitung: Wechsel von Test-Keys zu Live-Keys in der Stripe-Integration**

  

Dieses Dokument beschreibt den Plan und die notwendigen Schritte, die Entwickler durchführen müssen, um die Integration von Stripe von der Testumgebung auf den Live-Modus umzustellen. Ziel ist es, einen reibungslosen Wechsel sicherzustellen, wobei alle Konfigurationen, API-Keys, Webhooks und Loggings sorgfältig geprüft und aktualisiert werden. Zudem ist darauf zu achten, dass bei mehreren Stripe-Konten, die mit derselben E-Mail-Adresse verknüpft sind, ausschließlich die korrekten Live-API-Schlüssel des gewünschten (zweiten) Kontos verwendet werden und dass die Testdaten vollständig isoliert bleiben.

**Zusammenfassung der Aufgaben und Schritte:**

1. **Code-Basis und Konfiguration prüfen**

• **Identifiziere alle Stellen:**

Durchsuche deine Konfigurationsdateien (z. B. .env-Datei, Konfigurationsmodule oder direkt im Code eingebettete Werte) nach den Test-API-Keys.

• **Umgebungen trennen:**

Nutze separate Umgebungsvariablen für Test- und Live-Modus, um versehentliche Verwendungen der falschen Keys zu vermeiden.

1. **API-Keys aktualisieren**

• **Test-Keys ersetzen:**

Aktualisiere in deiner Konfiguration die Einträge für den Public Key, den Private Key und den Product Key mit den neuen Live-API-Keys.

Beispiel (in einer .env-Datei):

```
STRIPE_PUBLIC_KEY=pk_live_51QyFM2A9aibyk7ocyoijP7A9gPKC0oDS0HlySiSEuCOaS4sndnS1HZn9fyKPkf48ERT7FPaoxOWwvesYKKSy7N5J003rxyTc2b
STRIPE_PRIVATE_KEY=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
STRIPE_PRODUCT_KEY=price_1QyfHoA9aibyk7ocoy9gcOsX
```

  

• **Code-Referenzen überprüfen:**

Stelle sicher, dass alle API-Aufrufe die aktualisierten Umgebungsvariablen nutzen.

  

1. **Webhooks und Endpunkte konfigurieren**

• **Webhook-URLs prüfen:**

Überprüfe, dass alle in Stripe konfigurierten Webhook-URLs auf die Live-Umgebung zeigen.

• **Event-Handling anpassen:**

Verifiziere, dass die Logik zum Abfangen und Verarbeiten von Live-Events fehlerfrei funktioniert.

1. **Testphase in der Live-Umgebung**

• **Kleine Live-Transaktionen:**

Führe Tests mit kleinen Transaktionen (oder dem von Stripe bereitgestellten „Test-Mode im Live-Modus“, sofern verfügbar) durch, um den korrekten Ablauf zu validieren.

• **Logging und Monitoring:**

Implementiere robustes Fehler-Logging und Monitoring, um eventuelle Probleme schnell zu identifizieren und zu beheben.

1. **Deployment und Dokumentation**

• **Update in Produktion ausrollen:**

Nach erfolgreicher Validierung in Entwicklungs- bzw. Staging-Umgebungen, führe das Deployment in der Produktionsumgebung durch.

• **Dokumentation:**

Dokumentiere alle vorgenommenen Änderungen und den Wechsel der API-Keys, sodass das gesamte Team informiert ist und im Falle von Problemen schnell reagieren kann.

**Zusätzliche Hinweise bei Nutzung mehrerer Stripe-Konten mit derselben E-Mail-Adresse:**

• **Eindeutige Zuordnung im Code:**

Stelle sicher, dass ausschließlich die Live-API-Schlüssel des gewünschten (zweiten) Kontos verwendet werden, um Verwechslungen mit Test-Keys oder alten Schlüsseln zu vermeiden.

• **Webhook- und Callback-Konfiguration:**

Alle Webhooks müssen eindeutig auf das zweite Konto (Live-Modus) verweisen.

• **Daten- und Abrechnungs-Migration:**

Verifiziere, dass keine aktiven Transaktionen oder Zahlungsdaten mehr dem alten Konto zugeordnet sind, bevor dieses geschlossen wird.

• **Benachrichtigungen:**

Achte darauf, dass Benachrichtigungen aus beiden Konten korrekt zugeordnet werden, um Missverständnisse zu vermeiden.

**Fazit:**

Mit diesem strukturierten Ansatz wird sichergestellt, dass der Wechsel von Test- auf Live-Mode reibungslos erfolgt und die Kontrolle über die Stripe-Integration stets gewährleistet ist. Alle Teammitglieder sollten diese Schritte sorgfältig umsetzen und dokumentieren, um spätere Probleme und Verwechslungen zu vermeiden.