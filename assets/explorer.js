(() => {
  const categoryOrder = [
    "Communication & representation",
    "Cognition & emotion",
    "Institutions & rules",
    "Everyday action & state",
  ];
  const categoryColors = {
    "Communication & representation": "#4b7089",
    "Cognition & emotion": "#c89332",
    "Institutions & rules": "#9d443d",
    "Everyday action & state": "#246b52",
  };
  const categoryClasses = {
    "Communication & representation": "communication",
    "Cognition & emotion": "cognition",
    "Institutions & rules": "institutions",
    "Everyday action & state": "",
  };
  const suffixes = [
    { key: "tion", label: "-tion" },
    { key: "sion", label: "-sion" },
    { key: "ment", label: "-ment" },
    { key: "ance", label: "-ance" },
    { key: "ence", label: "-ence" },
    { key: "ing", label: "-ing" },
    { key: "ity", label: "-ity" },
    { key: "other", label: "Other" },
  ];
  const pageSize = 25;
  const state = {
    q: "",
    category: "",
    checked: "",
    suffix: "",
    term: "",
    topTerms: 18,
    minWeight: 1,
    sortKey: "sample_rank",
    sortDir: "asc",
    page: 1,
  };
  let allEntries = [];
  let filteredEntries = [];
  let metadata = {};

  const $ = (selector) => document.querySelector(selector);

  function t(key, values) {
    return window.NVSite?.t(key, values) ?? key;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function nominalSuffix(term) {
    const value = String(term).toLowerCase();
    for (const suffix of suffixes) {
      if (suffix.key !== "other" && value.endsWith(suffix.key)) {
        return suffix.key;
      }
    }
    return "other";
  }

  function readUrlState() {
    const params = new URLSearchParams(window.location.search);
    state.q = params.get("q") ?? "";
    state.category = params.get("category") ?? "";
    state.checked = params.get("checked") ?? "";
    state.suffix = params.get("suffix") ?? "";
    state.term = params.get("term") ?? "";
    state.topTerms = Number(params.get("top") ?? 18);
    state.minWeight = Number(params.get("weight") ?? 1);
    state.sortKey = params.get("sort") ?? "sample_rank";
    state.sortDir = params.get("dir") === "desc" ? "desc" : "asc";
    state.page = Math.max(1, Number(params.get("page") ?? 1));

    if (!state.category) {
      state.category = "";
    }
    if (!["yes", "no"].includes(state.checked)) {
      state.checked = "";
    }
    if (!suffixes.some((suffix) => suffix.key === state.suffix)) {
      state.suffix = "";
    }
    state.topTerms = Math.min(24, Math.max(6, state.topTerms || 18));
    state.minWeight = Math.min(5, Math.max(1, state.minWeight || 1));
  }

  function syncUrl() {
    const params = new URLSearchParams();
    const values = {
      q: state.q,
      category: state.category,
      checked: state.checked,
      suffix: state.suffix,
      term: state.term,
      top: state.topTerms !== 18 ? state.topTerms : "",
      weight: state.minWeight !== 1 ? state.minWeight : "",
      sort: state.sortKey !== "sample_rank" ? state.sortKey : "",
      dir: state.sortDir !== "asc" ? state.sortDir : "",
      page: state.page !== 1 ? state.page : "",
    };
    Object.entries(values).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params.set(key, value);
      }
    });
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }

  function updateFormFromState() {
    $("#searchInput").value = state.q;
    $("#categoryFilter").value = state.category;
    $("#checkedFilter").value = state.checked;
    $("#topTermsRange").value = state.topTerms;
    $("#minWeightRange").value = state.minWeight;
    $("#topTermsValue").value = state.topTerms;
    $("#minWeightValue").value = state.minWeight;
  }

  function matchesSearch(entry) {
    const needle = state.q.trim().toLocaleLowerCase();
    if (!needle) {
      return true;
    }
    return [
      entry.source_text,
      entry.target_text,
      entry.key_term,
      entry.target_key_term,
      entry.category,
      entry.id,
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(needle);
  }

  function applyFilters() {
    filteredEntries = allEntries.filter((entry) => {
      if (state.category && entry.category !== state.category) {
        return false;
      }
      if (state.checked && entry.human_checked !== state.checked) {
        return false;
      }
      if (state.suffix && nominalSuffix(entry.key_term) !== state.suffix) {
        return false;
      }
      return matchesSearch(entry);
    });
    state.page = Math.min(
      Math.max(1, state.page),
      Math.max(1, Math.ceil(filteredEntries.length / pageSize)),
    );
  }

  function createSvg(tag, attributes = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }

  function addSvgText(parent, text, attributes = {}) {
    const element = createSvg("text", attributes);
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function renderSummary() {
    const shown = filteredEntries.length;
    const total = allEntries.length;
    $("#resultsCount").innerHTML = t("searchSummary", {
      shown: `<strong>${shown}</strong>`,
      total,
    });

    const active = $("#activeFilters");
    active.replaceChildren();
    const chips = [];
    if (state.q) {
      chips.push([`“${state.q}”`, () => {
        state.q = "";
        state.term = "";
      }]);
    }
    if (state.category) {
      chips.push([window.NVSite.categoryLabel(state.category), () => {
        state.category = "";
      }]);
    }
    if (state.checked) {
      chips.push([t(state.checked === "yes" ? "checkedOnly" : "uncheckedOnly"), () => {
        state.checked = "";
      }]);
    }
    if (state.suffix) {
      const suffix = suffixes.find((item) => item.key === state.suffix);
      chips.push([`${t("suffixLabel")}: ${suffix?.label ?? state.suffix}`, () => {
        state.suffix = "";
      }]);
    }
    if (state.term && state.term !== state.q) {
      chips.push([t("activeTerm", { term: state.term }), () => {
        state.term = "";
      }]);
    }

    chips.forEach(([label, clear]) => {
      const chip = document.createElement("span");
      chip.className = "active-filter";
      chip.append(document.createTextNode(label));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${label}`);
      remove.addEventListener("click", () => {
        clear();
        state.page = 1;
        updateView();
      });
      chip.appendChild(remove);
      active.appendChild(chip);
    });
  }

  function renderNetwork() {
    const stage = $("#networkChart");
    stage.replaceChildren();

    const termCounts = new Map();
    filteredEntries.forEach((entry) => {
      termCounts.set(entry.key_term, (termCounts.get(entry.key_term) ?? 0) + 1);
    });
    const selectedTerms = [...termCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, state.topTerms)
      .map(([term]) => term);
    const selectedSet = new Set(selectedTerms);

    const edgeMap = new Map();
    filteredEntries.forEach((entry) => {
      if (!selectedSet.has(entry.key_term)) {
        return;
      }
      const key = `${entry.key_term}\u0000${entry.target_key_term}`;
      const edge = edgeMap.get(key) ?? {
        source: entry.key_term,
        target: entry.target_key_term,
        weight: 0,
      };
      edge.weight += 1;
      edgeMap.set(key, edge);
    });
    const candidateEdges = [...edgeMap.values()]
      .filter((edge) => edge.weight >= state.minWeight)
      .sort((a, b) => b.weight - a.weight);
    const targetWeights = new Map();
    candidateEdges.forEach((edge) => {
      targetWeights.set(
        edge.target,
        (targetWeights.get(edge.target) ?? 0) + edge.weight,
      );
    });
    const maxTargets = Math.min(30, Math.max(16, state.topTerms + 8));
    const visibleTargets = new Set(
      [...targetWeights.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, maxTargets)
        .map(([target]) => target),
    );
    const edges = candidateEdges.filter((edge) => visibleTargets.has(edge.target));

    if (!edges.length) {
      stage.innerHTML = `<div class="chart-empty">${escapeHtml(t("noResults"))}</div>`;
      return;
    }

    const terms = [...new Set(edges.map((edge) => edge.source))]
      .sort((a, b) => (termCounts.get(b) - termCounts.get(a)) || a.localeCompare(b));
    const targets = [...new Set(edges.map((edge) => edge.target))]
      .sort((a, b) => a.localeCompare(b));
    const width = 980;
    const top = 30;
    const bottom = 34;
    const height = Math.min(820, Math.max(480, Math.max(terms.length, targets.length) * 26 + 70));
    const svg = createSvg("svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": t("networkTitle"),
    });

    addSvgText(svg, "ENGLISH NOMINAL", {
      x: 168,
      y: 18,
      class: "chart-label",
      "text-anchor": "end",
    });
    addSvgText(svg, "CHINESE VERB", {
      x: 812,
      y: 18,
      class: "chart-label",
      "text-anchor": "start",
    });

    const termY = new Map();
    terms.forEach((term, index) => {
      termY.set(term, top + ((height - top - bottom) * (index + 1)) / (terms.length + 1));
    });
    const targetScores = new Map();
    edges.forEach((edge) => {
      const score = targetScores.get(edge.target) ?? { total: 0, weight: 0 };
      score.total += termY.get(edge.source) * edge.weight;
      score.weight += edge.weight;
      targetScores.set(edge.target, score);
    });
    const targetOrder = [...targets].sort((a, b) => {
      const scoreA = targetScores.get(a);
      const scoreB = targetScores.get(b);
      return scoreA.total / scoreA.weight - scoreB.total / scoreB.weight;
    });
    const targetPosition = new Map();
    targetOrder.forEach((target, index) => {
      targetPosition.set(target, top + ((height - top - bottom) * (index + 1)) / (targets.length + 1));
    });

    const edgeGroup = createSvg("g");
    edges.forEach((edge) => {
      const line = createSvg("line", {
        x1: 187,
        y1: termY.get(edge.source),
        x2: 793,
        y2: targetPosition.get(edge.target),
        class: "network-link",
        "stroke-width": Math.min(6, 1 + Math.sqrt(edge.weight)),
      });
      line.appendChild(createSvg("title")).textContent =
        `${edge.source} → ${edge.target}: ${edge.weight}`;
      edgeGroup.appendChild(line);
    });
    svg.appendChild(edgeGroup);

    const makeNode = (side, label, x, y, count) => {
      const group = createSvg("g", {
        class: `node ${side}`,
        transform: `translate(${x} ${y})`,
        tabindex: "0",
        role: "button",
        "aria-label": t("searchTermAria", { term: label }),
      });
      const radius = 5 + Math.min(7, Math.sqrt(count));
      group.appendChild(createSvg("circle", { r: radius }));
      group.appendChild(createSvg("title")).textContent = `${label} (${count})`;
      addSvgText(group, label, {
        x: side === "english" ? -12 : 12,
        y: 4,
        "text-anchor": side === "english" ? "end" : "start",
      });
      const activate = () => selectTerm(label);
      group.addEventListener("click", activate);
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
      svg.appendChild(group);
    };

    const termCount = new Map();
    const targetCount = new Map();
    edges.forEach((edge) => {
      termCount.set(edge.source, (termCount.get(edge.source) ?? 0) + edge.weight);
      targetCount.set(edge.target, (targetCount.get(edge.target) ?? 0) + edge.weight);
    });
    terms.forEach((term) => makeNode("english", term, 180, termY.get(term), termCount.get(term) ?? 1));
    targets.forEach((target) =>
      makeNode("chinese", target, 800, targetPosition.get(target), targetCount.get(target) ?? 1),
    );

    stage.appendChild(svg);
  }

  function renderScatter() {
    const stage = $("#scatterChart");
    stage.replaceChildren();
    const legend = $("#scatterLegend");
    legend.replaceChildren();

    categoryOrder.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "legend-button";
      const swatch = document.createElement("span");
      swatch.className = "legend-swatch";
      swatch.style.background = categoryColors[category];
      button.append(swatch, document.createTextNode(window.NVSite.categoryLabel(category)));
      button.addEventListener("click", () => {
        state.category = state.category === category ? "" : category;
        state.page = 1;
        updateFormFromState();
        updateView();
      });
      legend.appendChild(button);
    });

    if (!filteredEntries.length) {
      stage.innerHTML = `<div class="chart-empty">${escapeHtml(t("noResults"))}</div>`;
      return;
    }

    const width = 650;
    const height = 340;
    const margin = { top: 20, right: 18, bottom: 48, left: 52 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const maxX = Math.max(40, ...filteredEntries.map((entry) => entry.source_text.length));
    const maxY = Math.max(40, ...filteredEntries.map((entry) => entry.target_text.length));
    const svg = createSvg("svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": t("scatterTitle"),
    });

    for (let i = 0; i <= 4; i += 1) {
      const x = margin.left + (innerWidth * i) / 4;
      const y = margin.top + (innerHeight * i) / 4;
      svg.appendChild(createSvg("line", {
        x1: x,
        y1: margin.top,
        x2: x,
        y2: height - margin.bottom,
        class: "chart-axis",
        opacity: "0.35",
      }));
      svg.appendChild(createSvg("line", {
        x1: margin.left,
        y1: y,
        x2: width - margin.right,
        y2: y,
        class: "chart-axis",
        opacity: "0.35",
      }));
      addSvgText(svg, String(Math.round((maxX * i) / 4)), {
        x,
        y: height - margin.bottom + 17,
        class: "chart-tick",
        "text-anchor": "middle",
      });
      addSvgText(svg, String(Math.round((maxY * (4 - i)) / 4)), {
        x: margin.left - 9,
        y: y + 4,
        class: "chart-tick",
        "text-anchor": "end",
      });
    }
    addSvgText(svg, t("scatterX"), {
      x: margin.left + innerWidth / 2,
      y: height - 8,
      class: "chart-label",
      "text-anchor": "middle",
    });
    addSvgText(svg, t("scatterY"), {
      x: 14,
      y: margin.top + innerHeight / 2,
      class: "chart-label",
      "text-anchor": "middle",
      transform: `rotate(-90 14 ${margin.top + innerHeight / 2})`,
    });

    filteredEntries.forEach((entry, index) => {
      const x = margin.left + (entry.source_text.length / maxX) * innerWidth;
      const y = margin.top + innerHeight - (entry.target_text.length / maxY) * innerHeight;
      const point = createSvg("circle", {
        cx: x,
        cy: y,
        r: "4.2",
        fill: categoryColors[entry.category],
        class: "scatter-point",
        tabindex: "0",
        role: "button",
        "aria-label": `${entry.key_term} → ${entry.target_key_term}`,
      });
      point.appendChild(createSvg("title")).textContent =
        `${entry.key_term} → ${entry.target_key_term}\n${entry.source_text.length} / ${entry.target_text.length}`;
      const activate = () => selectTerm(entry.key_term);
      point.addEventListener("click", activate);
      point.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
      point.style.animationDelay = `${Math.min(index, 20) * 12}ms`;
      svg.appendChild(point);
    });
    stage.appendChild(svg);
  }

  function snippetWithMark(text, term, maxLength = 155) {
    const lower = text.toLocaleLowerCase();
    const needle = term.toLocaleLowerCase();
    const index = lower.indexOf(needle);
    let start = 0;
    if (index >= 0) {
      start = Math.max(0, index - Math.floor((maxLength - needle.length) / 2));
    }
    let end = Math.min(text.length, start + maxLength);
    if (start > 0) {
      const nextSpace = text.indexOf(" ", start);
      start = nextSpace >= 0 ? nextSpace + 1 : start;
    }
    if (end < text.length) {
      const previousSpace = text.lastIndexOf(" ", end);
      end = previousSpace > start ? previousSpace : end;
    }
    const before = (start > 0 ? "…" : "") + text.slice(start, index >= 0 ? index : end);
    const match = index >= 0 ? text.slice(index, index + term.length) : "";
    const after = index >= 0 ? text.slice(index + term.length, end) : "";
    const tail = end < text.length ? "…" : "";
    return { before, match, after: after + tail };
  }

  function renderKwic() {
    const list = $("#kwicList");
    list.replaceChildren();
    if (!filteredEntries.length) {
      list.innerHTML = `<div class="chart-empty">${escapeHtml(t("noResults"))}</div>`;
      return;
    }

    const groups = new Map();
    filteredEntries.forEach((entry) => {
      const group = groups.get(entry.key_term) ?? [];
      group.push(entry);
      groups.set(entry.key_term, group);
    });
    const ranked = [...groups.entries()]
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
      .slice(0, 12);

    ranked.forEach(([term, entries]) => {
      const entry = entries[0];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "kwic-item";
      button.setAttribute("aria-label", t("searchTermAria", { term }));

      const copy = document.createElement("span");
      const context = document.createElement("span");
      context.className = "kwic-context";
      const snippet = snippetWithMark(entry.source_text, term);
      context.append(document.createTextNode(snippet.before));
      const mark = document.createElement("mark");
      mark.textContent = snippet.match || term;
      context.appendChild(mark);
      context.append(document.createTextNode(snippet.after));
      const pairText = document.createElement("span");
      pairText.className = "kwic-pair";
      pairText.textContent = `${term} → ${entry.target_key_term}`;
      copy.append(context, pairText);

      const count = document.createElement("span");
      count.className = "kwic-count";
      count.textContent = entries.length;
      button.append(copy, count);
      button.addEventListener("click", () => selectTerm(term));
      list.appendChild(button);
    });
  }

  function renderHeatmap() {
    const stage = $("#heatmapChart");
    stage.replaceChildren();
    const counts = new Map();
    categoryOrder.forEach((category) => {
      suffixes.forEach((suffix) => counts.set(`${category}\u0000${suffix.key}`, 0));
    });
    filteredEntries.forEach((entry) => {
      const key = `${entry.category}\u0000${nominalSuffix(entry.key_term)}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const max = Math.max(1, ...counts.values());
    const grid = document.createElement("div");
    grid.className = "heatmap-grid";
    grid.style.gridTemplateColumns = `minmax(160px, 1.4fr) repeat(${suffixes.length}, minmax(48px, 1fr))`;

    const corner = document.createElement("div");
    corner.className = "heatmap-label column";
    corner.textContent = `← ${t("category")} / ${t("suffixLabel")} →`;
    grid.appendChild(corner);
    suffixes.forEach((suffix) => {
      const label = document.createElement("div");
      label.className = "heatmap-label column";
      label.textContent = suffix.label;
      grid.appendChild(label);
    });

    categoryOrder.forEach((category) => {
      const label = document.createElement("div");
      label.className = "heatmap-label";
      label.textContent = window.NVSite.categoryLabel(category);
      grid.appendChild(label);
      suffixes.forEach((suffix) => {
        const count = counts.get(`${category}\u0000${suffix.key}`) ?? 0;
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "heatmap-cell";
        const intensity = count === 0 ? 0.04 : 0.1 + (count / max) * 0.72;
        cell.style.background = `rgba(36, 107, 82, ${intensity})`;
        cell.style.color = intensity > 0.42 ? "white" : "var(--ink)";
        cell.textContent = String(count);
        cell.title = `${window.NVSite.categoryLabel(category)} · ${suffix.label}: ${count}`;
        cell.addEventListener("click", () => {
          state.category = state.category === category ? "" : category;
          state.suffix = state.suffix === suffix.key ? "" : suffix.key;
          state.page = 1;
          updateFormFromState();
          updateView();
        });
        grid.appendChild(cell);
      });
    });
    stage.appendChild(grid);
  }

  function sortRows(rows) {
    const direction = state.sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = String(a[state.sortKey] ?? "");
      const right = String(b[state.sortKey] ?? "");
      if (state.sortKey === "sample_rank") {
        return (Number(left) - Number(right)) * direction;
      }
      return left.localeCompare(right, undefined, { numeric: true }) * direction;
    });
  }

  function renderTable() {
    const body = $("#corpusRows");
    body.replaceChildren();
    const sorted = sortRows(filteredEntries);
    const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * pageSize;
    const pageRows = sorted.slice(start, start + pageSize);

    if (!pageRows.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 7;
      cell.className = "chart-empty";
      cell.textContent = t("noResults");
      row.appendChild(cell);
      body.appendChild(row);
    }

    pageRows.forEach((entry) => {
      const row = document.createElement("tr");

      const id = document.createElement("td");
      id.className = "id-cell";
      id.dataset.label = t("id");
      id.textContent = entry.id;
      row.appendChild(id);

      [
        [entry.source_text, t("sourceText")],
        [entry.target_text, t("targetText")],
      ].forEach(([value, label]) => {
        const cell = document.createElement("td");
        cell.dataset.label = label;
        cell.textContent = value;
        row.appendChild(cell);
      });

      const termCell = document.createElement("td");
      termCell.dataset.label = t("term");
      const termButton = document.createElement("button");
      termButton.type = "button";
      termButton.className = "term-button";
      termButton.textContent = entry.key_term;
      termButton.addEventListener("click", () => selectTerm(entry.key_term));
      termCell.appendChild(termButton);
      row.appendChild(termCell);

      const targetTermCell = document.createElement("td");
      targetTermCell.dataset.label = t("targetTerm");
      const targetTermButton = document.createElement("button");
      targetTermButton.type = "button";
      targetTermButton.className = "term-button";
      targetTermButton.textContent = entry.target_key_term;
      targetTermButton.addEventListener("click", () => selectTerm(entry.target_key_term));
      targetTermCell.appendChild(targetTermButton);
      row.appendChild(targetTermCell);

      const categoryCell = document.createElement("td");
      categoryCell.dataset.label = t("category");
      const tag = document.createElement("span");
      tag.className = `tag ${categoryClasses[entry.category] ?? ""}`.trim();
      tag.textContent = window.NVSite.categoryLabel(entry.category);
      categoryCell.appendChild(tag);
      row.appendChild(categoryCell);

      const checked = document.createElement("td");
      checked.dataset.label = t("checked");
      checked.textContent = t(entry.human_checked === "yes" ? "yes" : "no");
      row.appendChild(checked);
      body.appendChild(row);
    });

    $("#tableStatus").textContent = `${filteredEntries.length} / ${allEntries.length}`;
    $("#pageStatus").textContent = t("pageOf", { page: state.page, pages });
    $("#previousPage").disabled = state.page <= 1;
    $("#nextPage").disabled = state.page >= pages;
  }

  function updateView() {
    applyFilters();
    renderSummary();
    renderNetwork();
    renderScatter();
    renderKwic();
    renderHeatmap();
    renderTable();
    syncUrl();
  }

  function selectTerm(term) {
    state.term = term;
    state.q = term;
    state.page = 1;
    $("#searchInput").value = term;
    updateView();
    document.querySelector("#explorer").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function exportFilteredCsv() {
    const fields = [
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
    ];
    const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const content = [
      fields.map(escapeCell).join(","),
      ...sortRows(filteredEntries).map((entry) =>
        fields.map((field) => escapeCell(entry[field])).join(","),
      ),
    ].join("\n");
    const blob = new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `nvatlas-filtered-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function wireEvents() {
    let searchTimer;
    $("#searchInput").addEventListener("input", (event) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.q = event.target.value;
        state.term = "";
        state.page = 1;
        updateView();
      }, 140);
    });
    $("#searchForm").addEventListener("submit", (event) => {
      event.preventDefault();
      state.q = $("#searchInput").value;
      state.term = "";
      state.page = 1;
      updateView();
    });
    $("#categoryFilter").addEventListener("change", (event) => {
      state.category = event.target.value;
      state.page = 1;
      updateView();
    });
    $("#checkedFilter").addEventListener("change", (event) => {
      state.checked = event.target.value;
      state.page = 1;
      updateView();
    });
    $("#resetFilters").addEventListener("click", () => {
      state.q = "";
      state.category = "";
      state.checked = "";
      state.suffix = "";
      state.term = "";
      state.page = 1;
      updateFormFromState();
      updateView();
    });
    $("#topTermsRange").addEventListener("input", (event) => {
      state.topTerms = Number(event.target.value);
      $("#topTermsValue").value = state.topTerms;
      renderNetwork();
      syncUrl();
    });
    $("#minWeightRange").addEventListener("input", (event) => {
      state.minWeight = Number(event.target.value);
      $("#minWeightValue").value = state.minWeight;
      renderNetwork();
      syncUrl();
    });
    $("#resetChartControls").addEventListener("click", () => {
      state.topTerms = 18;
      state.minWeight = 1;
      updateFormFromState();
      renderNetwork();
      syncUrl();
    });
    document.querySelectorAll("[data-sort]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.sort;
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDir = "asc";
        }
        state.page = 1;
        renderTable();
        syncUrl();
      });
    });
    $("#previousPage").addEventListener("click", () => {
      state.page = Math.max(1, state.page - 1);
      renderTable();
      syncUrl();
    });
    $("#nextPage").addEventListener("click", () => {
      state.page += 1;
      renderTable();
      syncUrl();
      document.querySelector(".data-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    $("#exportCsv").addEventListener("click", exportFilteredCsv);
    window.NVSite.onLanguageChange(() => {
      updateFormFromState();
      updateView();
    });
  }

  async function init() {
    readUrlState();
    updateFormFromState();
    wireEvents();
    try {
      const response = await fetch("data/corpus.json");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      allEntries = payload.entries;
      metadata = payload.metadata;
      $("#heroEntries").textContent = metadata.sample_size;
      $("#heroTerms").textContent = metadata.unique_terms;
      $("#heroVerbs").textContent = metadata.unique_verb_renditions;
      $("#heroChecked").textContent = metadata.checked_size;
      updateView();
    } catch (error) {
      console.error(error);
      ["networkChart", "scatterChart", "kwicList", "heatmapChart"].forEach((id) => {
        document.getElementById(id).innerHTML =
          `<div class="chart-empty">${escapeHtml(t("loadedError"))}</div>`;
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
