# Blutdruck-Test und Analyse - Produktanforderungsdokument (PRD)

## Übersicht

Dieses Dokument beschreibt die Anforderungen für die Zusammenführung der beiden Webseiten "blutdruck-test.html" und "blutdruck-analyse.html" in eine einzige Seite mit einem schrittweisen Benutzerablauf.

## Ziele

- Vereinfachung des Benutzererlebnisses durch Reduzierung der Seitennavigation
- Verbesserung der Konversionsrate durch einen nahtlosen Übergang von der Datenerfassung zur Analyse und zum Produktangebot
- Beibehaltung aller bestehenden Funktionalitäten beider Seiten

## Benutzerablauf

Der neue Benutzerablauf besteht aus drei Hauptschritten:

### Schritt 1: Formular zur Datenerfassung

- Anzeige des Formulars zur Eingabe der Blutdruckdaten
- Benutzer gibt Alter, systolischen und diastolischen Blutdruck, Bedenken und E-Mail-Adresse ein
- Validierung aller Eingabefelder in Echtzeit

### Schritt 2: Datenverarbeitung

- Anzeige einer Ladeanimation während der "Analyse" der Daten
- Speicherung der eingegebenen Daten für die Analyse

### Schritt 3: Ergebnisanzeige und Produktangebote

- Anzeige der Analyseergebnisse basierend auf den eingegebenen Daten
- Präsentation der Produktangebote (Frühvogel-Angebot, Spezialangebot, Einführungspreis)
- Möglichkeit zur Produktreservierung/Bestellung

## Technische Anforderungen

### HTML-Struktur

- Eine einzige HTML-Datei mit drei Hauptabschnitten (Formular, Ladeanimation, Ergebnisse)
- Verwendung von CSS-Klassen zur Steuerung der Sichtbarkeit der verschiedenen Abschnitte
- Responsive Design für optimale Darstellung auf allen Geräten

### JavaScript-Funktionalität

- Formularvalidierung in Echtzeit
- Speicherung der Formulardaten im Browser
- Steuerung der Sichtbarkeit der verschiedenen Abschnitte
- Simulation einer Datenanalyse mit Ladeanimation
- Generierung der Analyseergebnisse basierend auf den eingegebenen Daten
- Integration der Stripe-Checkout-Funktionalität für die Produktangebote

### Datenfluss

1. Benutzer gibt Daten im Formular ein
2. Daten werden validiert und im Browser gespeichert
3. Ladeanimation wird angezeigt
4. Analyseergebnisse werden basierend auf den gespeicherten Daten generiert
5. Produktangebote werden angezeigt
6. Bei Klick auf "Jetzt reservieren" wird der Stripe-Checkout-Prozess gestartet

## UI-Komponenten

### Formularabschnitt

- Überschrift und Einführungstext
- Eingabefelder für Alter, systolischen und diastolischen Blutdruck
- Radiobuttons für Bedenken bezüglich aktueller Messgeräte
- E-Mail-Eingabefeld
- Absenden-Button

### Ladeabschnitt

- Ladeanimation (Spinner)
- Text "Ihre Daten werden analysiert..."

### Ergebnisabschnitt

- Anzeige der eingegebenen Werte (Alter, systolischer und diastolischer Wert)
- Analyseergebnis mit farblicher Kennzeichnung (blau, orange, gelb oder rot)
- Produktangebote:
  - Frühvogel-Angebot (ausverkauft)
  - Spezialangebot (aktuell)
  - Einführungspreis
- Hinweistext zur begrenzten Verfügbarkeit

## Implementierungsdetails

### CSS

- Beibehaltung der bestehenden Stile aus beiden Seiten
- Zusätzliche Stile zur Steuerung der Sichtbarkeit der verschiedenen Abschnitte
- Übergangseffekte zwischen den Schritten

### JavaScript

- Zusammenführung der JavaScript-Funktionen aus beiden Seiten
- Anpassung der Formularverarbeitung zur Steuerung des Ablaufs ohne Seitenwechsel
- Anpassung der Stripe-Integration für die Produktangebote

## Testanforderungen

- Test der Formularvalidierung
- Test des Übergangs zwischen den Schritten
- Test der Analyseergebnisse für verschiedene Eingabewerte
- Test der Stripe-Integration
- Test auf verschiedenen Geräten und Browsern

## Erfolgsmetriken

- Erhöhung der Konversionsrate (Formularausfüllung zu Produktreservierung)
- Reduzierung der Absprungrate
- Erhöhung der durchschnittlichen Verweildauer auf der Seite
