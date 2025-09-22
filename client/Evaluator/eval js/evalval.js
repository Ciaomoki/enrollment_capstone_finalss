// Mobile-only header ⇄ sidebar drawer (safe to include per page)
(function initMobileSidebarOnly() {
  document.addEventListener("DOMContentLoaded", function () {
    const $ = (s, r = document) => r.querySelector(s);
    const on = (el, ev, cb) => el && el.addEventListener(ev, cb);

    const mqMobile = window.matchMedia("(max-width: 768px)");
    const hdrToggle = $("#toggleBtnHeader") || $('[data-toggle="sidebar"]');

    // Align the off-canvas under the sticky header + top bar
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

    // Ensure a single overlay exists
    let overlay = $(".sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }

    // Bind the button — mobile only
    if (hdrToggle && !hdrToggle.dataset.mobileBound) {
      hdrToggle.dataset.mobileBound = "1";
      on(hdrToggle, "click", (e) => {
        if (!mqMobile.matches) return; // do nothing on desktop
        e.preventDefault();
        setHeaderOffset(); // recalc if header wrapped to two lines
        document.body.classList.toggle("sidebar-open");
        hdrToggle.setAttribute(
          "aria-expanded",
          document.body.classList.contains("sidebar-open") ? "true" : "false"
        );
      });
    }

    // Close behaviors for mobile
    on(overlay, "click", () => document.body.classList.remove("sidebar-open"));
    on(document, "keydown", (e) => {
      if (e.key === "Escape") document.body.classList.remove("sidebar-open");
    });
    document.querySelectorAll(".sidebar-nav a").forEach((a) => {
      on(a, "click", () => {
        if (mqMobile.matches) document.body.classList.remove("sidebar-open");
      });
    });

    // Breakpoint sanity: ensure drawer closed when leaving mobile
    mqMobile.addEventListener?.("change", (evt) => {
      if (!evt.matches) document.body.classList.remove("sidebar-open");
    });
  });
})();

// evalval.js — Validate module (Evaluator)
// Robust, null-safe, wired to the redesigned right panel UI.
// Includes reflection of the selected student into the current-student panel.
// Student chooser search UI is fixed: clean empty field on open, panel can be wider than toggle.

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const hdrToggle = document.getElementById("toggleBtnHeader");
  const bottomNav = document.getElementById("bottomNav");
  const studentListBtn = document.getElementById("studentListBtn");
  const reportsBtn = document.getElementById("reportsBtn");
  const signoutLi = document.getElementById("signout-btn");

  /* ======================================================================
     Helper: reflect selected student into the right-panel card(s)
     Supports NEW compact card (.current-student) and LEGACY (.student-info)
  ====================================================================== */
  function setCurrentStudentPanel({ name, dept = null, year = null }) {
    // NEW compact card (preferred)
    const nameNew = document.querySelector(".current-student .name");
    const metaBlocks = document.querySelectorAll(".current-student .meta");

    if (nameNew) nameNew.textContent = name || "";

    // Try to fill two meta rows if provided, else preserve existing
    if (metaBlocks && metaBlocks.length >= 2) {
      if (dept) metaBlocks[0].textContent = dept;
      if (year) metaBlocks[1].textContent = year;
    }

    // LEGACY panel (icon + name with <br> + separate details box)
    const legacyName = document.querySelector(".student-info .student-name");
    const legacyMetaWrap = document.querySelector(".student-details");

    if (legacyName) {
      // If "First Last", convert to "Last<br>First"; if "Last, First" keep
      let display = name || "";
      if (display && !display.includes(",")) {
        const parts = display.trim().split(/\s+/);
        if (parts.length >= 2) {
          const last = parts.pop();
          const first = parts.join(" ");
          display = `${last}, ${first}`;
        }
      }
      const [lastPart, firstPart = ""] = display
        .split(",")
        .map((s) => s.trim());
      legacyName.innerHTML = `${lastPart || ""}<br>${firstPart || ""}`;
    }
    if (legacyMetaWrap) {
      // Render dept + year as stacked lines (keep HTML line breaks for legacy)
      const html = [dept ? `${dept}` : "", year ? `${year}` : ""]
        .filter(Boolean)
        .join("<br>");
      if (html) legacyMetaWrap.innerHTML = html;
    }

    // Optional broadcast if other parts of the page need to react
    window.dispatchEvent(
      new CustomEvent("student:changed", { detail: { name, dept, year } })
    );
  }

  /* =============== Sidebar toggle =============== */
  hdrToggle?.addEventListener("click", () => {
    // Only collapse on desktop; mobile handled by drawer init
    if (window.matchMedia("(max-width: 768px)").matches) return;
    sidebar?.classList.toggle("collapsed");
    bottomNav?.classList.toggle("collapsed");
  });

  /* =========================================================
     Bottom Nav — Generic wiring (global & per-page defaults)
     - Uses #navLeftBtn / #navRightBtn if present
     - Per-button override via data-href on buttons
     - Page defaults via data-left-default / data-right-default on #bottomNav
     - Hardcoded fallbacks here: left → evalstudlist.php, right → evalreport.php
  ========================================================= */
  (function initBottomNav() {
    if (!bottomNav) return;
    if (bottomNav.dataset.navBound === "1") return;
    bottomNav.dataset.navBound = "1";

    const leftBtn = document.getElementById("navLeftBtn") || null;
    const rightBtn = document.getElementById("navRightBtn") || null;

    const LEFT_DEFAULT =
      bottomNav.getAttribute("data-left-default") || "evalstudlist.php";
    const RIGHT_DEFAULT =
      bottomNav.getAttribute("data-right-default") || "evalreport.php";

    function go(btn, fallback) {
      if (!btn) return;
      const href = btn.getAttribute("data-href") || fallback;
      if (href) window.location.href = href;
    }

    if (leftBtn && !leftBtn.dataset.navBound) {
      leftBtn.dataset.navBound = "1";
      leftBtn.addEventListener("click", (e) => {
        e.preventDefault();
        go(leftBtn, LEFT_DEFAULT);
      });
    }
    if (rightBtn && !rightBtn.dataset.navBound) {
      rightBtn.dataset.navBound = "1";
      rightBtn.addEventListener("click", (e) => {
        e.preventDefault();
        go(rightBtn, RIGHT_DEFAULT);
      });
    }
  })();

  /* =============== Top buttons =============== */
  studentListBtn?.addEventListener("click", () => {
    window.location.href = "evalstudlist.php";
  });
  reportsBtn?.addEventListener("click", () => {
    window.location.href = "evalreport.php";
  });

  /* =============== Active nav state =============== */
  (function updateActiveNavItem() {
    const currentPage = window.location.pathname
      .split("/")
      .pop()
      .replace(".php", "");
    document.querySelectorAll(".sidebar-nav .nav-item").forEach((item) => {
      const href = item.querySelector("a")?.getAttribute("href") || "";
      const page = href.split("/").pop().replace(".php", "");
      item.classList.toggle("active", page === currentPage);
    });
  })();

  /* =============== Sign out =============== */
  signoutLi?.addEventListener("click", (e) => {
    e.preventDefault();
    // TODO: hook your real sign-out flow here.
    window.location.href = "login.html";
  });

  /* =========================================================
     Header Search (Evaluator) — reuses global .header-search UI
     Excludes Sign out / Logout
  ========================================================= */
  (function initEvaluatorSearchUI() {
    const input = document.getElementById("globalSearch");
    if (!input) return;

    const sidebarLinks = Array.from(
      document.querySelectorAll(".sidebar-nav .nav-item a")
    ).filter((a) => {
      const text = (a.textContent || "").toLowerCase();
      const href = (a.getAttribute("href") || "").toLowerCase();
      const page = (a.dataset.page || "").toLowerCase();
      const isSignOut =
        text.includes("sign out") ||
        text.includes("logout") ||
        page === "signout" ||
        page === "logout" ||
        /sign-?out|log-?out/.test(href);
      return !isSignOut && a.getAttribute("data-search") !== "exclude";
    });
    if (!sidebarLinks.length) return;

    // Accessibility attrs
    input.removeAttribute("list");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");

    const baseItems = sidebarLinks.map((a) => {
      const label =
        a.querySelector("span")?.textContent?.trim() ||
        a.dataset.page ||
        a.href;
      const iconEl = a.querySelector("i");
      return {
        label,
        href: a.getAttribute("href"),
        key: (a.dataset.page || label).toLowerCase(),
        icon: iconEl
          ? Array.from(iconEl.classList).join(" ")
          : "fa-solid fa-square",
      };
    });

    const synonyms = [
      {
        label: "Students",
        href: "evalstudlist.php",
        key: "studentlist",
        icon: "fa-solid fa-list",
      },
      {
        label: "Validation",
        href: "evalval.php",
        key: "validate",
        icon: "fa-solid fa-book",
      },
      {
        label: "Approve",
        href: "evalval.php",
        key: "validate",
        icon: "fa-solid fa-book",
      },
      {
        label: "Reports",
        href: "evalreport.php",
        key: "reports",
        icon: "fa-solid fa-chart-bar",
      },
    ];

    const map = new Map();
    [...baseItems, ...synonyms].forEach((m) => {
      const k = `${m.label.toLowerCase()}|${m.href}`;
      if (!map.has(k)) map.set(k, m);
    });
    const ITEMS = Array.from(map.values());

    const host = input.closest(".header-search") || input.parentElement;
    if (!host) return;

    let dropdown = host.querySelector(".search-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-dropdown";
      dropdown.innerHTML = `<ul class="search-list" role="listbox" id="evalSearchList"></ul>`;
      host.appendChild(dropdown);
    }
    const listEl = dropdown.querySelector(".search-list");

    let open = false;
    let filtered = ITEMS.slice();
    let activeIndex = -1;

    function render() {
      if (!filtered.length) {
        listEl.innerHTML = `<li class="search-empty">No matches</li>`;
        return;
      }
      listEl.innerHTML = filtered
        .map(
          (m, idx) => `
          <li>
            <button type="button" class="search-item${
              idx === activeIndex ? " active" : ""
            }"
                    data-href="${m.href}" data-index="${idx}">
              <i class="${m.icon}"></i>
              <span>${m.label}</span>
              <kbd>↵</kbd>
            </button>
          </li>`
        )
        .join("");
    }
    function openDropdown() {
      if (open) return;
      dropdown.classList.add("open");
      input.setAttribute("aria-expanded", "true");
      open = true;
    }
    function closeDropdown() {
      if (!open) return;
      dropdown.classList.remove("open");
      input.setAttribute("aria-expanded", "false");
      open = false;
      activeIndex = -1;
    }
    function applyFilter(q) {
      const s = (q || "").trim().toLowerCase();
      filtered = !s
        ? ITEMS.slice()
        : ITEMS.filter(
            (m) =>
              m.label.toLowerCase().includes(s) || (m.key && m.key.includes(s))
          );
      activeIndex = filtered.length ? 0 : -1;
      render();
    }
    function go(idx) {
      const m = filtered[idx];
      if (m?.href) window.location.href = m.href;
    }

    input.addEventListener("focus", () => {
      applyFilter(input.value);
      openDropdown();
    });
    input.addEventListener("input", () => {
      applyFilter(input.value);
      openDropdown();
    });
    input.addEventListener("keydown", (e) => {
      if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        openDropdown();
        applyFilter(input.value);
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
        closeDropdown();
      }
    });

    listEl.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest(".search-item");
      if (!btn) return;
      const idx = Number(btn.dataset.index);
      go(idx);
    });

    document.addEventListener("pointerdown", (e) => {
      if (!host.contains(e.target)) closeDropdown();
    });
    input.addEventListener("blur", () => {
      setTimeout(() => closeDropdown(), 120);
    });

    applyFilter("");
  })();

  /* =========================================================
     Themed Combobox — Student chooser (matches right panel UI)
     + Left/Right nav buttons use same selection
     + FIX: Search input opens empty; panel can be wider than toggle
  ========================================================= */
  (function initStudentChooser() {
    // Support both new wrapper (.student-switcher) and legacy (.student-nav)
    const switcher =
      document.querySelector(".student-switcher") ||
      document.querySelector(".student-nav");
    const chooser =
      document.querySelector(".student-chooser") ||
      document.querySelector(".right-panel .student-chooser");
    if (!switcher || !chooser) return;

    const btn = chooser.querySelector(".combo-toggle");
    const panel = chooser.querySelector(".combo-panel");
    const search = chooser.querySelector(".combo-search input");
    const options = Array.from(chooser.querySelectorAll(".combo-option"));
    const label = chooser.querySelector(".combo-label");
    // Prev/Next buttons: new (.switch-btn) or legacy (first/last child buttons)
    let [prevBtn, nextBtn] = switcher.querySelectorAll(".switch-btn");
    if (!prevBtn || !nextBtn) {
      const btns = switcher.querySelectorAll("button");
      prevBtn = btns[0];
      nextBtn = btns[1];
    }

    if (!btn || !panel || !search || !options.length || !label) return;

    // Allow panel to be larger than the toggle width
    function sizePanel() {
      const rp = document.querySelector(".right-panel");
      const chooserRect = chooser.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const viewport = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );
      const pageMargin = 16;

      const containerRect = rp
        ? rp.getBoundingClientRect()
        : {
            left: pageMargin,
            right: viewport - pageMargin,
            width: viewport - pageMargin * 2,
          };

      // Make the dropdown the same width as the right panel, clamped to viewport
      const targetWidth = Math.min(
        containerRect.width,
        viewport - pageMargin * 2
      );
      const w = Math.floor(targetWidth);
      panel.style.minWidth = w + "px";
      panel.style.width = w + "px";
      panel.style.maxWidth = w + "px";

      // Center the panel under the toggle; clamp so it doesn't overflow right side
      let leftPx = btnRect.left + btnRect.width / 2 - w / 2;
      const minLeft = containerRect.left + pageMargin / 2;
      const maxLeft = containerRect.right - pageMargin / 2 - w;
      leftPx = Math.max(minLeft, Math.min(maxLeft, leftPx));

      // Convert viewport position to offset relative to .student-chooser (position: relative)
      const offsetLeft = Math.floor(leftPx - chooserRect.left);
      panel.style.left = offsetLeft + "px";
      panel.style.right = "auto";
    }

    function closePanel() {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
    function visibleOptions() {
      return options.filter((li) => !li.classList.contains("hidden"));
    }
    function currentVisibleIndex() {
      const vis = visibleOptions();
      const text = label.textContent.trim();
      return vis.findIndex(
        (li) => (li.dataset.value || li.textContent.trim()) === text
      );
    }

    // OPEN: make search empty & show all options; size the panel larger than toggle
    function openPanel() {
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      sizePanel();

      requestAnimationFrame(() => {
        if (search) {
          // Preserve placeholder text; ensure the field is empty (no overlap)
          if (!search.getAttribute("placeholder")) {
            search.setAttribute("placeholder", "Search students…");
          }
          search.value = "";
          search.focus({ preventScroll: true });
        }
        // Show all options when opening
        options.forEach((li) => li.classList.remove("hidden"));
      });
    }
    function selectValue(text) {
      label.textContent = text;

      // mark selection
      options.forEach((li) => li.removeAttribute("aria-selected"));
      const active = options.find(
        (li) => (li.dataset.value || li.textContent.trim()) === text.trim()
      );
      active?.setAttribute("aria-selected", "true");

      // Reflect into the current student panel(s)
      setCurrentStudentPanel({
        name: text,
        dept: active?.dataset.dept || null,
        year: active?.dataset.year || null,
      });

      closePanel();

      // TODO: Load the selected student's data here if needed.
      // loadStudent(text);
    }
    function selectByVisibleIndex(idx) {
      const vis = visibleOptions();
      if (!vis.length) return;
      const safe = ((idx % vis.length) + vis.length) % vis.length;
      const val = vis[safe].dataset.value || vis[safe].textContent.trim();
      selectValue(val);
    }

    // Toggle open/close
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (panel.hidden) openPanel();
      else closePanel();
    });

    // Click option
    options.forEach((li) => {
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        selectValue(li.dataset.value || li.textContent.trim());
      });
    });

    // Filter list
    search.addEventListener("input", () => {
      const q = search.value.toLowerCase();
      options.forEach((li) => {
        const match = (li.dataset.value || li.textContent)
          .toLowerCase()
          .includes(q);
        li.classList.toggle("hidden", !match);
      });
    });

    // Keyboard support inside the panel
    search.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closePanel();
        btn.focus();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        // pick first visible item on Enter
        const vis = visibleOptions();
        if (vis.length) {
          selectValue(vis[0].dataset.value || vis[0].textContent.trim());
        }
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const vis = visibleOptions();
        if (!vis.length) return;
        let idx = currentVisibleIndex();
        if (idx < 0) idx = 0;
        idx += e.key === "ArrowDown" ? 1 : -1;
        selectByVisibleIndex(idx);
        openPanel(); // keep open to allow continuous navigation
      }
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!chooser.contains(e.target)) closePanel();
    });

    // Prev/Next buttons (cycle visible list)
    prevBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const vis = visibleOptions();
      if (!vis.length) return;
      let idx = currentVisibleIndex();
      if (idx < 0) idx = 0;
      selectByVisibleIndex(idx - 1);
    });
    nextBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const vis = visibleOptions();
      if (!vis.length) return;
      let idx = currentVisibleIndex();
      if (idx < 0) idx = 0;
      selectByVisibleIndex(idx + 1);
    });

    // Keep panel sized if window changes while open
    window.addEventListener("resize", () => {
      if (!panel.hidden) sizePanel();
    });

    // Initialize label to the first option (and reflect panel)
    const first = options[0];
    if (first) selectValue(first.dataset.value || first.textContent.trim());
  })();

  /* =========================================================
     Message box — supports both new (.message-card .btn-send)
     and legacy (.message-box button) structures.
  ========================================================= */
  (function initMessaging() {
    const newSendBtn = document.querySelector(".message-card .btn-send");
    const newTextarea = document.querySelector(".message-card textarea");

    const legacySendBtn = document.querySelector(".message-box button");
    const legacyTextarea = document.querySelector(".message-box textarea");

    const sendBtn = newSendBtn || legacySendBtn;
    const textarea = newTextarea || legacyTextarea;

    if (!sendBtn || !textarea) return;

    sendBtn.addEventListener("click", () => {
      const message = textarea.value.trim();
      if (!message) return;
      // TODO: Replace with real send-message API
      console.log("Sending message:", message);
      textarea.value = "";
    });
  })();

  /* =========================================================
     Flags — supports new white flag buttons and legacy approve/reject
  ========================================================= */
  (function initFlags() {
    const flagBtns = document.querySelectorAll(
      ".flag-buttons .flag-btn, .action-buttons .action-btn"
    );
    if (!flagBtns.length) return;

    flagBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const icon = btn.querySelector("i");
        const isApprove =
          btn.classList.contains("approve") ||
          icon?.classList.contains("fa-thumbs-up");
        const isReject =
          btn.classList.contains("reject") ||
          icon?.classList.contains("fa-flag");
        const type = isApprove ? "positive" : isReject ? "negative" : "unknown";
        // TODO: Hook to your backend (flag/approve record)
        console.log(`Flag clicked: ${type}`);
      });
    });
  })();

  /* =========================================================
     RESIZE HANDLES — per card (checklist & schedule)
     Inherit admincurr/studlist behavior. No structure change.
  ========================================================= */
  (function initCardResize() {
    const cards = [
      document.querySelector(".checklist-container"),
      document.querySelector(".schedule-container"),
    ].filter(Boolean);

    cards.forEach((card) => {
      const handle = card?.querySelector(".table-resize-handle");
      if (!handle) return;

      let startY = 0,
        startH = 0,
        dragging = false;

      const minH = () => {
        const v = getComputedStyle(card).minHeight;
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : 200;
      };
      const maxH = () => {
        const v = getComputedStyle(card).maxHeight;
        const n = parseFloat(v);
        if (v && v !== "none" && Number.isFinite(n)) return n;
        // conservative viewport-aware cap
        return Math.max(240, Math.round(window.innerHeight * 0.8));
      };

      const onMove = (e) => {
        if (!dragging) return;
        const dy = e.clientY - startY;
        let next = Math.round(startH + dy);
        next = Math.max(minH(), Math.min(maxH(), next));
        card.style.height = next + "px";
        card.classList.add("is-resized");
        e.preventDefault();
      };
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        handle.releasePointerCapture?.(handle._pid);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };

      handle.addEventListener("pointerdown", (e) => {
        if (e.button && e.button !== 0) return;
        dragging = true;
        handle._pid = e.pointerId;
        handle.setPointerCapture?.(e.pointerId);
        startY = e.clientY;
        startH = Math.round(card.getBoundingClientRect().height);
        e.preventDefault();
        document.addEventListener("pointermove", onMove, { passive: false });
        document.addEventListener("pointerup", onUp, { passive: true });
      });

      // Keyboard nudge (accessibility)
      handle.addEventListener("keydown", (e) => {
        const step = e.shiftKey ? 32 : 12;
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          const cur = Math.round(card.getBoundingClientRect().height);
          const delta = e.key === "ArrowUp" ? -step : step;
          let next = cur + delta;
          next = Math.max(minH(), Math.min(maxH(), next));
          card.style.height = next + "px";
          card.classList.add("is-resized");
          e.preventDefault();
        }
      });
    });
  })();

  /* =========================================================
     X-SCROLL HINT — show once on sub-desktop if overflow exists
  ========================================================= */
  (function initValidateXScrollHintAlways() {
    const wrappers = Array.from(
      document.querySelectorAll(".validate-module .table-wrapper")
    );
    const hint = document.getElementById("validateScrollHint");
    if (!wrappers.length || !hint) return;

    const isSubDesktop = () => window.matchMedia("(max-width: 1279px)").matches;
    const anyXOverflow = () =>
      wrappers.some((w) => w.scrollWidth > w.clientWidth);
    const shouldShow = () => isSubDesktop() && anyXOverflow();

    function show() {
      if (hint.hasAttribute("hidden")) hint.removeAttribute("hidden");
      hint.dataset.open = shouldShow() ? "1" : "0";
    }
    function hide() {
      hint.dataset.open = "0";
    }

    // Show after layout settles so measurements are correct
    requestAnimationFrame(() => requestAnimationFrame(show));

    // Hide on first user interaction that implies scrolling
    const hideOnce = () => {
      hide();
      wrappers.forEach((w) => {
        w.removeEventListener("scroll", hideOnce);
        w.removeEventListener("wheel", hideOnce);
        w.removeEventListener("touchmove", hideOnce);
        w.removeEventListener("pointerdown", hideOnce);
      });
    };
    wrappers.forEach((w) => {
      w.addEventListener("scroll", hideOnce, { passive: true });
      w.addEventListener("wheel", hideOnce, { passive: true });
      w.addEventListener("touchmove", hideOnce, { passive: true });
      w.addEventListener("pointerdown", hideOnce, { passive: true });
    });

    // Re-evaluate on resize so it's accurate if user reloads in new size.
    // Only re-open automatically if not hidden yet.
    window.addEventListener("resize", () => {
      if (hint.dataset.open !== "0") show();
    });
  })();
});
// for inbox
// === Inbox Dropdown (self-contained) =========================================
(function () {
  // Helper: compute sticky header + top bar height → CSS var --header-offset
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
    return offset;
  }
  // If your app already defines setHeaderOffset(), don’t stomp it—just call it.
  const setHeaderOffset =
    window.setHeaderOffset && typeof window.setHeaderOffset === "function"
      ? window.setHeaderOffset
      : computeHeaderOffset;

  function initInboxDropdown() {
    const btn = document.getElementById("inboxBtn");
    const dd = document.getElementById("inboxDropdown");
    const badge = document.getElementById("inboxBadge");
    if (!btn || !dd) return;

    // keep positioned below the sticky header
    setHeaderOffset();
    window.addEventListener("resize", setHeaderOffset);

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

    // unread badge = count of .message.unread
    function updateBadge() {
      if (!badge) return;
      const count = dd.querySelectorAll(".message.unread").length;
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    }
    updateBadge();

    // Open/close
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

    // Internal actions: tabs, mark-all-read, mark individual row read
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initInboxDropdown);
  } else {
    initInboxDropdown();
  }
})();
