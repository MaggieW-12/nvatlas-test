(() => {
  const translations = {
    en: {
      brandSubtitle: "Translation corpus lab",
      navExplorer: "Explorer",
      navReport: "Learning report",
      navCodebook: "Codebook",
      navAi: "AI use",
      menu: "Menu",
      contentWarningLabel: "Content note",
      contentWarning:
        "Subtitle excerpts may contain profanity, violence, or other sensitive themes.",
      footerTitle: "Noun → Verb Atlas",
      footerText:
        "A course project for TRAN3620 Translation Technology in the Age of AI. Corpus source: NV Atlas / OpenSubtitles v2024.",
      footerSource: "Source & method",
      footerReport: "Report",
      footerDeclaration: "AI declaration",
      eyebrow: "TRAN3620 corpus explorer",
      heroTitle: "From nouns",
      heroTitleAccent: "to actions.",
      heroLede:
        "What happens when an English nominal becomes a verb in Chinese subtitle translation? Search the corpus, follow term-to-verb links, and test a semantic codebook against 500 traceable sentence pairs.",
      exploreButton: "Explore the corpus",
      reportButton: "Read the learning report",
      cardEntries: "Sentence pairs",
      cardTerms: "Nominals",
      cardVerbs: "Verb renderings",
      cardChecked: "Source-checked",
      searchEyebrow: "Linked exploration",
      searchTitle: "Search, filter, compare",
      searchDescription:
        "Every chart and the data grid use the same filtered view. The current search is saved in the URL so it can be shared.",
      searchLabel: "Keyword",
      searchPlaceholder: "Try attention, 注意, or 允许",
      categoryLabel: "Semantic category",
      reviewedLabel: "Source check",
      allCategories: "All categories",
      allChecks: "All entries",
      checkedOnly: "Checked only",
      uncheckedOnly: "Not yet checked",
      applySearch: "Update view",
      resetSearch: "Reset filters",
      searchSummary: "Showing {shown} of {total} entries",
      activeTerm: "Selected term: {term}",
      noResults: "No entries match this view.",
      networkTitle: "Nominal–verb network",
      networkCaption:
        "Which English nominals connect to which Chinese verbs, and where do the strongest repeated links occur?",
      networkTag: "Relational",
      topTerms: "Top terms",
      minWeight: "Minimum link weight",
      resetControls: "Reset controls",
      networkHelp:
        "Click either side of a link to search that term. Drag the horizontal scroll area on smaller screens.",
      scatterTitle: "Length and semantic field",
      scatterCaption:
        "How do source and target lengths vary across the four semantic categories?",
      scatterTag: "Distributional",
      scatterX: "English characters",
      scatterY: "Chinese characters",
      kwicTitle: "Bilingual KWIC",
      kwicCaption:
        "Which sentence contexts support the nominal-to-verbal interpretation?",
      kwicTag: "Lexical",
      heatmapTitle: "Suffix by category",
      heatmapCaption:
        "Which English nominal endings cluster within each semantic field?",
      heatmapTag: "Distributional",
      heatmapInstruction:
        "Click a cell to combine its suffix and category with the current filters.",
      suffixLabel: "Suffix",
      tableTitle: "Corpus data grid",
      tableCaption:
        "Sort, inspect, and export the exact filtered records used by the visualizations.",
      tableTag: "Tabular",
      exportCsv: "Export filtered CSV",
      id: "ID",
      sourceText: "English source",
      targetText: "Chinese target",
      term: "Key term",
      targetTerm: "Chinese verb",
      category: "Category",
      checked: "Checked",
      previous: "Previous",
      next: "Next",
      pageOf: "Page {page} of {pages}",
      yes: "Yes",
      no: "No",
      loadedError:
        "The corpus could not be loaded. Serve this folder through a local web server rather than opening the HTML file directly.",
      categoryCommunication: "Communication & representation",
      categoryCognition: "Cognition & emotion",
      categoryInstitutions: "Institutions & rules",
      categoryEveryday: "Everyday action & state",
      searchTermAria: "Search for {term}",
      languageEnglish: "English",
      languageChinese: "Traditional Chinese",
      openMenu: "Open navigation",
    },
    zh: {
      brandSubtitle: "翻譯語料實驗室",
      navExplorer: "語料探索",
      navReport: "學習報告",
      navCodebook: "分類碼本",
      navAi: "AI 使用",
      menu: "選單",
      contentWarningLabel: "內容提示",
      contentWarning:
        "字幕摘錄可能包含粗俗語言、暴力或其他敏感主題。",
      footerTitle: "名詞 → 動詞圖譜",
      footerText:
        "人工智能時代的翻譯科技（TRAN3620）課程專案。語料來源：NV Atlas／OpenSubtitles 2024。",
      footerSource: "來源與方法",
      footerReport: "學習報告",
      footerDeclaration: "AI 使用聲明",
      eyebrow: "TRAN3620 語料探索器",
      heroTitle: "從名詞",
      heroTitleAccent: "走向動詞。",
      heroLede:
        "英語名詞在字幕翻譯中化成中文動詞時，會發生甚麼？探索 500 組可追溯的句對，沿着詞語到動詞的連線搜尋，並以語意分類碼本檢驗翻譯規律。",
      exploreButton: "探索語料",
      reportButton: "閱讀學習報告",
      cardEntries: "句對",
      cardTerms: "英語名詞",
      cardVerbs: "中文動詞譯法",
      cardChecked: "已核對來源",
      searchEyebrow: "連動探索",
      searchTitle: "搜尋、篩選、比較",
      searchDescription:
        "所有圖表和資料表共用同一組篩選結果。目前的搜尋狀態會保存在網址中，方便分享。",
      searchLabel: "關鍵字",
      searchPlaceholder: "例如 attention、注意或允許",
      categoryLabel: "語意類別",
      reviewedLabel: "來源核對",
      allCategories: "所有類別",
      allChecks: "所有條目",
      checkedOnly: "僅顯示已核對",
      uncheckedOnly: "僅顯示未核對",
      applySearch: "更新畫面",
      resetSearch: "重設篩選",
      searchSummary: "顯示 {shown}／{total} 條資料",
      activeTerm: "已選詞語：{term}",
      noResults: "目前沒有符合條件的資料。",
      networkTitle: "名詞—動詞網絡",
      networkCaption:
        "哪些英語名詞連向哪些中文動詞？重複出現的強連線集中在哪裏？",
      networkTag: "關係型",
      topTerms: "熱門詞語",
      minWeight: "最低連線次數",
      resetControls: "重設控制項",
      networkHelp:
        "點擊連線兩端的詞語即可搜尋。小螢幕可橫向捲動查看完整圖形。",
      scatterTitle: "長度與語意場",
      scatterCaption:
        "四個語意類別在原文與譯文句長上有甚麼差異？",
      scatterTag: "分佈型",
      scatterX: "英語字元數",
      scatterY: "中文字元數",
      kwicTitle: "雙語關鍵詞語境",
      kwicCaption:
        "哪些句子語境支持「英語名詞轉為中文動詞」的判斷？",
      kwicTag: "詞彙型",
      heatmapTitle: "字尾與類別",
      heatmapCaption:
        "各類語意場中，英語名詞字尾呈現甚麼分佈？",
      heatmapTag: "分佈型",
      heatmapInstruction:
        "點擊方格，可把該字尾與類別加入現有篩選。",
      suffixLabel: "字尾",
      tableTitle: "語料資料表",
      tableCaption:
        "排序、查閱並匯出圖表正在使用的同一批篩選資料。",
      tableTag: "表格式",
      exportCsv: "匯出已篩選 CSV",
      id: "編號",
      sourceText: "英語原文",
      targetText: "中文譯文",
      term: "關鍵名詞",
      targetTerm: "中文動詞",
      category: "類別",
      checked: "核對",
      previous: "上一頁",
      next: "下一頁",
      pageOf: "第 {page}／{pages} 頁",
      yes: "是",
      no: "否",
      loadedError:
        "無法載入語料。請透過本地網站伺服器開啟本資料夾，不要直接開啟 HTML 檔案。",
      categoryCommunication: "溝通與再現",
      categoryCognition: "認知與情感",
      categoryInstitutions: "制度與規則",
      categoryEveryday: "日常行動與狀態",
      searchTermAria: "搜尋 {term}",
      languageEnglish: "英文",
      languageChinese: "繁體中文",
      openMenu: "開啟導覽",
    },
  };

  const categoryKeys = {
    "Communication & representation": "categoryCommunication",
    "Cognition & emotion": "categoryCognition",
    "Institutions & rules": "categoryInstitutions",
    "Everyday action & state": "categoryEveryday",
  };

  function initialLanguage() {
    const value = localStorage.getItem("nvatlas-language");
    return value === "zh" ? "zh" : "en";
  }

  let currentLanguage = initialLanguage();
  const listeners = new Set();

  function t(key, values = {}) {
    let text = translations[currentLanguage][key] ?? translations.en[key] ?? key;
    for (const [name, value] of Object.entries(values)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  }

  function applyLanguage(language) {
    currentLanguage = language === "zh" ? "zh" : "en";
    localStorage.setItem("nvatlas-language", currentLanguage);
    document.documentElement.lang = currentLanguage === "zh" ? "zh-Hant" : "en";

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (key && translations[currentLanguage][key] !== undefined) {
        element.textContent = t(key);
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });

    document.querySelectorAll("[data-i18n-option]").forEach((element) => {
      element.textContent = t(element.dataset.i18nOption);
    });

    document.querySelectorAll("[data-lang]").forEach((button) => {
      const isActive = button.dataset.lang === currentLanguage;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    document.querySelectorAll("[data-page-lang]").forEach((section) => {
      section.hidden = section.dataset.pageLang !== currentLanguage;
    });

    listeners.forEach((listener) => listener(currentLanguage));
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyLanguage(currentLanguage);

    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => applyLanguage(button.dataset.lang));
    });

    const menuButton = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");
    if (menuButton && nav) {
      menuButton.setAttribute("aria-label", t("openMenu"));
      menuButton.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
      });
    }
  });

  window.NVSite = {
    get language() {
      return currentLanguage;
    },
    t,
    setLanguage(language) {
      applyLanguage(language);
    },
    onLanguageChange(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    categoryLabel(category) {
      return t(categoryKeys[category] ?? "categoryEveryday");
    },
  };
})();
