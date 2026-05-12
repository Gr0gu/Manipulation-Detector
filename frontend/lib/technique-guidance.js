/** @type {Record<string, string>} */
export const TECHNIQUE_GUIDANCE_RO = {
  disinformation_claim:
    "Verificați afirmația prin surse independente; evitați redistribuirea până la confirmare.",
  manipulation_claim:
    "Căutați dovezi concrete; separați faptele de interpretări sau acuzații generale.",
  propaganda:
    "Identificați apelul emoțional sau simplificarea excesivă; comparați cu alte perspective.",
  emotional_language:
    "Observați intensitatea emoțională; reformulați mesajul în termeni neutri pentru a evalua conținutul.",
  personal_attack:
    "Concentrați-vă pe argumente despre politici, nu pe caracterul persoanei.",
  aggressive_language:
    "Evaluați dacă tonul înlocuiește argumente; căutați formulări factuale echivalente.",
  fear_appeal:
    "Întrebați: riscul este cuantificat sau exagerat? Ce măsuri concrete se propun?",
  exaggeration:
    "Căutați nuanțe și date; extreme absolute („toți”, „niciodată”) merită verificare.",
  urgency_pressure:
    "Presiunea temporală poate ascunde lipsa de dovezi; acordați-vă timp pentru verificare.",
};

export function guidanceForTechniques(techniques) {
  if (!techniques?.length) return null;
  const first = techniques[0];
  return TECHNIQUE_GUIDANCE_RO[first] || null;
}
