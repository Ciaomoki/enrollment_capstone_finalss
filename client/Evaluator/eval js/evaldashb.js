// ================== Mobile-only header ⇄ sidebar drawer (safe per page) ==================
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

    // Ensure single overlay exists
    let overlay = $(".sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }

    // Bind button — mobile only
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

    // Breakpoint sanity
    mqMobile.addEventListener?.("change", (evt) => {
      if (!evt.matches) document.body.classList.remove("sidebar-open");
    });
  });
})();

// ================== Evaluator Dashboard main bindings ==================
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const hdrToggle = document.getElementById("toggleBtnHeader");
  const bottomNav = document.getElementById("bottomNav");

  // Sidebar collapse (desktop)
  hdrToggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("collapsed");
    bottomNav?.classList.toggle("collapsed");
  });

  /* ---------------- Bottom Nav — defaults to Student List ----------------
     - Supports global IDs: #navLeftBtn / #navRightBtn (if present)
     - Page-level defaults via data-left-default / data-right-default on #bottomNav
     - Fallbacks: both → evalstudlist.php
  ------------------------------------------------------------------------ */
  (function initBottomNav() {
    if (!bottomNav) return;
    if (bottomNav.dataset.navBound === "1") return;
    bottomNav.dataset.navBound = "1";

    const leftBtn = document.getElementById("navLeftBtn") || null;
    const rightBtn = document.getElementById("navRightBtn") || null;

    const LEFT_DEFAULT =
      bottomNav.getAttribute("data-left-default") || "evalstudlist.php";
    const RIGHT_DEFAULT =
      bottomNav.getAttribute("data-right-default") || "evalstudlist.php";

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

  // Sign out (demo)
  document.getElementById("signout-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "login.html";
  });

  // Quick actions
  document.querySelectorAll(".qa-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switch (btn.dataset.action) {
        case "assigned-students":
          window.location.href = "evalstudlist.php";
          break;
        case "validate-pre":
          window.location.href = "evalval.php";
          break;
        case "download-reports":
          window.location.href = "evalreport.php";
          break;
      }
    });
  });

  /* ---------------- Evaluator header search (combobox) ---------------- */
  (function initEvaluatorSearchUI() {
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

    const base = links.map((a) => {
      const label = (
        a.querySelector("span")?.textContent ||
        a.dataset.page ||
        a.href
      ).trim();
      const icon = a.querySelector("i")
        ? Array.from(a.querySelector("i").classList).join(" ")
        : "fa-solid fa-square";
      return {
        label,
        href: a.getAttribute("href"),
        key: (a.dataset.page || label).toLowerCase(),
        icon,
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
    [...base, ...synonyms].forEach((m) => {
      const k = `${m.label.toLowerCase()}|${m.href}`;
      if (!map.has(k)) map.set(k, m);
    });
    const ITEMS = Array.from(map.values());

    const host = input.closest(".header-search") || input.parentElement;
    let dropdown = host.querySelector(".search-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-dropdown";
      dropdown.innerHTML = `<ul class="search-list" role="listbox" id="evalSearchList"></ul>`;
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
    input.addEventListener("blur", () => setTimeout(() => closeDd(), 120));

    apply("");
  })();

  /* ---------------- Countdown manager (parity with admin) ---------------- */
  (function initCountdowns() {
    const nodes = Array.from(document.querySelectorAll("[data-deadline]"));
    if (!nodes.length) return;

    const pad = (n) => String(n).padStart(2, "0");

    function parseDeadline(str) {
      if (!str) return null;
      let d = new Date(str);
      if (isNaN(d)) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
        if (m)
          d = new Date(
            Number(m[1]),
            Number(m[2]) - 1,
            Number(m[3]),
            23,
            59,
            59,
            0
          );
      }
      return isNaN(d) ? null : d;
    }

    const items = nodes
      .map((el) => {
        const target = parseDeadline(el.getAttribute("data-deadline"));
        if (!target) {
          el.setAttribute("data-cd-error", "bad-date");
          return null;
        }
        return {
          el,
          target: target.getTime(),
          parts: {
            days: el.querySelector('[data-cd="days"]'),
            hrs: el.querySelector('[data-cd="hrs"]'),
            mins: el.querySelector('[data-cd="mins"]'),
            secs: el.querySelector('[data-cd="secs"]'),
          },
          finishText: el.getAttribute("data-finish-text") || "",
        };
      })
      .filter(Boolean);

    let timerId = null;

    function renderOne(it, now) {
      let diff = Math.max(0, it.target - now);
      const d = Math.floor(diff / 86400000);
      diff -= d * 86400000;
      const h = Math.floor(diff / 3600000);
      diff -= h * 3600000;
      const m = Math.floor(diff / 60000);
      diff -= m * 60000;
      const s = Math.floor(diff / 1000);

      it.parts.days && (it.parts.days.textContent = pad(d));
      it.parts.hrs && (it.parts.hrs.textContent = pad(h));
      it.parts.mins && (it.parts.mins.textContent = pad(m));
      it.parts.secs && (it.parts.secs.textContent = pad(s));

      const due = it.target - now <= 0;
      it.el.classList.toggle(
        "is-warning",
        it.target - now <= 24 * 3600 * 1000 && !due
      );
      it.el.classList.toggle("is-due", due);

      if (due && it.finishText && !it.el.dataset.cdFinished) {
        it.el.dataset.cdFinished = "1";
        it.el.setAttribute("aria-live", "polite");
        it.el
          .querySelectorAll(".cd-val")
          .forEach((n) => (n.textContent = "00"));
        const label = it.el.querySelector(".cd-label") || it.el;
        label.textContent = it.finishText;
      }
    }

    function tick() {
      const now = Date.now();
      items.forEach((it) => renderOne(it, now));
    }
    tick();
    timerId = setInterval(tick, 1000);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(timerId);
        timerId = null;
      } else {
        tick();
        timerId = setInterval(tick, 1000);
      }
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
