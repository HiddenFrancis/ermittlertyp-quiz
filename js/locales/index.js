import de from "./de.js";
import en from "./en.js";
import it from "./it.js";
import fr from "./fr.js";
import es from "./es.js";
import fi from "./fi.js";
import sv from "./sv.js";
import pl from "./pl.js";
import pt from "./pt.js";

export const LOCALES = { de, en, it, fr, es, fi, sv, pl, pt };
export const LANGS = Object.keys(LOCALES);
export const i18n = Object.fromEntries(LANGS.map(code => [code, LOCALES[code].translation]));
export const VERDICTS = Object.fromEntries(LANGS.map(code => [code, LOCALES[code].verdicts]));
export const PENDING_NOTE = Object.fromEntries(LANGS.map(code => [code, LOCALES[code].pendingNote]));
