// ================= Mobile-only header ⇄ sidebar drawer =================
(function initMobileSidebarOnly() {
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
        if (!mqMobile.matches) return; // desktop handled separately
        e.preventDefault();
        setHeaderOffset();
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

    // Ensure drawer closed when leaving mobile
    mqMobile.addEventListener?.("change", (evt) => {
      if (!evt.matches) document.body.classList.remove("sidebar-open");
    });
  });
})();

// ================= Page logic =================
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const hdrToggle = document.getElementById("toggleBtnHeader");
  const bottomNav = document.getElementById("bottomNav");

  // Desktop collapse toggle (mobile handled by drawer)
  hdrToggle?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    sidebar?.classList.toggle("collapsed");
    bottomNav?.classList.toggle("collapsed");
    // steps bar recalc is handled below
  });

  // Bottom-nav navigation
  const leftBtn = document.getElementById("navLeftBtn");
  const rightBtn = document.getElementById("navRightBtn");
  leftBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    const href = leftBtn.getAttribute("data-href") || "studdashb.php";
    if (href) window.location.href = href;
  });
  rightBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    const href = rightBtn.getAttribute("data-href") || "studassess.php";
    if (href) window.location.href = href;
  });

  // Sign out
  document.getElementById("signout-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "login.html";
  });

  // Sidebar active state
  (function updateActiveNavItem() {
    const currentPage = location.pathname.split("/").pop();
    document.querySelectorAll(".sidebar-nav .nav-item").forEach((item) => {
      const href = item
        .querySelector("a")
        ?.getAttribute("href")
        ?.split("/")
        .pop();
      item.classList.toggle("active", href === currentPage);
    });
  })();

  // ===== Steps Bar — snap to the ARROW of the active step; keep in sync on X-scroll =====
  (function () {
    function cssNum(el, varName, fallback) {
      const v = getComputedStyle(el).getPropertyValue(varName);
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : fallback;
    }

    function updateStepProgress() {
      const stepsWrapper = document.querySelector(".steps-wrapper");
      const stepsList = document.querySelector(".steps-list");
      const steps = Array.from(
        document.querySelectorAll(".steps-list .step-item")
      );
      const arrows = Array.from(
        document.querySelectorAll(".steps-list .arrow-icon")
      );
      if (!stepsWrapper || !stepsList || !steps.length || !arrows.length)
        return;

      // --- Which step is active on this page ---
      const currentPage = location.pathname.split("/").pop();
      let activeIndex = steps.findIndex(
        (s) => s.getAttribute("data-page") === currentPage
      );
      if (activeIndex < 0) activeIndex = 0;

      // --- Visual states (past steps gold) ---
      steps.forEach((step, idx) => {
        step.classList.toggle("active", idx === activeIndex);
        step.classList.toggle("complete", idx < activeIndex);
      });

      const targetArrowIdx = Math.max(
        0,
        Math.min(activeIndex, arrows.length - 1)
      );
      arrows.forEach((arrow, idx) => {
        arrow.classList.toggle("complete", idx < targetArrowIdx);
        arrow.classList.toggle("active", idx === targetArrowIdx);
      });

      // --- Measure the actual white track (::before) so the gold fill lines up exactly ---
      const wrapRect = stepsWrapper.getBoundingClientRect();
      const beforeCS = getComputedStyle(stepsWrapper, "::before");

      // left/right offsets of the white track from the wrapper’s content box
      const leftPad =
        parseFloat(beforeCS.left) ||
        parseFloat(getComputedStyle(stepsWrapper).paddingLeft) ||
        30;
      const rightPad =
        parseFloat(beforeCS.right) ||
        parseFloat(getComputedStyle(stepsWrapper).paddingRight) ||
        leftPad;

      const trackStartX = wrapRect.left + leftPad;
      const trackWidth = Math.max(1, wrapRect.width - leftPad - rightPad);

      // Center of the visible chevron icon for the target arrow
      const targetIcon =
        arrows[targetArrowIdx].querySelector("i") || arrows[targetArrowIdx];
      const iconRect = targetIcon.getBoundingClientRect();

      // Micro nudge to counter glyph side-bearing; keep tiny and resolution-aware
      const dpiAdjust = window.devicePixelRatio || 1;
      const tweakPx =
        Math.max(
          0,
          (parseFloat(getComputedStyle(targetIcon).fontSize) || 18) * 0.04
        ) / dpiAdjust;

      const arrowCenterX = iconRect.left + iconRect.width / 2 + tweakPx;

      // Clamp to the white track and write width in *pixels* for sub-pixel fidelity
      let widthPx = Math.max(
        0,
        Math.min(trackWidth, arrowCenterX - trackStartX)
      );
      widthPx = Math.round(widthPx * dpiAdjust) / dpiAdjust; // crisp on HiDPI

      stepsWrapper.style.setProperty("--step-progress", widthPx + "px");
    }

    // Bind: recalc on resize, sidebar collapse, and while the steps list is scrolled
    function bindStepProgress() {
      const stepsList = document.querySelector(".steps-list");
      const sidebar = document.getElementById("sidebar");

      let rafId = null;
      const queue = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          updateStepProgress();
        });
      };

      window.addEventListener("resize", queue);
      sidebar?.addEventListener("transitionend", (e) => {
        if (e.propertyName === "width") queue();
      });
      stepsList?.addEventListener("scroll", queue, { passive: true });

      window.addEventListener("load", updateStepProgress);
      updateStepProgress();
    }

    bindStepProgress();
  })();

  // ===== Row count label (footer) =====
  (function updateRowCount() {
    const countEl = document.getElementById("checkRowCount");
    const rows = document.querySelectorAll(".checklist-table tbody tr");
    if (countEl) countEl.textContent = `Courses in checklist: ${rows.length}`;
  })();
});

// ================= Container drag-resize + X-scroll hint (canonical) =================
(function initChecklistResizeAndHint() {
  "use strict";
  if (window.__checkBound) return; // guard against duplicate binds
  window.__checkBound = true;

  document.addEventListener("DOMContentLoaded", function () {
    const card = document.querySelector(".check-card");
    const handle = document.querySelector(".check-resize-handle");
    const tableScroll = document.querySelector(".table-scroll");
    const hint = document.getElementById("checkScrollHint");
    if (!card || !handle || !tableScroll) return;

    // ---- Utilities ----
    const rootNum = (prop) => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(
        prop
      );
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    };
    function cardMinHeightPx() {
      const n = parseFloat(getComputedStyle(card).minHeight);
      return isNaN(n) ? 240 : n;
    }
    function cardMaxHeightPx() {
      const v = getComputedStyle(card).maxHeight;
      if (v && v !== "none") {
        const n = parseFloat(v);
        if (!isNaN(n)) return n;
      }
      const bottomNav = rootNum("--bottom-nav-h");
      const footerMin = rootNum("--footer-min-h");
      const extra = rootNum("--content-bpad-extra");
      const contentPad = rootNum("--content-vpad");
      return window.innerHeight - bottomNav - footerMin - extra - contentPad;
    }

    // ---- Drag to resize (pointer) ----
    let dragging = false,
      startY = 0,
      startH = 0;

    function onPointerMove(e) {
      if (!dragging) return;
      const dy = e.clientY - startY;
      let next = Math.round(startH + dy);
      const minH = cardMinHeightPx();
      const maxH = cardMaxHeightPx();
      next = Math.max(minH, Math.min(maxH, next));
      card.style.height = next + "px";
      card.classList.add("is-resized");
      e.preventDefault();
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      handle.releasePointerCapture?.(handle._pointerId);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    }

    handle.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return; // primary only
      dragging = true;
      handle._pointerId = e.pointerId;
      handle.setPointerCapture?.(e.pointerId);
      startY = e.clientY;
      startH = Math.round(card.getBoundingClientRect().height);
      e.preventDefault();
      document.addEventListener("pointermove", onPointerMove, {
        passive: false,
      });
      document.addEventListener("pointerup", onPointerUp, { passive: true });
    });

    // Keyboard nudge
    handle.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 32 : 12;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const cur = Math.round(card.getBoundingClientRect().height);
        const delta = e.key === "ArrowUp" ? -step : step;
        let next = cur + delta;
        next = Math.max(cardMinHeightPx(), Math.min(cardMaxHeightPx(), next));
        card.style.height = next + "px";
        card.classList.add("is-resized");
        e.preventDefault();
      }
    });

    /* =========================================================
   Student Modules — Header Search (custom UI, gold hover)
   ========================================================= */
    (function initStudentSearchUI() {
      const input = document.getElementById("globalSearch");
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

      if (!input || !sidebarLinks.length) return;

      try {
        input.removeAttribute("list");
      } catch (_) {}

      input.setAttribute("autocomplete", "off");
      input.setAttribute("role", "combobox");
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", "false");

      const baseItems = sidebarLinks.map((a) => {
        const label = (
          a.querySelector("span")?.textContent ||
          a.dataset.page ||
          a.href
        ).trim();
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
          label: "Finalize",
          href: "studfinal.php",
          key: "draft",
          icon: "fa-solid fa-file-lines",
        },
        {
          label: "Final",
          href: "studfinal.php",
          key: "draft",
          icon: "fa-solid fa-file-lines",
        },
        {
          label: "Enlist",
          href: "studenlist.php",
          key: "enlistment",
          icon: "fa-solid fa-clipboard-list",
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
        dropdown.innerHTML = `<ul class="search-list" role="listbox" id="searchList"></ul>`;
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
                m.label.toLowerCase().includes(s) ||
                (m.key && m.key.includes(s))
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

    // ---- X-scroll hint: show on load if needed; hide on first interaction ----
    function isSubDesktop() {
      return window.matchMedia("(max-width: 1279px)").matches;
    }
    function needXScroll() {
      return (
        isSubDesktop() && tableScroll.scrollWidth > tableScroll.clientWidth
      );
    }

    function showHint() {
      if (!hint) return;
      if (hint.hasAttribute("hidden")) hint.removeAttribute("hidden");
      hint.dataset.open = needXScroll() ? "1" : "0";
    }
    function hideHint() {
      if (hint) hint.dataset.open = "0";
    }

    // Show after layout settles so measurements are correct
    requestAnimationFrame(() => requestAnimationFrame(showHint));

    // Hide on first interaction implying scrolling
    const hideOnce = () => {
      hideHint();
      tableScroll.removeEventListener("scroll", hideOnce);
      tableScroll.removeEventListener("wheel", hideOnce);
      tableScroll.removeEventListener("touchmove", hideOnce);
      tableScroll.removeEventListener("pointerdown", hideOnce);
    };
    tableScroll.addEventListener("scroll", hideOnce, { passive: true });
    tableScroll.addEventListener("wheel", hideOnce, { passive: true });
    tableScroll.addEventListener("touchmove", hideOnce, { passive: true });
    tableScroll.addEventListener("pointerdown", hideOnce, { passive: true });

    // Re-evaluate on resize (only auto-show if hint hasn't been dismissed)
    window.addEventListener("resize", () => {
      if (hint && hint.dataset.open !== "0") showHint();
    });
  });
})();

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
