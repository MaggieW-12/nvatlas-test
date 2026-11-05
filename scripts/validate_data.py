#!/usr/bin/env python3
"""Validate the published corpus files against the assignment's required fields."""

from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "corpus.json"
CSV_PATH = ROOT / "data" / "corpus.csv"
REQUIRED_FIELDS = {"source_text", "target_text", "source", "category", "human_checked"}
VALID_CATEGORIES = {
    "Communication & representation",
    "Cognition & emotion",
    "Institutions & rules",
    "Everyday action & state",
}


def main() -> None:
    payload = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    entries = payload["entries"]
    metadata = payload["metadata"]

    assert len(entries) == 500, f"Expected 500 entries, found {len(entries)}"
    assert len({entry["sample_rank"] for entry in entries}) == 500
    assert len({(entry["source_text"], entry["target_text"]) for entry in entries}) == 500

    for index, entry in enumerate(entries, 1):
        missing = REQUIRED_FIELDS - set(entry)
        assert not missing, f"Entry {index} is missing fields: {sorted(missing)}"
        for field in REQUIRED_FIELDS:
            assert str(entry[field]).strip(), f"Entry {index} has an empty {field}"
        assert entry["category"] in VALID_CATEGORIES, entry["category"]
        assert entry["human_checked"] in {"yes", "no"}
        assert f"sentence ID {entry['id']}" in entry["source"]
        assert "NV Atlas" in entry["source"]
        assert "OpenSubtitles v2024" in entry["source"]
        assert "2026-11-05" in entry["source"]
        combined = " ".join(str(value) for value in entry.values())
        assert "\ufffd" not in combined
        assert "â€" not in combined

    category_counts = Counter(entry["category"] for entry in entries)
    assert dict(category_counts) == metadata["category_counts"]
    checked_count = sum(entry["human_checked"] == "yes" for entry in entries)
    assert checked_count == 50
    assert metadata["checked_size"] == checked_count
    assert metadata["sample_size"] == len(entries)
    assert metadata["unique_terms"] == len({entry["key_term"] for entry in entries})
    assert metadata["unique_verb_renditions"] == len(
        {entry["target_key_term"] for entry in entries}
    )

    with CSV_PATH.open(encoding="utf-8", newline="") as handle:
        csv_entries = list(csv.DictReader(handle))
    assert len(csv_entries) == len(entries)
    for json_entry, csv_entry in zip(entries, csv_entries, strict=True):
        for field in REQUIRED_FIELDS:
            assert csv_entry[field] == json_entry[field], (
                f"CSV/JSON mismatch for sample {json_entry['sample_rank']} field {field}"
            )

    print(
        "Data validation passed: "
        f"{len(entries)} entries, {len(category_counts)} categories, "
        f"{checked_count} checked entries."
    )


if __name__ == "__main__":
    main()
