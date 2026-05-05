# Frontend — Detector manipulare

Aplicație Next.js (JavaScript / JSX) cu [shadcn/ui](https://ui.shadcn.com) care citește JSON-urile generate de backend-ul C (`manip_detector`) și permite încărcarea de PDF-uri prin același pipeline.

## Cerințe

- Node.js 20+
- Backend construit: executabil `manip_detector.exe` (implicit căutat la `../backend/build/Release/manip_detector.exe`)
- Python pe PATH (`python` sau `py -3`) pentru extragerea textului din PDF
- Fișierul de antrenament CSV la locul așteptat de backend (`backend/data/balanced_weak_train.csv`)

## Variabile de mediu

Copiați `.env.example` în `.env.local` și ajustați căile absolute pe Windows.

| Variabilă | Rol |
|-----------|-----|
| `MANIP_DETECTOR_ROOT` | Rădăcina repo-ului backend (cwd pentru `pipeline`). Implicit: `../backend` față de directorul `frontend`. |
| `MANIP_DETECTOR_EXE` | Cale completă către `manip_detector.exe`. |
| `MANIP_RESULTS_DIR` | Folderul cu `*_strict90_analysis.json`. Implicit: `MANIP_DETECTOR_ROOT/data/results`. |

## Rulare

```bash
cd frontend
npm install
npm run dev
```

Deschideți [http://localhost:3000](http://localhost:3000).

## Smoke test (date)

După ce rulați o dată în backend:

`manip_detector pipeline cale\către\stenograma.pdf`

în `backend/data/results` apar fișierele `*_strict90_analysis.json`. Reîncărcați pagina principală — cardurile și lista de ședințe se populează automat.

## API interne (Route Handlers)

- `GET /api/sessions` — listă sesiuni
- `GET /api/sessions/[id]` — strict + complet + high90 (dacă există)
- `GET /api/aggregate` — toate fragmentele strict, pentru pagina principală
- `GET /api/search?q=` — căutare în fragmentele strict
- `POST /api/analyze` — form-data câmp `file` (PDF); rulează pipeline-ul

## Notă despre dimensiunea PDF

Încărcările mari depind de limitele serverului Next.js și de memorie. Pentru PDF-uri foarte mari, rulați pipeline-ul din linia de comandă și reîmprospătați UI-ul.
