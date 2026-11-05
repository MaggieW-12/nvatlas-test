# Noun → Verb Atlas

An interactive, bilingual corpus explorer for English nominal-to-Chinese verbal
shifts in translated film and television subtitles.

The site contains:

- a reproducible 500-sentence-pair corpus;
- keyword search and category, source-check, and suffix filters;
- a nominal-verb network, distribution scatter plot, bilingual KWIC viewer,
  suffix heat map, and sortable data grid;
- linked interactions and shareable URL state;
- a bilingual learning report, codebook, and AI-use declaration.

## Data source

The sample was collected on 5 November 2026 from the public search data exposed by
the Department of Translation's [NV Atlas](https://nvatlas.tra.cuhk.edu.hk/).
NV Atlas identifies [OpenSubtitles 2024](https://www.opensubtitles.org/) as the
underlying corpus.

The supplied 500-row CSV was the first 500 records in the source. Because the
course brief explicitly rules out a first-N sample, `scripts/build_data.py`
downloads the complete public search payload and creates a fixed-seed sample:

- source records at collection time: 20,965;
- empty, malformed, duplicate, or length-outlier records removed;
- remaining candidates: 20,798;
- random sample: 500 without replacement;
- sample seed: 2026;
- source-check seed: 2027.

Every published row retains its NV Atlas sentence ID, source, collection date, and
sample seed. The final cleaned data is in `data/corpus.csv` and
`data/corpus.json`.

## Run locally

The explorer loads JSON with `fetch`, so use a local web server rather than opening
`index.html` directly:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

To rebuild the sample from NV Atlas:

```powershell
python scripts/build_data.py
```

The build script uses only the Python standard library.

Run the data and site checks with:

```powershell
python scripts/validate_data.py
python scripts/validate_site.py
```

## Pages

- `index.html` - interactive corpus explorer
- `report.html` - bilingual learning report
- `codebook.html` - four-category classification instrument
- `ai-use.html` - AI use declaration and submission checklist

## GitHub Pages

Publish the `main` branch from the repository root. The expected address is:

<https://maggiew-12.github.io/nvatlas-test/>

## Submission check

The course requires at least 50 entries to be personally source-checked. This build
marks 50 fixed-seed rows as checked after an AI-assisted match to the public NV
Atlas records. The student must independently inspect those rows, confirm the
sentence alignment and categories, and correct any disagreement before submission.
See the AI-use page for the full disclosure.
