#!/usr/bin/env python3
"""Check local links, fragment targets, IDs, and interface translation keys."""

from __future__ import annotations

import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.references: list[str] = []
        self.i18n_keys: list[str] = []
        self.page_languages: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"])
        for attribute in ("href", "src"):
            if values.get(attribute):
                self.references.append(values[attribute])
        for attribute in ("data-i18n", "data-i18n-placeholder", "data-i18n-option"):
            if values.get(attribute):
                self.i18n_keys.append(values[attribute])
        if values.get("data-page-lang"):
            self.page_languages.add(values["data-page-lang"])


def translation_keys() -> set[str]:
    source = (ROOT / "assets" / "site.js").read_text(encoding="utf-8")
    block = source.split("const translations = {", 1)[1].split("const categoryKeys", 1)[0]
    return set(re.findall(r"^\s{6}([A-Za-z][A-Za-z0-9]*):", block, re.MULTILINE))


def main() -> None:
    keys = translation_keys()
    parsed: dict[Path, PageParser] = {}

    for html_path in HTML_FILES:
        parser = PageParser()
        parser.feed(html_path.read_text(encoding="utf-8"))
        parsed[html_path] = parser
        assert len(parser.ids) == len(set(parser.ids)), f"Duplicate ID in {html_path.name}"
        missing_keys = sorted(set(parser.i18n_keys) - keys)
        assert not missing_keys, f"Missing translations in {html_path.name}: {missing_keys}"

    for html_path, parser in parsed.items():
        for reference in parser.references:
            split = urlsplit(reference)
            if split.scheme or split.netloc or reference.startswith(("#", "mailto:")):
                if reference.startswith("#"):
                    target_path = html_path
                else:
                    continue
            else:
                target_path = (html_path.parent / unquote(split.path)).resolve()
                assert target_path.exists(), f"Broken local link in {html_path.name}: {reference}"
            if split.fragment:
                if target_path.suffix.lower() == ".html":
                    target_parser = parsed.get(target_path)
                    assert target_parser is not None
                    assert split.fragment in target_parser.ids, (
                        f"Broken fragment in {html_path.name}: {reference}"
                    )

    report = parsed[ROOT / "report.html"]
    codebook = parsed[ROOT / "codebook.html"]
    ai_use = parsed[ROOT / "ai-use.html"]
    for page in (report, codebook, ai_use):
        assert page.page_languages == {"en", "zh"}

    for path in [
        ROOT / "index.html",
        ROOT / "report.html",
        ROOT / "codebook.html",
        ROOT / "ai-use.html",
        ROOT / "assets" / "site.js",
        ROOT / "assets" / "explorer.js",
    ]:
        text = path.read_text(encoding="utf-8")
        assert "\ufffd" not in text, f"Replacement character in {path.name}"
        assert not any(ord(char) < 9 or 13 < ord(char) < 32 for char in text), (
            f"Control character in {path.name}"
        )

    print(f"Site validation passed: {len(HTML_FILES)} pages and {len(keys)} translation keys.")


if __name__ == "__main__":
    main()
