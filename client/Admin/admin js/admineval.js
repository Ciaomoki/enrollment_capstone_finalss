/* =========================================================
   Evaluators — JS (canon, 2025-09-02)
   - Mobile-only header ⇄ sidebar drawer
   - Desktop collapse toggle
   - Bottom nav wiring
   - Active nav highlight
   - Requests panel height = Active Evaluators grid height (desktop)
     • Excess requests scroll inside panel
     • Auto-updates on card changes / resize
   - Header search UI
   - Approve/Decline handlers
   ========================================================= */

/* -----------------------------
   Mobile-only header ⇄ sidebar
   ----------------------------- */
(function initMobileSidebarOnly() {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    const $ = (s, r = document) => r.querySelector(s);
    const on = (el, ev, cb) => el && el.addEventListener(ev, cb);

    const mqMobile = window.matchMedia("(max-width: 768px)");
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
        if (!mqMobile.matches) return;
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
        if (mqMobile.matches) document.body.classList.remove("sidebar-open");
      });
    });

    mqMobile.addEventListener?.("change", (evt) => {
      if (!evt.matches) document.body.classList.remove("sidebar-open");
    });
  });
})();

/* -----------------------------
   Page wiring / nav / actions
   ----------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const hdrToggle = document.getElementById("toggleBtnHeader");
  const bottomNav = document.getElementById("bottomNav");

  // Desktop collapse mirrors bottom nav
  hdrToggle?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    sidebar?.classList.toggle("collapsed");
    bottomNav?.classList.toggle("collapsed");
  });

  // Bottom Nav (data-href aware)
  (function initBottomNav() {
    if (!bottomNav || bottomNav.dataset.navBound === "1") return;
    bottomNav.dataset.navBound = "1";

    const leftBtn = document.getElementById("navLeftBtn");
    const rightBtn = document.getElementById("navRightBtn");

    const LEFT_DEFAULT =
      bottomNav.getAttribute("data-left-default") || "admindashb.php";
    const RIGHT_DEFAULT =
      bottomNav.getAttribute("data-right-default") || "admindataim.php";

    function go(btn, fallback) {
      if (!btn) return;
      const href = btn.getAttribute("data-href") || fallback;
      if (href) window.location.href = href;
    }

    leftBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      go(leftBtn, LEFT_DEFAULT);
    });
    rightBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      go(rightBtn, RIGHT_DEFAULT);
    });
  })();

  // Active nav highlight
  (function updateActiveNavItem() {
    const currentPage = window.location.pathname
      .split("/")
      .pop()
      .replace(".php", "");
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

  // Hover effect (kept simple; CSS already handles shadows)
  document.querySelectorAll(".eval-card").forEach((card) => {
    card.addEventListener(
      "mouseenter",
      () => (card.style.transform = "translateY(-2px)")
    );
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });

  // Approve / Decline (event delegation)
  const requestsList = document.querySelector(".requests-list");
  requestsList?.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-pill");
    if (!btn) return;
    const item = e.target.closest(".request-item");
    const name =
      item?.querySelector(".req-name")?.textContent?.trim() || "Unknown";
    if (btn.classList.contains("approve")) {
      console.log("Approving request:", name);
      // TODO: approval logic
    } else if (btn.classList.contains("decline")) {
      console.log("Declining request:", name);
      // TODO: decline logic
    }
  });
});

/* ---------------------------------------------------------
   Requests panel height = Active Evaluators grid height
   - Desktop only (≥ 992px two-column layout)
   - Clamped to available viewport (above bottom nav)
   - Auto-updates via ResizeObserver + MutationObserver + resize
   --------------------------------------------------------- */
(function initEvalPanelSizing() {
  "use strict";
  if (window.__adminevalBound) return;
  window.__adminevalBound = true;

  document.addEventListener("DOMContentLoaded", function () {
    const grid = document.querySelector(".active-evals .cards-grid");
    const panel = document.querySelector(".requests-panel");
    const list = document.querySelector(".requests-panel .requests-list");
    const title = document.querySelector(".requests-panel > h3");
    if (!grid || !panel || !list || !title) return;

    // Utilities
    const rootNum = (prop) => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(
        prop
      );
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    };
    function stickyTopPx(el) {
      const v = getComputedStyle(el).top;
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    }
    const isStacked = () => window.matchMedia("(max-width: 992px)").matches;

    function sync() {
      // Disable height sync when stacked (mobile/tablet narrow)
      if (isStacked()) {
        panel.style.height = "";
        list.style.height = "";
        panel.classList.remove("is-sized");
        return;
      }

      // Height to match = card grid’s actual rendered height
      const gridH = Math.max(
        0,
        Math.round(grid.getBoundingClientRect().height)
      );

      // Clamp to viewport budget above bottom nav
      const topOffset = stickyTopPx(panel) || 88; // sticky top from CSS (fallback)
      const bottomNav = rootNum("--bottom-nav-h") || 96;
      const extra = rootNum("--content-bpad-extra") || 4;
      const maxAvail = Math.max(
        160,
        Math.round(window.innerHeight - topOffset - bottomNav - extra)
      );
      const panelH = Math.min(gridH, maxAvail);

      // Apply panel height; let inner list flex to fill remainder
      panel.style.height = panelH + "px";
      panel.classList.add("is-sized");

      // Ensure the scrolling list fits the remaining space precisely
      // (panel paddings are in CSS; with flex it’s automatic, but this guards odd fonts)
      requestAnimationFrame(() => {
        const panelBox = panel.getBoundingClientRect().height;
        const titleBox = title.getBoundingClientRect().height;
        const comp = getComputedStyle(panel);
        const paddingY =
          parseFloat(comp.paddingTop || "0") +
          parseFloat(comp.paddingBottom || "0");
        const listH = Math.max(
          0,
          Math.round(panelBox - titleBox - paddingY - 8)
        );
        list.style.height = listH + "px";
      });
    }

    // Observe size changes in the grid (new/removed cards, reflow)
    const ro = new ResizeObserver(sync);
    ro.observe(grid);

    // In case DOM nodes are added/removed without layout change callbacks
    const mo = new MutationObserver(sync);
    mo.observe(grid, { childList: true, subtree: false });

    // Window events
    window.addEventListener("resize", sync, { passive: true });
    window.addEventListener("orientationchange", sync);

    // Kick once after layout settles
    requestAnimationFrame(() => requestAnimationFrame(sync));
  });
})();

/* ---------------------------------------------------------
   Header Search UI (same behavior as other modules)
   --------------------------------------------------------- */
(function initAdminSearchUI() {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
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
      const isManuallyExcluded = a.getAttribute("data-search") === "exclude";
      return !isSignOut && !isManuallyExcluded;
    });
    if (!sidebarLinks.length) return;

    try {
      input.removeAttribute("list");
    } catch {}

    input.setAttribute("autocomplete", "off");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");

    const baseItems = sidebarLinks.map((a) => {
      const label =
        a.querySelector("span")?.textContent?.trim() ||
        (a.dataset.page || a.href).trim();
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
        label: "Active Evaluators",
        href: "admineval.php",
        key: "evaluators",
        icon: "fa-solid fa-users",
      },
      {
        label: "Evaluator Requests",
        href: "admineval.php",
        key: "evaluators",
        icon: "fa-solid fa-users",
      },
      {
        label: "Students",
        href: "adminstudlist.php",
        key: "studentlist",
        icon: "fa-solid fa-list",
      },
      {
        label: "Courses",
        href: "admincurr.php",
        key: "curriculum",
        icon: "fa-solid fa-book-open",
      },
      {
        label: "Import Data",
        href: "admindataim.php",
        key: "dataimport",
        icon: "fa-solid fa-file-import",
      },
    ];

    const map = new Map();
    [...baseItems, ...synonyms].forEach((m) => {
      const k = `${m.label.toLowerCase()}|${m.href}`;
      if (!map.has(k)) map.set(k, m);
    });
    const ITEMS = Array.from(map.values());

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
              <i class="${m.icon}"></i><span>${m.label}</span><kbd>↵</kbd>
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
      if (m && m.href) window.location.href = m.href;
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
      go(Number(btn.dataset.index));
    });

    document.addEventListener("pointerdown", (e) => {
      if (!host.contains(e.target)) closeDropdown();
    });
    input.addEventListener("blur", () => setTimeout(closeDropdown, 120));

    applyFilter("");
  });
})();
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
