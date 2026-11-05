# Welcher Ermittlertyp sind Sie? — Hidden Games

## 🔗 Live-Link (Test): **https://hiddenfrancis.github.io/ermittlertyp-quiz/**

Mehrsprachiges Persönlichkeits-Quiz (**DE · EN · IT · FR · ES · FI · SV · PL · PT**): neun Fragen, am Ende ein Ermittlertyp, eine passende Fallempfehlung und ein teilbares Sharepic für Instagram & Co. Die neuen Fassungen FI, SV, PL und PT sind vollständige Übersetzungsentwürfe und benötigen vor der Veröffentlichung noch eine muttersprachliche Freigabe.

Einfach den Link oben öffnen oder weitergeben — funktioniert auf Handy, Tablet und Laptop, ohne Anmeldung.

---

*Technisch:* statische HTML-, CSS- und JavaScript-Module ohne Build-Prozess, gehostet über GitHub Pages. Übersetzungen liegen einzeln in `js/locales/`, Spiele- und Marktdaten in `js/data/games.js`, die Auswertung in `js/data/scoring.js` und die Darstellungslogik in `js/app.js`.

Mit `npm test` werden Übersetzungen, Spielekatalog und alle 262.144 möglichen Antwortkombinationen geprüft. Die Checkliste für neue Märkte steht in `docs/language-onboarding.md`.
