// Admin Reports — mirrors Evaluator Reports baseline + Dept filter
// Keeps: mobile sidebar drawer, header search, bottom nav wiring,
// prev/next student chooser, table-only scroller, custom resize handle,
// once-per-session X-scroll hint, centered PDF button.

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

    let overlay = $(".sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }

    if (hdrToggle && !hdrToggle.dataset.mobileBound) {
      hdrToggle.dataset.mobileBound = "1";
      on(hdrToggle, "click", (e) => {
        if (!mqMobile.matches) return; // desktop uses collapse toggle below
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

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const hdrToggle = document.getElementById("toggleBtnHeader");
  const bottomNav = document.getElementById("bottomNav");
  const downloadBtn = document.getElementById("downloadBtn");

  /* =============== Sidebar collapse toggle (desktop) =============== */
  hdrToggle?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 768px)").matches) return; // drawer on mobile
    sidebar?.classList.toggle("collapsed");
    bottomNav?.classList.toggle("collapsed"); // mirrors sidebar width
  });

  /* =============== Active nav highlight =============== */
  (function updateActiveNavItem() {
    const currentPage = location.pathname
      .split("/")
      .pop()
      .replace(/\.(php|html)$/i, "");
    document.querySelectorAll(".sidebar-nav .nav-item").forEach((item) => {
      const href = item.querySelector("a")?.getAttribute("href") || "";
      const page = href
        .split("/")
        .pop()
        .replace(/\.(php|html)$/i, "");
      item.classList.toggle("active", page === currentPage);
    });
  })();

  /* =============== Bottom Nav wiring =============== */
  (function initBottomNav() {
    if (!bottomNav) return;
    if (bottomNav.dataset.navBound === "1") return;
    bottomNav.dataset.navBound = "1";

    const leftBtn = document.getElementById("navLeftBtn");
    const rightBtn = document.getElementById("navRightBtn");

    function go(btn, fallback) {
      if (!btn) return;
      const href = btn.getAttribute("data-href") || fallback;
      if (href) window.location.href = href;
    }

    leftBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      go(leftBtn, "admindashb.php");
    });
    rightBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      go(rightBtn, "");
    });
  })();

  /* =============== Sign out =============== */
  document.getElementById("signout-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    // TODO: attach real logout
    window.location.href = "login.html";
  });

  /* =========================================================
     Admin Header Search (combobox-style; excludes Sign out)
  ========================================================= */
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

    input.removeAttribute?.("list");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");

    const base = links.map((a) => {
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
        label: "Courses",
        href: "admincurr.php",
        key: "curriculum",
        icon: "fa-solid fa-book-open",
      },
      {
        label: "Update Curriculum",
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
      {
        label: "Students",
        href: "adminstudlist.php",
        key: "studentlist",
        icon: "fa-solid fa-list",
      },
      {
        label: "Reports",
        href: "adminreport.php",
        key: "reports",
        icon: "fa-solid fa-book-open",
      },
    ];

    const map = new Map();
    [...base, ...synonyms].forEach((m) => {
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
            }" data-href="${m.href}" data-index="${i}">
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
    input.addEventListener("blur", () => setTimeout(() => closeDd(), 120));

    apply("");
  })();

  /* =========================================================
     Student & Dept Choosers + Prev/Next
  ========================================================= */
  (function initChoosers() {
    const bar = document.querySelector(".reports-topbar");
    if (!bar) return;

    function wireCombo(rootSel) {
      const root = bar.querySelector(rootSel);
      if (!root) return null;
      const btn = root.querySelector(".combo-toggle");
      const panel = root.querySelector(".combo-panel");
      const search = root.querySelector(".combo-search input");
      const opts = Array.from(root.querySelectorAll(".combo-option"));
      const label = root.querySelector(".combo-label");

      if (!btn || !panel || !search || !opts.length || !label) return null;

      function openPanel() {
        panel.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        setTimeout(() => search.focus(), 0);
      }
      function closePanel() {
        panel.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      }
      function visibleOpts() {
        return opts.filter((li) => !li.classList.contains("hidden"));
      }
      function selectValue(txt) {
        label.textContent = txt;
        opts.forEach((li) => li.removeAttribute("aria-selected"));
        const active = opts.find(
          (li) => (li.dataset.value || li.textContent.trim()) === txt.trim()
        );
        active?.setAttribute("aria-selected", "true");
        closePanel();
        return txt;
      }

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.hidden ? openPanel() : closePanel();
      });
      document.addEventListener("click", (e) => {
        if (!root.contains(e.target)) closePanel();
      });

      opts.forEach((li) =>
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          selectValue(li.dataset.value || li.textContent.trim());
        })
      );

      search.addEventListener("input", () => {
        const q = search.value.toLowerCase();
        opts.forEach((li) => {
          const m = (li.dataset.value || li.textContent)
            .toLowerCase()
            .includes(q);
          li.classList.toggle("hidden", !m);
        });
      });

      return { selectValue, visibleOpts, label, root };
    }

    const student = wireCombo(".student-chooser");
    const dept = wireCombo(".dept-chooser");
    const nameEl = document.getElementById("reportsCurrentName");

    if (student) {
      // Initialize to first option
      const first = student.root.querySelector(".combo-option");
      if (first)
        student.selectValue(first.dataset.value || first.textContent.trim());
      // Reflect to the card name
      const obs = new MutationObserver(() => {
        if (nameEl) nameEl.textContent = student.label.textContent;
      });
      obs.observe(student.label, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
    if (dept) {
      const all = dept.root.querySelector(
        '.combo-option[data-value="All Departments"]'
      );
      if (all) dept.selectValue(all.dataset.value);
      // Hook: filter by dept on change if needed
    }

    const prev = bar.querySelector(".switch-btn.prev");
    const next = bar.querySelector(".switch-btn.next");

    const opts = () => student?.visibleOpts() || [];
    function currentIndex() {
      const arr = opts();
      const current = student?.label?.textContent?.trim() || "";
      return arr.findIndex(
        (li) => (li.dataset.value || li.textContent.trim()) === current
      );
    }

    prev?.addEventListener("click", (e) => {
      e.preventDefault();
      const arr = opts();
      if (!arr.length) return;
      let idx = currentIndex();
      if (idx < 0) idx = 0;
      idx = (idx - 1 + arr.length) % arr.length;
      student?.selectValue(
        arr[idx].dataset.value || arr[idx].textContent.trim()
      );
    });
    next?.addEventListener("click", (e) => {
      e.preventDefault();
      const arr = opts();
      if (!arr.length) return;
      let idx = currentIndex();
      if (idx < 0) idx = 0;
      idx = (idx + 1) % arr.length;
      student?.selectValue(
        arr[idx].dataset.value || arr[idx].textContent.trim()
      );
    });
  })();

  /* =========================================================
     Row window CSS vars (default 10) — canonical names
  ========================================================= */
  (function setRowWindow() {
    const scroller = document.querySelector(".admin-reports .table-scroll");
    if (!scroller) return;
    const n =
      Number(scroller.dataset.rows) ||
      Number(getComputedStyle(scroller).getPropertyValue("--report-rows")) ||
      10;
    scroller.style.setProperty("--report-rows", String(n));
  })();

  /* =========================================================
     Custom Resize Handle + X-scroll Hint (canonical)
  ========================================================= */
  (function initTableResizeAndHint() {
    const card = document.querySelector(".admin-reports .reports-card");
    const scroller = card?.querySelector(".table-scroll");
    const handle = card?.querySelector(".reports-resize-handle");
    const hint = document.getElementById("reportsScrollHint");

    if (!card || !scroller) return;

    // --- Custom resize (drag + keyboard) ---
    if (handle && !handle.dataset.bound) {
      handle.dataset.bound = "1";
      handle.setAttribute("role", "separator");
      handle.setAttribute("aria-orientation", "horizontal");
      handle.setAttribute("tabindex", "0");

      let drag = null; // {startY, startH}
      const MIN_H = 120;
      function maxH() {
        const vh = Math.max(
          document.documentElement.clientHeight,
          window.innerHeight || 0
        );
        // keep footer visible by capping to ~80% of viewport
        return Math.max(220, Math.floor(vh * 0.8));
      }
      function onMove(y) {
        if (!drag) return;
        const dy = y - drag.startY;
        let h = Math.round(drag.startH + dy);
        h = Math.max(MIN_H, Math.min(maxH(), h));
        scroller.style.height = h + "px";
        scroller.style.maxHeight = h + "px";
        card.classList.add("is-resized");
      }
      function onPointerDown(e) {
        e.preventDefault();
        const startY = e.touches ? e.touches[0].clientY : e.clientY;
        drag = { startY, startH: scroller.getBoundingClientRect().height };
        const move = (ev) =>
          onMove(ev.touches ? ev.touches[0].clientY : ev.clientY);
        const up = () => {
          drag = null;
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", up);
          window.removeEventListener("touchmove", move, { passive: false });
          window.removeEventListener("touchend", up);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", up);
      }

      handle.addEventListener("mousedown", onPointerDown);
      handle.addEventListener("touchstart", onPointerDown, { passive: false });

      handle.addEventListener("keydown", (e) => {
        const step = e.shiftKey ? 60 : 20;
        const big = 120;
        let h =
          parseInt(getComputedStyle(scroller).height, 10) ||
          scroller.getBoundingClientRect().height;
        if (e.key === "ArrowUp") h -= step;
        else if (e.key === "ArrowDown") h += step;
        else if (e.key === "PageUp") h -= big;
        else if (e.key === "PageDown") h += big;
        else if (e.key === "Home") h = 240;
        else if (e.key === "End") h = maxH();
        else return;
        e.preventDefault();
        h = Math.max(MIN_H, Math.min(maxH(), Math.round(h)));
        scroller.style.height = h + "px";
        scroller.style.maxHeight = h + "px";
        card.classList.add("is-resized");
      });

      window.addEventListener("resize", () => {
        const h = scroller.getBoundingClientRect().height;
        const clamped = Math.min(h, maxH());
        if (clamped !== h) {
          scroller.style.height = clamped + "px";
          scroller.style.maxHeight = clamped + "px";
        }
      });
    }

    // --- X-scroll hint (show once per session if overflow-x exists) ---
    function overflowsX(el) {
      return el && el.scrollWidth - el.clientWidth > 2;
    }
    function showHintOnce() {
      if (!hint) return;
      const key = "admin-reports-xhint-shown";
      if (sessionStorage.getItem(key)) return;
      if (!overflowsX(scroller)) return;
      hint.setAttribute("data-open", "1");
      setTimeout(() => hint.removeAttribute("data-open"), 2200);
      sessionStorage.setItem(key, "1");
    }
    showHintOnce();
    window.addEventListener("resize", showHintOnce);
    setTimeout(showHintOnce, 350); // after fonts/icons settle
  })();

  /* =============== Download PDF (stub) =============== */
  downloadBtn?.addEventListener("click", () => {
    console.log("Generating PDF report…");
    // TODO: wire up export
  });
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
