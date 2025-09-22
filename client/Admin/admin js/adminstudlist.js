/* ========================================================================
   Admin Student List — Sync with Student Reports (2025-09-15)
   - Mobile-only drawer + desktop collapse (kept)
   - Bottom nav wiring, filters, active nav, header search (kept)
   - ✅ NEW: Scroller-driven resizing w/ persistence (like Student Reports)
     * Native vertical resize on .table-scroll
     * Custom handle adjusts .table-scroll height (NOT the card)
     * Card adds .is-resized so scroller can use max-height:100%
     * Height persisted to localStorage and clamped to viewport
   - X-scroll hint behavior (kept)
   ======================================================================== */

/* ---------------- Mobile-only header ⇄ sidebar drawer ---------------- */
(function initMobileSidebarOnly() {
  "use strict";
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
        if (!mq.matches) return; // desktop handled elsewhere
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

    // Close on nav click (mobile)
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

/* ---------------- Page wiring: collapse, nav, filters, search ---------------- */
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const hdrToggle = document.getElementById("toggleBtnHeader");
  const bottomNav = document.getElementById("bottomNav");
  const updateBtn = document.querySelector(".table-footer .update-button");
  const deptFilter = document.getElementById("dept");
  const yearFilter = document.getElementById("year");
  const statusFilter = document.getElementById("status");

  // Desktop collapse mirrors bottom nav (mobile handled by drawer)
  hdrToggle?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    sidebar?.classList.toggle("collapsed");
    bottomNav?.classList.toggle("collapsed");
  });

  // Bottom Nav
  (function initBottomNav() {
    if (!bottomNav || bottomNav.dataset.navBound === "1") return;
    bottomNav.dataset.navBound = "1";
    const leftBtn = document.getElementById("navLeftBtn");
    const rightBtn = document.getElementById("navRightBtn");
    const LEFT_DEFAULT =
      bottomNav.getAttribute("data-left-default") || "admindataim.php";
    const RIGHT_DEFAULT =
      bottomNav.getAttribute("data-right-default") || "admincurr.php";
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

  // Update button stub
  updateBtn?.addEventListener("click", () => {
    console.log("Update Student List clicked");
    // hook your update logic here
  });

  // Filters (stub)
  function filterStudents() {
    const deptValue = deptFilter?.value || "All";
    const yearValue = yearFilter?.value || "All";
    const statusValue = statusFilter?.value || "All";
    console.log(
      `Filtering: Department=${deptValue}, Year=${yearValue}, Status=${statusValue}`
    );
  }
  deptFilter?.addEventListener("change", filterStudents);
  yearFilter?.addEventListener("change", filterStudents);
  statusFilter?.addEventListener("change", filterStudents);

  // Active nav state
  (function updateActiveNavItem() {
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

  /* ---------------- Header Search (Admin) ---------------- */
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
    } catch (_) {}
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

    let open = false,
      filtered = ITEMS.slice(),
      activeIndex = -1;

    function render() {
      listEl.innerHTML = filtered.length
        ? filtered
            .map(
              (m, i) => `
            <li>
              <button type="button" class="search-item${
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
});

/* ---------------- Scroller resize + X-scroll hint (SYNCED) ---------------- */
(function initListResizeAndHint() {
  "use strict";
  if (window.__adminStudListBound) return;
  window.__adminStudListBound = true;

  document.addEventListener("DOMContentLoaded", function () {
    const card = document.querySelector(".curric-card");
    const handle = document.querySelector(".curric-resize-handle");
    const tableScroll = document.querySelector(".table-scroll");
    const hint = document.getElementById("curricScrollHint");
    if (!card || !handle || !tableScroll) return;

    const STORAGE_KEY = "admin.studlist.scroller.h";
    const MIN_H = 140;

    // Restore saved scroller height
    (function restore() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && /^\d+px$/.test(saved)) {
        tableScroll.style.height = saved;
        tableScroll.style.maxHeight = saved;
        card.classList.add("is-resized");
      }
    })();

    // Compute max scroller height so footer stays visible
    function maxHeight() {
      const vh =
        window.visualViewport?.height ||
        document.documentElement.clientHeight ||
        window.innerHeight ||
        0;

      const headerH =
        card.querySelector(".curric-card-header")?.getBoundingClientRect()
          .height || 64;
      const pad = parseFloat(getComputedStyle(card).padding) || 12;
      const reserve = 96 + 24; // bottom nav + spacing
      return Math.max(220, Math.floor(vh - reserve - headerH - 2 * pad));
    }

    // Persist size (covers native drag-resize too)
    const ro = new ResizeObserver(() => {
      const h = Math.round(tableScroll.getBoundingClientRect().height);
      if (h > 0) {
        localStorage.setItem(STORAGE_KEY, `${h}px`);
        card.classList.add("is-resized");
      }
    });
    ro.observe(tableScroll);

    // Custom drag handle (pointer + keyboard) — adjusts SCROLLER
    let dragging = false,
      startY = 0,
      startH = 0;

    const onMove = (clientY) => {
      if (!dragging) return;
      const dy = clientY - startY;
      let next = Math.round(startH + dy);
      next = Math.max(MIN_H, Math.min(maxHeight(), next));
      tableScroll.style.height = next + "px";
      tableScroll.style.maxHeight = next + "px";
      card.classList.add("is-resized");
    };
    const onPointerMove = (e) => onMove(e.clientY);
    const onPointerUp = () => {
      dragging = false;
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };

    handle.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      dragging = true;
      startY = e.clientY;
      startH = Math.round(tableScroll.getBoundingClientRect().height);
      document.addEventListener("pointermove", onPointerMove, {
        passive: false,
      });
      document.addEventListener("pointerup", onPointerUp, { passive: true });
      e.preventDefault();
    });

    handle.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 32 : 12;
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      let next =
        Math.round(tableScroll.getBoundingClientRect().height) +
        (e.key === "ArrowUp" ? -step : step);
      next = Math.max(MIN_H, Math.min(maxHeight(), next));
      tableScroll.style.height = next + "px";
      tableScroll.style.maxHeight = next + "px";
      card.classList.add("is-resized");
      e.preventDefault();
    });

    // X-scroll hint (same as reports)
    function overflowsX(el) {
      return el && el.scrollWidth - el.clientWidth > 2;
    }
    function subDesktop() {
      return window.matchMedia("(max-width: 1279px)").matches;
    }
    function showHintOnce() {
      if (!hint) return;
      const key = "admin-studlist-xhint";
      if (!subDesktop() || !overflowsX(tableScroll)) {
        hint.dataset.open = "0";
        return;
      }
      if (!sessionStorage.getItem(key)) {
        hint.removeAttribute("hidden");
        hint.dataset.open = "1";
        setTimeout(() => (hint.dataset.open = "0"), 2200);
        sessionStorage.setItem(key, "1");
      }
    }
    showHintOnce();
    window.addEventListener("resize", showHintOnce);
    setTimeout(showHintOnce, 350);

    // Clamp to viewport on resize/rotation
    function clampToMax() {
      const h = Math.round(tableScroll.getBoundingClientRect().height);
      const clamped = Math.min(Math.max(h, MIN_H), maxHeight());
      if (clamped !== h) {
        tableScroll.style.height = clamped + "px";
        tableScroll.style.maxHeight = clamped + "px";
      }
    }
    window.addEventListener("resize", clampToMax);
    window.visualViewport?.addEventListener("resize", clampToMax);

    // Hide hint on first interaction
    const hideOnce = () => {
      hint && (hint.dataset.open = "0");
      tableScroll.removeEventListener("scroll", hideOnce);
      tableScroll.removeEventListener("wheel", hideOnce);
      tableScroll.removeEventListener("touchmove", hideOnce);
      tableScroll.removeEventListener("pointerdown", hideOnce);
    };
    tableScroll.addEventListener("scroll", hideOnce, { passive: true });
    tableScroll.addEventListener("wheel", hideOnce, { passive: true });
    tableScroll.addEventListener("touchmove", hideOnce, { passive: true });
    tableScroll.addEventListener("pointerdown", hideOnce, { passive: true });
  });
})();

/* ---------------- Inbox dropdown (kept, unchanged) ---------------- */
(function () {
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
  const setHeaderOffset =
    window.setHeaderOffset && typeof window.setHeaderOffset === "function"
      ? window.setHeaderOffset
      : computeHeaderOffset;

  function initInboxDropdown() {
    const btn = document.getElementById("inboxBtn");
    const dd = document.getElementById("inboxDropdown");
    const badge = document.getElementById("inboxBadge");
    if (!btn || !dd) return;

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initInboxDropdown);
  } else {
    initInboxDropdown();
  }
})();
