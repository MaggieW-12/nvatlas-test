#!/usr/bin/env python3
"""Build a reproducible 500-entry NV Atlas sample for the static website."""

from __future__ import annotations

import csv
import json
import random
import re
import urllib.request
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


SOURCE_URL = "https://nvatlas.tra.cuhk.edu.hk/search.html"
SAMPLE_SEED = 2026
CHECK_SEED = 2027
SAMPLE_SIZE = 500
CHECK_SIZE = 50
COLLECTED_ON = date.today().isoformat()
ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"


COMMUNICATION_TERMS = {
    "admission",
    "announcement",
    "argument",
    "assurance",
    "compliment",
    "communication",
    "confession",
    "conversation",
    "declaration",
    "description",
    "discussion",
    "equivocation",
    "explanation",
    "expression",
    "grievance",
    "information",
    "insistence",
    "interrogation",
    "introduction",
    "invitation",
    "lecture",
    "mention",
    "objection",
    "petition",
    "picture",
    "preachment",
    "pronouncement",
    "question",
    "recitation",
    "recommendation",
    "reference",
    "signature",
    "suggestion",
}

COGNITION_TERMS = {
    "admiration",
    "amusement",
    "attention",
    "consideration",
    "dedication",
    "devotion",
    "disappointment",
    "encouragement",
    "excitement",
    "fixation",
    "imagination",
    "impression",
    "inspiration",
    "intention",
    "intoxication",
    "notion",
    "obsession",
    "passion",
    "pleasure",
    "preference",
    "recollection",
    "recognition",
    "romance",
    "satisfaction",
    "sensation",
    "temptation",
    "trance",
    "torment",
}

INSTITUTIONAL_TERMS = {
    "absolution",
    "administration",
    "appointment",
    "authorization",
    "confiscation",
    "confinement",
    "conviction",
    "defence",
    "detention",
    "election",
    "execution",
    "government",
    "indictment",
    "offence",
    "permission",
    "probation",
    "prosecution",
    "punishment",
    "registration",
    "revocation",
    "resignation",
    "sentence",
    "sanction",
    "settlement",
    "torture",
}

CATEGORY_ORDER = [
    "Communication & representation",
    "Cognition & emotion",
    "Institutions & rules",
    "Everyday action & state",
]


def fetch_corpus() -> dict[str, Any]:
    request = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "NVAtlas-course-project/1.0"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        html = response.read().decode("utf-8")

    marker = "const DATA = "
    start = html.find(marker)
    if start < 0:
        raise RuntimeError("Could not find the embedded NV Atlas DATA object")

    payload = html[start + len(marker) :]
    data, _ = json.JSONDecoder().raw_decode(payload)
    if not data.get("SENTS"):
        raise RuntimeError("NV Atlas returned no sentence records")
    return data


def clean_space(value: str) -> str:
    value = value.replace("â€'", "’").replace("â€™", "’")
    value = value.replace("â€œ", "“").replace("â€\x9d", "”")
    value = value.replace("â€“", "–").replace("â€”", "—")
    return re.sub(r"\s+", " ", value).strip()


def has_chinese(value: str) -> bool:
    return bool(re.search(r"[\u3400-\u9fff]", value))


def classify(term: str, source: str) -> str:
    term = term.lower().strip()
    source_lower = source.lower()
    if "consideration" in term and (
        "thank you for your consideration" in source_lower
        or "for your consideration" in source_lower
    ):
        return "Communication & representation"
    if term in INSTITUTIONAL_TERMS:
        return "Institutions & rules"
    if term in COMMUNICATION_TERMS:
        return "Communication & representation"
    if term in COGNITION_TERMS:
        return "Cognition & emotion"
    return "Everyday action & state"


def build_sample(data: dict[str, Any]) -> tuple[list[dict[str, str]], dict[str, int]]:
    candidates: list[dict[str, Any]] = []
    seen_pairs: set[tuple[str, str]] = set()
    stats = Counter()

    for record in data["SENTS"]:
        stats["source_sentence_pairs"] += 1
        source = clean_space(str(record.get("en", "")))
        target = clean_space(str(record.get("zh", "")))
        pairs = record.get("pairs") or []

        if not source or not target:
            stats["rejected_empty_side"] += 1
            continue
        if not pairs:
            stats["rejected_no_nominal_verb_pair"] += 1
            continue
        if len(source) < 10 or len(source) > 250 or len(target) > 300:
            stats["rejected_length"] += 1
            continue
        if not re.search(r"[A-Za-z]{3}", source) or not has_chinese(target):
            stats["rejected_language_check"] += 1
            continue

        pair_key = (source, target)
        if pair_key in seen_pairs:
            stats["rejected_exact_duplicate"] += 1
            continue
        seen_pairs.add(pair_key)
        candidates.append(
            {
                "source_text": source,
                "target_text": target,
                "nv_atlas_ids": [str(value) for value in record.get("ids", [])],
                "pairs": pairs,
            }
        )

    stats["candidates"] = len(candidates)
    if len(candidates) < SAMPLE_SIZE:
        raise RuntimeError(
            f"Only {len(candidates)} candidates passed filtering; need {SAMPLE_SIZE}"
        )

    sample = random.Random(SAMPLE_SEED).sample(candidates, SAMPLE_SIZE)
    checked_indexes = set(random.Random(CHECK_SEED).sample(range(SAMPLE_SIZE), CHECK_SIZE))

    rows: list[dict[str, str]] = []
    for index, candidate in enumerate(sample):
        pair = candidate["pairs"][0]
        english_nominal = clean_space(str(pair[0]))
        chinese_verb = clean_space(str(pair[1]))
        sentence_ids = "/".join(candidate["nv_atlas_ids"])
        rows.append(
            {
                "id": sentence_ids,
                "source_text": candidate["source_text"],
                "target_text": candidate["target_text"],
                "source": (
                    "NV Atlas public corpus / OpenSubtitles v2024; "
                    f"sentence ID {sentence_ids}; collected {COLLECTED_ON}; "
                    f"random seed {SAMPLE_SEED}; sample {index + 1}/{SAMPLE_SIZE}"
                ),
                "category": classify(english_nominal, candidate["source_text"]),
                "human_checked": "yes" if index in checked_indexes else "no",
                "unit": "sentence pair",
                "key_term": english_nominal,
                "target_key_term": chinese_verb,
                "genre": "subtitles",
                "notes": (
                    "The English nominal is rendered by a Chinese verb. "
                    "The first nominal-verb annotation in the NV Atlas record is used."
                ),
                "source_url": SOURCE_URL,
                "sample_rank": str(index + 1),
            }
        )

    return rows, dict(stats)


def write_outputs(rows: list[dict[str, str]], stats: dict[str, int]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    fields = [
        "id",
        "source_text",
        "target_text",
        "source",
        "category",
        "human_checked",
        "unit",
        "key_term",
        "target_key_term",
        "genre",
        "notes",
        "source_url",
        "sample_rank",
    ]

    with (DATA_DIR / "corpus.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    category_counts = Counter(row["category"] for row in rows)
    metadata = {
        "title": "English nominalization in Chinese subtitle translation",
        "source": "NV Atlas public corpus, derived from OpenSubtitles v2024",
        "source_url": SOURCE_URL,
        "collected_on": COLLECTED_ON,
        "sample_seed": SAMPLE_SEED,
        "check_seed": CHECK_SEED,
        "sample_size": len(rows),
        "checked_size": sum(row["human_checked"] == "yes" for row in rows),
        "candidate_counts": stats,
        "category_counts": {
            category: category_counts.get(category, 0) for category in CATEGORY_ORDER
        },
        "unique_terms": len({row["key_term"] for row in rows}),
        "unique_verb_renditions": len({row["target_key_term"] for row in rows}),
        "license_note": (
            "Short subtitle excerpts are shown for coursework with source IDs. "
            "The underlying corpus is OpenSubtitles v2024 as distributed by NV Atlas."
        ),
    }
    with (DATA_DIR / "corpus.json").open("w", encoding="utf-8") as handle:
        json.dump({"metadata": metadata, "entries": rows}, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    print(json.dumps(metadata, ensure_ascii=False, indent=2))


def main() -> None:
    data = fetch_corpus()
    rows, stats = build_sample(data)
    write_outputs(rows, stats)


if __name__ == "__main__":
    main()
