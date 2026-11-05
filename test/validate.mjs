import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Q, computeResult } from "../js/data/scoring.js";
import { BRAND, PARTNER_WEBSITES, BUY, RECOMMENDATION_LOCALES, EXTRA_GAMES, EXTRA_ORDER, REC } from "../js/data/games.js";
import { LANGS, i18n, VERDICTS } from "../js/locales/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const cssPath = path.join(root, "css", "styles.css");
const css = fs.readFileSync(cssPath, "utf8");

for (const relativePath of ["css/styles.css", "js/app.js"]) {
  assert.ok(html.includes(relativePath), `index.html bindet ${relativePath} nicht ein`);
  assert.ok(fs.existsSync(path.join(root, relativePath)), `${relativePath} fehlt`);
}
for (const match of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) {
  if (/^(?:data:|https?:)/.test(match[1])) continue;
  assert.ok(fs.existsSync(path.resolve(path.dirname(cssPath), match[1])), `CSS-Asset ${match[1]} fehlt`);
}

assert.equal(Q.length, 9, "Das Quiz muss neun Fragen enthalten");
assert.deepEqual(
  LANGS,
  ["de", "en", "it", "fr", "es", "fi", "sv", "pl", "pt"],
  "Die freigegebenen Quizsprachen sind unvollständig",
);

const informalGermanAddress = /\b(?:du|dir|dich|dein|deine|deinen|deinem|deiner|bist|tust|stehst)\b/i;
assert.equal(
  informalGermanAddress.test(JSON.stringify(i18n.de)),
  false,
  "Kommissar Hahnke muss die Ermittler:innen konsequent siezen",
);

const structuralTranslationKeys = ["q", "types", "rex", "cases", "games", "shopBtn"];
const requiredUiKeys = Object.keys(i18n.de).filter(key => !structuralTranslationKeys.includes(key));
const resultKeys = ["1", "2", "3", "4", "5", "6", "7", "rex"];

for (const locale of LANGS) {
  assert.equal(i18n[locale].pending, false, `${locale}: aktive Sprache darf nicht als ausstehend markiert sein`);
  for (const key of requiredUiKeys) {
    assert.ok(Object.hasOwn(i18n[locale], key), `${locale}: UI-Text ${key} fehlt`);
    if (typeof i18n.de[key] === "string") {
      assert.ok(i18n[locale][key].trim(), `${locale}: UI-Text ${key} ist leer`);
    }
  }
  assert.equal(i18n[locale].q.length, Q.length, `${locale}: Fragen fehlen`);
  assert.ok(i18n[locale].newBadge, `${locale}: Übersetzung für Neu-Badge fehlt`);
  assert.deepEqual(
    Array.from(i18n[locale].q, question => question.a.length),
    Array(Q.length).fill(4),
    `${locale}: Jede Frage braucht vier Antworten`,
  );
  for (const [questionIndex, question] of i18n[locale].q.entries()) {
    assert.ok(question.q.trim(), `${locale}: Frage ${questionIndex + 1} ist leer`);
    question.a.forEach((answer, answerIndex) => {
      assert.ok(answer.trim(), `${locale}: Antwort ${questionIndex + 1}.${answerIndex + 1} ist leer`);
    });
  }
  assert.deepEqual(Object.keys(i18n[locale].types), resultKeys.slice(0, 7), `${locale}: Ergebnistypen fehlen`);
  for (const type of Object.values(i18n[locale].types)) {
    for (const key of ["name", "tag", "desc", "coll"]) assert.ok(type[key]?.trim(), `${locale}: unvollständiger Ergebnistyp`);
  }
  for (const key of ["name", "tag", "desc", "coll"]) assert.ok(i18n[locale].rex[key]?.trim(), `${locale}: Rex ist unvollständig`);
  assert.deepEqual(Object.keys(VERDICTS[locale]), resultKeys, `${locale}: Urteile fehlen`);
  for (const verdict of Object.values(VERDICTS[locale])) assert.ok(verdict.trim(), `${locale}: leeres Urteil`);
  for (const gameId of Object.keys(i18n[locale].games || {})) {
    assert.ok(EXTRA_GAMES[gameId], `${locale}: Unbekanntes Zusatzspiel ${gameId}`);
  }
}

assert.equal(BRAND.ig.de, "@hiddengames_original", "Deutsches Instagram-Profil");
assert.equal(BRAND.ig.int, "@hiddengames_international", "Internationales Instagram-Profil");
for (const locale of LANGS.filter(locale => locale !== "de")) {
  assert.match(i18n[locale].shareHint, /@hiddengames_international/, `${locale}: internationales Instagram-Profil im Share-Hinweis`);
  assert.match(i18n[locale].caption, /@hiddengames_international/, `${locale}: internationales Instagram-Profil in der Caption`);
}
for (const locale of ["it", "fr", "es", "pl", "pt", "fi", "sv"]) {
  assert.ok(PARTNER_WEBSITES[locale], `${locale}: Partnerwebsite fehlt`);
  assert.doesNotThrow(() => new URL(PARTNER_WEBSITES[locale]), `${locale}: ungültige Partnerwebsite`);
}

const alarm = EXTRA_GAMES.f15;
assert.ok(alarm?.isNew, "Alarmstufe: Rot muss als Neuheit markiert sein");
assert.equal(alarm.amazon.de, "https://www.amazon.de/dp/B0FNNBXVS6");
assert.equal(alarm.shopDe, "https://www.hidden.games/produkt/alarmstufe-rot/");
assert.ok(fs.existsSync(path.join(root, alarm.img)), "Cover für Alarmstufe: Rot fehlt");
for (const game of Object.values(EXTRA_GAMES)) {
  assert.ok(fs.existsSync(path.join(root, game.img)), `Spielcover ${game.img} fehlt`);
}

assert.equal(Object.keys(BUY).length + EXTRA_ORDER.length, 15, "Der deutsche Katalog muss alle 15 Erwachsenenfälle enthalten");
assert.equal(EXTRA_ORDER[0], "f15", "Alarmstufe: Rot soll die erste Alternative sein");

for (const locale of RECOMMENDATION_LOCALES) {
  assert.ok(i18n[locale], `${locale}: Freigeschaltete Empfehlungssprache fehlt`);
  for (const resultKey of resultKeys) {
    const gameKey = REC[locale]?.[resultKey] ?? resultKey;
    assert.ok(BUY[gameKey], `${locale}: Ergebnis ${resultKey} verweist auf ein unbekanntes Spiel`);
    assert.ok(i18n[locale].cases?.[gameKey], `${locale}: Übersetzung für empfohlenes Spiel ${gameKey} fehlt`);
  }
}

const combinations = 4 ** Q.length;
const resultCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, rex: 0 };
const answers = new Array(Q.length).fill(null);

for (let encoded = 0; encoded < combinations; encoded += 1) {
  let value = encoded;
  for (let question = 0; question < Q.length; question += 1) {
    answers[question] = value % 4;
    value = Math.floor(value / 4);
  }
  resultCounts[computeResult(answers)] += 1;
}

const distribution = Object.fromEntries(
  Object.entries(resultCounts).map(([type, count]) => [type, count / combinations]),
);

for (const type of ["1", "2", "3", "4", "5", "6", "7"]) {
  assert.ok(
    distribution[type] >= 0.11 && distribution[type] <= 0.17,
    `Typ ${type} ist mit ${(distribution[type] * 100).toFixed(2)} % zu stark verzerrt`,
  );
}
assert.ok(distribution.rex >= 0.03 && distribution.rex <= 0.05, "Rex soll selten bleiben");

console.table(
  Object.fromEntries(
    Object.entries(distribution).map(([type, share]) => [type, `${(share * 100).toFixed(2)} %`]),
  ),
);
console.log("Übersetzungen, Scoring und Spielekatalog sind konsistent.");
