/* ========================================================================
   Admin Student List — full working build (no redeclarations)
   - Safe API URL builder
   - Error banner visible on page
   - Name A–Z + inline name search
   - Multi-select dropdowns render IN FRONT of the table
   - Upload uses ?overwrite=1 for easy testing
   - Resize handle, header search, inbox dropdown (kept)
   ======================================================================== */

"use strict";

/* ---------------- API base + helpers (global) ---------------- */
const API_BASE = (window.__API_BASE__ || "http://localhost:4000").replace(
  /\/+$/,
  ""
);
function joinApi(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
function apiFetch(path, opts) {
  return fetch(joinApi(path), opts);
}
function apiUrl(path) {
  return joinApi(path);
}

/* ---------------- Error banner (global) ---------------- */
function showErrorBanner(msg) {
  let bar = document.getElementById("studlistError");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "studlistError";
    bar.style.position = "fixed";
    bar.style.bottom = "calc(var(--bottom-nav-h) + 14px + 60px)"; // Above toast
    bar.style.left = "18px";
    bar.style.right = "18px";
    bar.style.zIndex = "5000";
    bar.style.padding = "10px 14px";
    bar.style.borderRadius = "10px";
    bar.style.background = "#991b1b";
    bar.style.color = "#fff";
    bar.style.fontWeight = "700";
    bar.style.display = "none";
    bar.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.25)";
    document.body.appendChild(bar);
  }
  bar.textContent = msg || "";
  bar.style.display = msg ? "block" : "none";
  if (msg) {
    clearTimeout(bar._t);
    bar._t = setTimeout(() => {
      bar.style.display = "none";
    }, 5000); // Auto-hide after 5 seconds
  }
}

/* ---------------- Mobile-only header ⇄ sidebar drawer ---------------- */
(function initMobileSidebarOnly() {
  document.addEventListener("DOMContentLoaded", function () {
    const $ = (s, r = document) => r.querySelector(s);
    const on = (el, ev, cb) => el && el.addEventListener(ev, cb);
    const mq = window.matchMedia("(max-width: 768px)");
    const hdrToggle = $("#toggleBtnHeader") || $('[data-toggle="sidebar"]');

    function setHeaderOffset() {
      const header = $("header");
      const topBar = $(".top-bar");
      const h = header ? Math.round(header.getBoundingClientRect().height) : 64;
      const t = topBar ? Math.round(topBar.getBoundingClientRect().height) : 6;
      document.documentElement.style.setProperty(
        "--header-offset",
        h + t + "px"
      );
    }
    setHeaderOffset();
    on(window, "resize", setHeaderOffset);

    let overlay = $(".sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }

    if (hdrToggle && !hdrToggle.dataset.mobileBound) {
      hdrToggle.dataset.mobileBound = "1";
      on(hdrToggle, "click", (e) => {
        if (!mq.matches) return;
        e.preventDefault();
        setHeaderOffset();
        document.body.classList.toggle("sidebar-open");
        hdrToggle.setAttribute(
          "aria-expanded",
          document.body.classList.contains("sidebar-open") ? "true" : "false"
        );
      });
    }
    on(overlay, "click", () => document.body.classList.remove("sidebar-open"));
    on(document, "keydown", (e) => {
      if (e.key === "Escape") document.body.classList.remove("sidebar-open");
    });
    document.querySelectorAll(".sidebar-nav a").forEach((a) => {
      on(a, "click", () => {
        if (mq.matches) document.body.classList.remove("sidebar-open");
      });
    });
    mq.addEventListener?.("change", (evt) => {
      if (!evt.matches) document.body.classList.remove("sidebar-open");
    });
  });
})();

/* ---------------- Main app ---------------- */
document.addEventListener("DOMContentLoaded", function () {
  console.log("[studlist] JS loaded. API_BASE =", API_BASE);

  /* ---------- Sidebar collapse & active nav ---------- */
  (function setupSidebarAndNav() {
    const sidebar = document.getElementById("sidebar");
    const hdrToggle = document.getElementById("toggleBtnHeader");
    const bottomNav = document.getElementById("bottomNav");

    hdrToggle?.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 768px)").matches) return;
      sidebar?.classList.toggle("collapsed");
      bottomNav?.classList.toggle("collapsed");
    });

    const currentPage = location.pathname.split("/").pop().replace(".php", "");
    document.querySelectorAll(".sidebar-nav .nav-item").forEach((item) => {
      const link = item.querySelector("a");
      if (!link) return;
      const href = link
        .getAttribute("href")
        .split("/")
        .pop()
        .replace(".php", "");
      item.classList.toggle("active", href === currentPage);
    });
  })();

  /* ---------- Header Search (Admin) ---------- */
  (function initAdminSearchUI() {
    const input = document.getElementById("globalSearch");
    if (!input) return;

    const links = Array.from(
      document.querySelectorAll(".sidebar-nav .nav-item a")
    ).filter((a) => {
      const txt = (a.textContent || "").toLowerCase();
      const href = (a.getAttribute("href") || "").toLowerCase();
      const page = (a.dataset.page || "").toLowerCase();
      const signout =
        txt.includes("sign out") ||
        txt.includes("logout") ||
        page === "signout" ||
        page === "logout" ||
        /sign-?out|log-?out/.test(href);
      return !signout && a.getAttribute("data-search") !== "exclude";
    });
    if (!links.length) return;

    try {
      input.removeAttribute("list");
    } catch {}
    input.setAttribute("autocomplete", "off");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");

    const ITEMS = Array.from(
      new Map(
        links.map((a) => {
          const label =
            a.querySelector("span")?.textContent?.trim() ||
            a.dataset.page ||
            a.href;
          const iconEl = a.querySelector("i");
          return [
            `${label}|${a.getAttribute("href")}`,
            {
              label,
              href: a.getAttribute("href"),
              key: (a.dataset.page || label).toLowerCase(),
              icon: iconEl
                ? Array.from(iconEl.classList).join(" ")
                : "fa-solid fa-square",
            },
          ];
        })
      ).values()
    );

    const host = input.closest(".header-search") || input.parentElement;
    let dropdown = host.querySelector(".search-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-dropdown";
      dropdown.innerHTML = `<ul class="search-list" role="listbox" id="adminSearchList"></ul>`;
      host.appendChild(dropdown);
    }
    const listEl = dropdown.querySelector(".search-list");

    let open = false;
    let filtered = ITEMS.slice();
    let activeIndex = -1;

    function render() {
      listEl.innerHTML = filtered.length
        ? filtered
            .map(
              (m, i) =>
                `<li>
                  <button type="button"
                          class="search-item${
                            i === activeIndex ? " active" : ""
                          }"
                          data-href="${m.href}" data-index="${i}">
                    <i class="${m.icon}"></i><span>${m.label}</span><kbd>↵</kbd>
                  </button>
                </li>`
            )
            .join("")
        : `<li class="search-empty">No matches</li>`;
    }
    function openDd() {
      if (open) return;
      dropdown.classList.add("open");
      input.setAttribute("aria-expanded", "true");
      open = true;
    }
    function closeDd() {
      if (!open) return;
      dropdown.classList.remove("open");
      input.setAttribute("aria-expanded", "false");
      open = false;
      activeIndex = -1;
    }
    function apply(q) {
      const s = (q || "").trim().toLowerCase();
      filtered = s
        ? ITEMS.filter(
            (m) => m.label.toLowerCase().includes(s) || m.key?.includes(s)
          )
        : ITEMS.slice();
      activeIndex = filtered.length ? 0 : -1;
      render();
    }
    function go(i) {
      const m = filtered[i];
      if (m?.href) location.href = m.href;
    }

    input.addEventListener("focus", () => {
      apply(input.value);
      openDd();
    });
    input.addEventListener("input", () => {
      apply(input.value);
      openDd();
    });
    input.addEventListener("keydown", (e) => {
      if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        openDd();
        apply(input.value);
      }
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (filtered.length) {
          activeIndex = (activeIndex + 1) % filtered.length;
          render();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (filtered.length) {
          activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
          render();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0) go(activeIndex);
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeDd();
      }
    });
    listEl.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest(".search-item");
      if (!btn) return;
      go(Number(btn.dataset.index));
    });
    document.addEventListener("pointerdown", (e) => {
      if (!host.contains(e.target)) closeDd();
    });
    input.addEventListener("blur", () => setTimeout(closeDd, 120));
    apply("");
  })();

  /* ---------- Filters & persistence ---------- */
  const STORAGE = {
    initial: "admin.studlist.initial",
    nameQ: "admin.studlist.nameq",
    dept: "admin.studlist.dept",
    year: "admin.studlist.year",
    sem: "admin.studlist.semester",
    stat: "admin.studlist.status",
  };

  // Name dropdown state
  let nameState = { initial: "ALL", q: "" };

  function initNameSelect(btnId, menuId, gridId, searchId) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    const grid = document.getElementById(gridId);
    const searchInput = document.getElementById(searchId);
    if (!btn || !menu || !grid || !searchInput) return null;

    // Always above the table (positioned fixed on body)

    const letters = Array.from(grid.querySelectorAll('.ns-letter'));
    const updateBtnText = () => {
      const initial = nameState.initial;
      const q = nameState.q.trim();
      if (q) {
        btn.textContent = `Search: ${q}`;
      } else if (initial === "ALL") {
        btn.textContent = "All Names";
      } else {
        btn.textContent = `Starts with ${initial}`;
      }
    };
    const setActiveLetter = (letter) => {
      letters.forEach(l => l.classList.toggle('active', l.dataset.letter === letter));
    };
    const restore = () => {
      try {
        const savedInitial = localStorage.getItem(STORAGE.initial) || "ALL";
        const savedQ = localStorage.getItem(STORAGE.nameQ) || "";
        nameState.initial = savedInitial;
        nameState.q = savedQ;
        setActiveLetter(savedInitial);
        searchInput.value = savedQ;
        updateBtnText();
      } catch {}
    };
    const save = () => {
      try {
        localStorage.setItem(STORAGE.initial, nameState.initial);
        localStorage.setItem(STORAGE.nameQ, nameState.q);
      } catch {}
    };

    function open() {
      // Append to body to escape stacking context
      document.body.appendChild(menu);
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      document.body.classList.add("dropdown-open");

      // Position relative to button
      const btnRect = btn.getBoundingClientRect();
      menu.style.position = "fixed";
      menu.style.left = `${btnRect.left}px`;
      menu.style.top = `${btnRect.bottom + 6}px`;
      menu.style.width = `${btnRect.width}px`;
      menu.style.minWidth = "auto"; // Override CSS min-width for consistency

      // Adjust for viewport overflow
      const menuRect = menu.getBoundingClientRect();
      if (menuRect.right > window.innerWidth - 8) {
        menu.style.left = `${window.innerWidth - menuRect.width - 8}px`;
      }
      if (menuRect.bottom > window.innerHeight - 8) {
        menu.style.top = `${window.innerHeight - menuRect.height - 8}px`;
      }

      document.addEventListener("pointerdown", onDocDown, { capture: true });
      document.addEventListener("keydown", onDocKey);
    }
    function close() {
      // Append back to original parent
      const parent = btn.closest('.filter-group');
      if (parent) parent.appendChild(menu);
      menu.style.position = "absolute"; // Reset to CSS default
      menu.style.left = "0";
      menu.style.top = "calc(100% + 6px)";
      menu.style.width = "";
      menu.style.minWidth = "";
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("dropdown-open");
      document.removeEventListener("pointerdown", onDocDown, { capture: true });
      document.removeEventListener("keydown", onDocKey);
    }
    function toggle() {
      menu.hidden ? open() : close();
    }
    function onDocDown(e) {
      if (btn.contains(e.target) || menu.contains(e.target)) return;
      close();
    }
    function onDocKey(e) {
      if (e.key === "Escape") close();
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggle();
    });
    letters.forEach(l => {
      l.addEventListener("click", () => {
        const letter = l.dataset.letter;
        nameState.initial = letter;
        nameState.q = ""; // Clear search when selecting letter
        searchInput.value = "";
        setActiveLetter(letter);
        updateBtnText();
        save();
        close();
        fetchStudents();
      });
    });
    searchInput.addEventListener("input", () => {
      nameState.q = searchInput.value;
      nameState.initial = "ALL"; // Reset initial when searching
      setActiveLetter("ALL");
      updateBtnText();
      save();
      fetchStudents();
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        close();
      }
    });

    const clearBtn = document.getElementById("nameSearchClear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        nameState.q = "";
        nameState.initial = "ALL";
        setActiveLetter("ALL");
        updateBtnText();
        save();
        fetchStudents();
      });
    }

    restore();
    return { updateBtnText, setActiveLetter, open, close };
  }

  const nsName = initNameSelect("nameBtn", "nameMenu", "nameGrid", "nameSearch");

  function initMultiSelect(
    btnId,
    menuId,
    { allLabel = "All", storageKey } = {}
  ) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    if (!btn || !menu) return null;

    // always above the table (positioned fixed on body)

    const checks = Array.from(menu.querySelectorAll('input[type="checkbox"]'));
    const actAll = menu.querySelector('[data-act="all"]');
    const actClear = menu.querySelector('[data-act="clear"]');

    const values = () => checks.filter((c) => c.checked).map((c) => c.value);
    const summarize = (arr) => {
      if (arr.length === checks.length) return allLabel;
      if (arr.length === 0) return "None";
      const s = arr.join(", ");
      return s.length > 22 ? arr.slice(0, 2).join(", ") + "…" : s;
    };
    const syncLabel = () => (btn.textContent = summarize(values()));

    function save() {
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(values()));
      } catch {}
    }
    function restore() {
      if (!storageKey) return syncLabel();
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return syncLabel();
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return syncLabel();
        const set = new Set(arr);
        checks.forEach((c) => (c.checked = set.has(c.value)));
      } catch {}
      syncLabel();
    }
    function setAll(v = true) {
      checks.forEach((c) => (c.checked = !!v));
      syncLabel();
      save();
      fetchStudents();
    }

    function open() {
      // Append to body to escape stacking context
      document.body.appendChild(menu);
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      document.body.classList.add("dropdown-open");

      // Position relative to button
      const btnRect = btn.getBoundingClientRect();
      menu.style.position = "fixed";
      menu.style.left = `${btnRect.left}px`;
      menu.style.top = `${btnRect.bottom + 6}px`;
      menu.style.width = `${btnRect.width}px`;
      menu.style.minWidth = "auto"; // Override CSS min-width for consistency

      // Adjust for viewport overflow
      const menuRect = menu.getBoundingClientRect();
      if (menuRect.right > window.innerWidth - 8) {
        menu.style.left = `${window.innerWidth - menuRect.width - 8}px`;
      }
      if (menuRect.bottom > window.innerHeight - 8) {
        menu.style.top = `${window.innerHeight - menuRect.height - 8}px`;
      }

      document.addEventListener("pointerdown", onDocDown, { capture: true });
      document.addEventListener("keydown", onDocKey);
    }
    function close() {
      // Append back to original parent
      const parent = btn.closest('.filter-group');
      if (parent) parent.appendChild(menu);
      menu.style.position = "absolute"; // Reset to CSS default
      menu.style.left = "0";
      menu.style.top = "calc(100% + 6px)";
      menu.style.width = "";
      menu.style.minWidth = "";
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("dropdown-open");
      document.removeEventListener("pointerdown", onDocDown, { capture: true });
      document.removeEventListener("keydown", onDocKey);
    }
    function toggle() {
      menu.hidden ? open() : close();
    }
    function onDocDown(e) {
      if (btn.contains(e.target) || menu.contains(e.target)) return;
      close();
    }
    function onDocKey(e) {
      if (e.key === "Escape") close();
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggle();
    });
    checks.forEach((c) =>
      c.addEventListener("change", () => {
        syncLabel();
        save();
        fetchStudents();
      })
    );
    actAll?.addEventListener("click", () => setAll(true));
    actClear?.addEventListener("click", () => setAll(false));

    restore();
    return { values, setAll, syncLabel, open, close };
  }

  const msDept = initMultiSelect("deptBtn", "deptMenu", {
    storageKey: STORAGE.dept,
  });
  const msYear = initMultiSelect("yearBtn", "yearMenu", {
    storageKey: STORAGE.year,
  });
  const msSem = initMultiSelect("semesterBtn", "semesterMenu", {
    storageKey: STORAGE.sem,
  });
  const msStat = initMultiSelect("statusBtn", "statusMenu", {
    storageKey: STORAGE.stat,
  });

  /* ---------- Elements ---------- */
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  const tbody = document.getElementById("studentTbody");
  const countEl = document.getElementById("studentCount");
  const updateRecordsBtn = document.getElementById("updateRecordsBtn");
  const exportBtn = document.getElementById("exportBtn");

  let isUploading = false;

  const card = document.querySelector(".curric-card");
  const tableScroll = document.querySelector(".table-scroll");
  const STORAGE_KEY = "admin.studlist.scroller.h";

  /* ---------- Data + table rendering ---------- */
  const state = { rows: [] };

  function areFiltersEmpty() {
    const nameEmpty = nameState.initial === "ALL" && nameState.q.trim() === "";
    const deptEmpty = msDept ? msDept.values().length === 0 : true;
    const yearEmpty = msYear ? msYear.values().length === 0 : true;
    const semEmpty = msSem ? msSem.values().length === 0 : true;
    const statEmpty = msStat ? msStat.values().length === 0 : true;
    return nameEmpty && deptEmpty && yearEmpty && semEmpty && statEmpty;
  }

  function buildQuery() {
    const qs = new URLSearchParams();

    const initialRaw = nameState.initial.toUpperCase();
    if (/^[A-Z]$/.test(initialRaw)) qs.set("initial", initialRaw);

    const q = nameState.q.trim();
    if (q) qs.set("q", q);

    const deptVals = msDept?.values() || [];
    if (deptVals.length < 5) deptVals.forEach((v) => qs.append("department", v));

    const yearVals = msYear?.values() || [];
    if (yearVals.length < 4) yearVals.forEach((v) => qs.append("year", v));

    const semVals = msSem?.values() || [];
    if (semVals.length < 2) semVals.forEach((v) => qs.append("semester", v));

    const statVals = msStat?.values() || [];
    if (statVals.length < 2) statVals.forEach((v) => {
      qs.append("status", String(v || "").toUpperCase());
    });

    qs.set("sort", "az");
    qs.set("page", "1");
    qs.set("pageSize", "10000");
    return qs;
  }

  function visibleRowBudget() {
    const scroll = document.querySelector(".table-scroll");
    const root = getComputedStyle(document.documentElement);
    const headH = parseFloat(root.getPropertyValue("--head-h")) || 44;
    const rowH = parseFloat(root.getPropertyValue("--row-h")) || 44;
    const maxH =
      parseFloat(getComputedStyle(scroll).getPropertyValue("max-height")) ||
      scroll.clientHeight ||
      400;
    const rows = Math.max(0, Math.floor((maxH - headH) / rowH));
    return rows || 12; // Allow growing beyond 10 rows
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

function renderRows(rows) {
  const frag = document.createDocumentFragment();

  if (rows.length) {
    rows.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(r.student_no)}</td>
        <td>${escapeHtml(r.name)}</td>
        <td style="text-align:center">${escapeHtml(r.level)}</td>
        <td style="text-align:center">${escapeHtml(r.semester)}</td>
        <td>${escapeHtml(r.program)}</td>
        <td>${escapeHtml(r.assessment_status)}</td>
      `;
      frag.appendChild(tr);
    });
  } else {
    // Add 10 placeholder rows for initial display
    for (let i = 0; i < 10; i++) {
      const tr = document.createElement("tr");
      tr.className = "placeholder";
      tr.innerHTML = `<td colspan="6">&nbsp;</td>`;
      frag.appendChild(tr);
    }
  }

  tbody.innerHTML = "";
  tbody.appendChild(frag);
}

  async function fetchStudents() {
    if (areFiltersEmpty()) {
      state.rows = [];
      countEl.textContent = "Total Students: 0";
      renderRows([]);
      return;
    }
    const url = apiUrl(`/api/students?${buildQuery().toString()}`);
    showErrorBanner("");
    console.log("[studlist] GET", url);
    try {
      const res = await fetch(url, {
        credentials: "include",
        headers: { "X-Requested-With": "fetch" },
      });
      if (!res.ok) throw new Error(`Fetch failed ${res.status}`);

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : {};
      console.log("[studlist] payload:", data);

      const rows = Array.isArray(data.rows)
        ? data.rows
        : Array.isArray(data)
        ? data
        : [];
      state.rows = rows.map((r) => ({
        student_no: r.student_no ?? "",
        name: r.name ?? r.student_name ?? "",
        level: r.year_level || r.level || "",
        semester: r.semester || "",
        program: r.program ?? r.department ?? "",
        assessment_status: r.assessment_status ?? "",
      }));

      countEl.textContent = `Total Students: ${
        data.total ?? state.rows.length ?? 0
      }`;
      renderRows(state.rows);
    } catch (err) {
      console.error("[StudentList] fetch error:", err);
      showErrorBanner(String(err?.message || err || "Failed to load students"));
      renderRows([]);
    }
  }

  /* ---------- Toast ---------- */
  function toast(msg, kind = "ok", ms = 2200) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.className = `toast show ${kind}`;
    el.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.classList.remove("show");
      // Remove the element completely after the transition
      setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 200); // Match transition duration
    }, ms);
  }

  /* ---------- Upload flow (overwrite while testing) ---------- */
  const hiddenInput = (() => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept =
      ".pdf,application/pdf,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,.csv,text/csv,application/csv";
    inp.style.display = "none";
    document.body.appendChild(inp);
    return inp;
  })();

async function uploadGradesFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const url = `/api/students/import/grades?overwrite=1`;
  console.log("[studlist] POST", apiUrl(url), "file:", file?.name);
  const res = await apiFetch(url, {
    method: "POST",
    body: fd,
    credentials: "include",
    headers: { "X-Requested-With": "fetch" },
  });
  const isJson = (res.headers.get("content-type") || "").includes(
    "application/json"
  );
  const payload = isJson
    ? await res.json()
    : { success: false, error: `HTTP ${res.status}` };
  console.log("[studlist] upload response:", payload);
  if (!res.ok || payload.success === false) {
    const err = payload?.error || `Upload failed (${res.status})`;
    throw new Error(err);
  }
  return payload;
}

async function uploadRemoveFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const url = `/api/students/remove`;
  console.log("[studlist] POST", apiUrl(url), "file:", file?.name);
  const res = await apiFetch(url, {
    method: "POST",
    body: fd,
    credentials: "include",
    headers: { "X-Requested-With": "fetch" },
  });
  const isJson = (res.headers.get("content-type") || "").includes(
    "application/json"
  );
  const payload = isJson
    ? await res.json()
    : { success: false, error: `HTTP ${res.status}` };
  console.log("[studlist] remove response:", payload);
  if (!res.ok || payload.success === false) {
    const err = payload?.error || `Remove failed (${res.status})`;
    throw new Error(err);
  }
  return payload;
}

function setBusy(btn, on) {
  if (!btn) return;
  if (on && !btn.dataset.originalText)
    btn.dataset.originalText = btn.textContent;
  btn.textContent = on
    ? "Uploading…"
    : btn.dataset.originalText || "Update Records";
  btn.disabled = on;
  if (on) btn.blur(); // Blur when disabling to prevent cursor issues
}

  // Remove applyFiltersBtn event listener to disable Apply button
  if (applyFiltersBtn) {
    applyFiltersBtn.style.display = "none";
    applyFiltersBtn.removeEventListener("click", fetchStudents);
  }

  // Name filter listeners are handled in initNameSelect
  // Multi-select listeners are handled in initMultiSelect with fetchStudents on change/setAll

  // Manage Records Modal functionality
  const manageModal = document.getElementById("manageRecordsModal");
  const manageModalClose = document.getElementById("manageModalClose");
  const addFileInput = document.getElementById("addRecordsFile");
  const addAttachments = document.getElementById("addRecordsAttachments");
  const removeFileInput = document.getElementById("removeRecordsFile");
  const removeAttachments = document.getElementById("removeRecordsAttachments");
  const storedRecordsList = document.getElementById("storedRecordsList");
  const confirmAddBtn = document.getElementById("confirmAddBtn");
  const cancelAddBtn = document.getElementById("cancelAddBtn");

  // Tab elements
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // Delete confirmation modal elements
  const deleteModal = document.getElementById("deleteConfirmationModal");
  const deleteModalClose = document.getElementById("deleteModalClose");
  const deleteCancelBtn = document.getElementById("deleteCancelBtn");
  const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");

  // Delete modal event listeners
  deleteModalClose?.addEventListener("click", () => {
    deleteModal.classList.remove("show");
  });
  deleteCancelBtn?.addEventListener("click", () => {
    deleteModal.classList.remove("show");
  });
  deleteConfirmBtn?.addEventListener("click", async () => {
    const filename = deleteModal.dataset.filename;
    if (!filename) return;
    deleteModal.classList.remove("show");

    try {
      const deleteUrl = apiUrl(`/api/students/uploads/${encodeURIComponent(filename)}`);
      const deleteRes = await apiFetch(deleteUrl, {
        method: 'DELETE',
        credentials: "include",
        headers: { "X-Requested-With": "fetch" },
      });

      if (!deleteRes.ok) throw new Error(`Delete failed: ${deleteRes.status}`);

      const deleteData = await deleteRes.json();
      if (deleteData.success) {
        toast('Record deleted successfully.', 'ok');
        // Refresh the stored records list
        showStoredRecords();
        // Refresh the student list
        await fetchStudents();
      } else {
        throw new Error(deleteData.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast('Failed to delete record: ' + err.message, 'err');
    }
  });

  // Close delete modal on outside click or escape
  deleteModal?.addEventListener("click", (e) => {
    if (e.target === deleteModal) deleteModal.classList.remove("show");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && deleteModal.classList.contains("show")) {
      deleteModal.classList.remove("show");
    }
  });

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(target + "Tab").classList.add("active");
      // Update confirm button text
      confirmAddBtn.textContent = target === "add" ? "Add Records" : "Remove Records";
      confirmAddBtn.disabled = true;

      // Clear any existing attachments when switching tabs
      if (target === "add") {
        addAttachments.innerHTML = "";
        if (addFileInput) addFileInput.value = "";
      } else if (target === "remove") {
        addAttachments.innerHTML = "";
        if (addFileInput) addFileInput.value = "";
        // Show stored records when switching to remove tab
        showStoredRecords();
      }
    });
  });

  // Function to show stored records in the remove tab
  async function showStoredRecords() {
    if (!storedRecordsList) return;

    try {
      const url = apiUrl('/api/students/uploads');
      const res = await apiFetch(url, {
        credentials: "include",
        headers: { "X-Requested-With": "fetch" },
      });

      if (!res.ok) throw new Error(`Failed to fetch uploads: ${res.status}`);

      const data = await res.json();
      const uploads = Array.isArray(data.uploads) ? data.uploads : [];

      if (uploads.length === 0) {
        storedRecordsList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">No stored records found.</p>';
        return;
      }

      const recordsHtml = uploads.map(upload => `
        <div class="stored-record-item" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e5e7eb;">
          <i class="fa-solid fa-file-pdf" style="color: #dc2626; font-size: 18px;"></i>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #111827;">${escapeHtml(upload.originalName)}</div>
            <div style="font-size: 12px; color: #6b7280;">
              ${(upload.size / 1024).toFixed(1)} KB • ${new Date(upload.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button type="button" class="delete-record-btn" data-filename="${upload.id}" style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Delete this record">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      `).join('');

      storedRecordsList.innerHTML = recordsHtml;

      // Add event listeners to delete buttons
      storedRecordsList.querySelectorAll('.delete-record-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const filename = e.currentTarget.dataset.filename;
          if (!filename) return;
          deleteModal.dataset.filename = filename;
          deleteModal.classList.add("show");
        });
      });

    } catch (err) {
      console.error('Error fetching stored records:', err);
      storedRecordsList.innerHTML = '<p style="text-align: center; color: #dc2626; padding: 20px;">Error loading stored records.</p>';
    }
  }

  function showManageModal() {
    if (manageModal) {
      manageModal.classList.add("show");
      // Default to add tab
      tabBtns[0]?.click();
    }
    // Bring button above modal for closing
    if (updateRecordsBtn) updateRecordsBtn.style.zIndex = "8000";
  }

  function closeManageModal() {
    if (manageModal) {
      manageModal.classList.remove("show");
      // Reset state
      addFileInput.value = "";
      addAttachments.innerHTML = "";
      if (removeFileInput) removeFileInput.value = "";
      if (removeAttachments) removeAttachments.innerHTML = "";
      confirmAddBtn.textContent = "Add Records";
      confirmAddBtn.disabled = true;
    }
    // Reset button z-index
    if (updateRecordsBtn) updateRecordsBtn.style.zIndex = "";
    // Blur the button to prevent focus-related cursor issues
    if (updateRecordsBtn) updateRecordsBtn.blur();
  }

  // Close modal
  updateRecordsBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (manageModal && manageModal.classList.contains("show")) {
      closeManageModal();
      return;
    }
    if (isUploading) return;
    showManageModal();
  });

  manageModalClose?.addEventListener("click", closeManageModal);
  cancelAddBtn?.addEventListener("click", closeManageModal);

  // Close on outside click or escape
  manageModal?.addEventListener("click", (e) => {
    if (e.target === manageModal) closeManageModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && manageModal.classList.contains("show")) {
      closeManageModal();
    }
  });

  // Drag and drop for add tab
  const addDropzone = document.querySelector('[data-zone="add-records"]');
  if (addDropzone) {
    addDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      addDropzone.classList.add("dragover");
    });
    addDropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      addDropzone.classList.remove("dragover");
    });
    addDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      addDropzone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && (file.type === "text/csv" || file.name.toLowerCase().endsWith(".xlsx") || file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))) {
        addFileInput.files = e.dataTransfer.files;
        updateFileDisplay(file, "add");
      } else {
        toast("Please select a CSV, XLSX, or PDF file", "err");
      }
    });
    addDropzone.addEventListener("click", () => {
      addFileInput.click();
    });
  }

  // File input for add
  addFileInput?.addEventListener("change", () => {
    const file = addFileInput.files[0];
    if (file) {
      updateFileDisplay(file, "add");
    }
  });

  // Drag and drop for remove tab
  const removeDropzone = document.querySelector('[data-zone="remove-records"]');
  if (removeDropzone) {
    removeDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      removeDropzone.classList.add("dragover");
    });
    removeDropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      removeDropzone.classList.remove("dragover");
    });
    removeDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      removeDropzone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv"))) {
        removeFileInput.files = e.dataTransfer.files;
        updateFileDisplay(file, "remove");
      } else {
        toast("Please select a CSV file", "err");
      }
    });
    removeDropzone.addEventListener("click", () => {
      removeFileInput.click();
    });
  }

  // File input for remove
  removeFileInput?.addEventListener("change", () => {
    const file = removeFileInput.files[0];
    if (file) {
      updateFileDisplay(file, "remove");
    }
  });

  // Confirm add/remove
  confirmAddBtn?.addEventListener("click", async () => {
    const activeTab = document.querySelector(".tab-btn.active")?.dataset.tab;
    const file = activeTab === "add" ? addFileInput.files[0] : removeFileInput.files[0];
    if (!file) return;
    try {
      isUploading = true;
      setBusy(confirmAddBtn, true);
      setBusy(updateRecordsBtn, true);
      let result;
      if (activeTab === "add") {
        result = await uploadGradesFile(file);
        if (result.duplicate) {
          toast(result.note || "Duplicate detected.", "warn");
        } else {
          if (result.num_students) {
            toast(`Import successful — Added: ${result.num_students} students.`, "ok");
          } else {
            toast("Import successful.", "ok");
          }
        }
      } else {
        result = await uploadRemoveFile(file);
        toast(`Remove successful — Removed: ${result.removed || 0} students.`, "ok");
      }
      closeManageModal();
      if (updateRecordsBtn) updateRecordsBtn.blur(); // Blur to prevent cursor issues
      isUploading = false; // Reset uploading flag immediately after modal closes
      setBusy(updateRecordsBtn, false); // Re-enable immediately after modal closes
      await fetchStudents();
    } catch (err) {
      showErrorBanner(String(err?.message || err));
      toast(err.message || "Upload failed", "err");
      console.error(err);
      closeManageModal(); // Ensure modal closes even on error
      isUploading = false; // Reset uploading flag even on error
      setBusy(updateRecordsBtn, false); // Re-enable even on error
    } finally {
      setBusy(confirmAddBtn, false);
      setBusy(updateRecordsBtn, false);
    }
  });

  // Shared file display update function
  function updateFileDisplay(file, tab) {
    const attachments = tab === "remove" ? removeAttachments : addAttachments;
    const fileInput = tab === "remove" ? removeFileInput : addFileInput;
    
    // Determine file icon based on type
    let fileIcon = "fa-file";
    if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
      fileIcon = "fa-file-csv";
    } else if (file.name.toLowerCase().endsWith(".xlsx")) {
      fileIcon = "fa-file-excel";
    } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      fileIcon = "fa-file-pdf";
    }
    
    attachments.innerHTML = `
      <div class="attachment-item" style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f9fafb; border-radius: 6px; margin-top: 8px;">
        <i class="fa-solid ${fileIcon}" style="color: #16a34a;"></i>
        <span style="flex: 1; font-size: 14px;">${file.name}</span>
        <span style="font-size: 12px; color: #6b7280;">${(file.size / 1024).toFixed(1)} KB</span>
        <button type="button" class="remove-file" style="background: none; border: none; color: #dc2626; cursor: pointer; padding: 4px;" title="Remove file">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    `;
    const removeBtn = attachments.querySelector(".remove-file");
    removeBtn?.addEventListener("click", () => {
      fileInput.value = "";
      attachments.innerHTML = "";
      confirmAddBtn.disabled = true;
    });
    confirmAddBtn.disabled = false;
  }

  exportBtn?.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = apiUrl(`/api/students/export.csv?${buildQuery().toString()}`);
    a.download = "student-list.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  /* ---------- Resizer & scroll hint ---------- */
  (function initListResizeAndHint() {
    const card = document.querySelector(".curric-card");
    const handle = document.querySelector(".curric-resize-handle");
    const tableScroll = document.querySelector(".table-scroll");
    const hint = document.getElementById("curricScrollHint");
    if (!card || !handle || !tableScroll) return;

    const STORAGE_KEY = "admin.studlist.container.h";
    const MIN_H = 300; // Minimum card height (header + min table)

(function restore() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && /^\d+px$/.test(saved)) {
    card.style.height = saved;
    card.style.maxHeight = saved;
    card.classList.add("is-resized");
    tableScroll.style.height = "100%";
    tableScroll.style.maxHeight = "100%";
  }
})();

    function maxHeight() {
      // Respect viewport but allow growth
      return window.innerHeight * 0.8;
    }

    const ro = new ResizeObserver(() => {
      const h = Math.round(card.getBoundingClientRect().height);
      if (h > MIN_H) {
        localStorage.setItem(STORAGE_KEY, `${h}px`);
        card.classList.add("is-resized");
        // Let table-scroll fill the card
        tableScroll.style.height = "100%";
        tableScroll.style.maxHeight = "100%";
        renderRows(state.rows);
      }
    });
    ro.observe(card);

    // No sync back from table to card to avoid loops; let card resize drive table fill

    let dragging = false;
    let startY = 0;
    let startH = 0;

    function onMove(clientY) {
      if (!dragging) return;
      const dy = clientY - startY;
      let next = Math.round(startH + dy);
      next = Math.max(MIN_H, next);
      card.style.height = next + "px";
      card.style.maxHeight = next + "px";
      card.classList.add("is-resized");
      // Synchronize table-scroll to fill card
      tableScroll.style.height = "100%";
      tableScroll.style.maxHeight = "100%";
    }
    function onPointerMove(e) {
      onMove(e.clientY);
    }
    function onPointerUp() {
      dragging = false;
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      renderRows(state.rows); // Re-render to fit new container
    }

    handle.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      dragging = true;
      startY = e.clientY;
      startH = Math.round(card.getBoundingClientRect().height);
      document.addEventListener("pointermove", onPointerMove, {
        passive: false,
      });
      document.addEventListener("pointerup", onPointerUp, { passive: true });
      e.preventDefault();
    });

    handle.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 50 : 20;
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      let next =
        Math.round(card.getBoundingClientRect().height) +
        (e.key === "ArrowUp" ? -step : step);
      next = Math.max(MIN_H, next);
      card.style.height = next + "px";
      card.style.maxHeight = next + "px";
      card.classList.add("is-resized");
      tableScroll.style.height = "100%";
      tableScroll.style.maxHeight = "100%";
      e.preventDefault();
      renderRows(state.rows);
    });

    function overflowsX(el) {
      if (!el) return false;
      // For empty tables, check computed min-width vs clientWidth
      const table = el.querySelector('.student-table');
      if (table && !table.querySelector('tbody tr:not(.placeholder)')) {
        const style = getComputedStyle(table);
        const minW = parseFloat(style.minWidth);
        return minW > el.clientWidth + 2; // +2 for padding/border
      }
      return el.scrollWidth - el.clientWidth > 2;
    }
    function subDesktop() {
      return window.matchMedia("(max-width: 1279px)").matches;
    }
    function showHint() {
      if (!hint) {
        console.log("[hint] Element not found with ID 'curricScrollHint'");
        return;
      }
      console.log("[hint] subDesktop:", subDesktop());
      console.log("[hint] overflowsX:", overflowsX(tableScroll));
      if (overflowsX(tableScroll)) {
        const table = tableScroll.querySelector('.student-table');
        const style = getComputedStyle(table);
        const minW = parseFloat(style.minWidth);
        const clientW = tableScroll.clientWidth;
        console.log("[hint] minW:", minW, "clientW:", clientW, "overflow:", minW > clientW + 2);
      }
      const targetWidths = [1280, 1366, 1440];
      const currentWidth = Math.round(window.innerWidth);
      const isTargetDimension = targetWidths.includes(currentWidth);
      if (!overflowsX(tableScroll) && !isTargetDimension) {
        hint.dataset.open = "0";
        hint.setAttribute("hidden", "");
        return;
      }
      console.log("[hint] Showing hint", isTargetDimension ? "(override)" : "");
      hint.removeAttribute("hidden");
      hint.dataset.open = "1";
      setTimeout(() => (hint.dataset.open = "0"), 2200);
    }
    showHint();
    window.addEventListener("resize", () => {
      showHint();
      renderRows(state.rows);
    });

    const hideOnce = () => {
      if (!hint) return;
      hint.dataset.open = "0";
      tableScroll.removeEventListener("scroll", hideOnce);
      tableScroll.removeEventListener("wheel", hideOnce);
      tableScroll.removeEventListener("touchmove", hideOnce);
      tableScroll.removeEventListener("pointerdown", hideOnce);
    };
    tableScroll.addEventListener("scroll", hideOnce, { passive: true });
    tableScroll.addEventListener("wheel", hideOnce, { passive: true });
    tableScroll.addEventListener("touchmove", hideOnce, { passive: true });
    tableScroll.addEventListener("pointerdown", hideOnce, { passive: true });
  })();

  /* ---------- Inbox dropdown (kept) ---------- */
  (function initInboxDropdown() {
    const btn = document.getElementById("inboxBtn");
    const dd = document.getElementById("inboxDropdown");
    const badge = document.getElementById("inboxBadge");
    if (!btn || !dd) return;

    function computeHeaderOffset() {
      const header = document.querySelector("header");
      const topBar = document.querySelector(".top-bar");
      const headerH = header
        ? Math.round(header.getBoundingClientRect().height)
        : 64;
      const topBarH = topBar
        ? Math.round(topBar.getBoundingClientRect().height)
        : 6;
      const offset = headerH + topBarH;
      document.documentElement.style.setProperty(
        "--header-offset",
        offset + "px"
      );
    }
    computeHeaderOffset();
    window.addEventListener("resize", computeHeaderOffset);

    const isOpen = () =>
      !dd.hasAttribute("hidden") && dd.classList.contains("open");
    const open = () => {
      dd.removeAttribute("hidden");
      dd.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      dd.classList.remove("open");
      dd.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
    };
    const toggle = () => (isOpen() ? close() : open());

    function updateBadge() {
      if (!badge) return;
      const count = dd.querySelectorAll(".message.unread").length;
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    }
    updateBadge();

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
    document.addEventListener("click", (e) => {
      if (!isOpen()) return;
      const inside = e.target.closest("#inboxDropdown");
      const onBtn = e.target.closest("#inboxBtn");
      if (!inside && !onBtn) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) close();
    });

    dd.addEventListener("click", (e) => {
      const tab = e.target.closest(".inbox-tab");
      if (tab) {
        dd.querySelectorAll(".inbox-tab").forEach((t) =>
          t.classList.remove("active")
        );
        tab.classList.add("active");
        const mode = tab.getAttribute("data-filter");
        dd.querySelectorAll(".message").forEach((li) => {
          li.style.display =
            mode === "unread"
              ? li.classList.contains("unread")
                ? ""
                : "none"
              : "";
        });
        return;
      }
      if (e.target.closest("#markAllReadBtn")) {
        dd.querySelectorAll(".message.unread").forEach((li) => {
          li.classList.remove("unread");
          const dot = li.querySelector(".unread-dot");
          if (dot) dot.style.display = "none";
        });
        updateBadge();
        return;
      }
      const row = e.target.closest(".message-row");
      if (row) {
        const li = row.closest(".message");
        if (li && li.classList.contains("unread")) {
          li.classList.remove("unread");
          const dot = li.querySelector(".unread-dot");
          if (dot) dot.style.display = "none";
          updateBadge();
        }
      }
    });
  })();

  // No separate remove modal needed anymore

  /* ---------- Initial render + first fetch ---------- */
  renderRows([]); // placeholders to keep height
  fetchStudents();
});
