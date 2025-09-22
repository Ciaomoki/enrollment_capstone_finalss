document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const hdrToggle = document.getElementById("toggleBtnHeader");
  const bottomNav = document.getElementById("bottomNav");

  /* =========================================================
   Mobile Drawer Sidebar — Alignment & Toggle
   ========================================================= */
  // Keep the drawer aligned under sticky header + top bar
  function setHeaderOffset() {
    const header = document.querySelector("header");
    const topBar = document.querySelector(".top-bar");
    const headerH = header
      ? Math.round(header.getBoundingClientRect().height)
      : 64;
    const topBarH = topBar
      ? Math.round(topBar.getBoundingClientRect().height)
      : 6;
    const offset = headerH + topBarH; // CSS uses var(--header-offset)
    document.documentElement.style.setProperty(
      "--header-offset",
      offset + "px"
    );
  }
  setHeaderOffset();
  // optional: explicitly set a nudge so CSS calc can use it
  document.documentElement.style.setProperty("--sidebar-nudge", "16px");

  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

  // Create overlay for mobile drawer (ensure single instance)
  let sbOverlay = document.querySelector(".sidebar-overlay");
  if (!sbOverlay) {
    sbOverlay = document.createElement("div");
    sbOverlay.className = "sidebar-overlay";
    document.body.appendChild(sbOverlay);
  }
  sbOverlay.addEventListener("click", () => {
    document.body.classList.remove("sidebar-open");
  });

  // Toggle: drawer on mobile, collapse on desktop
  if (hdrToggle) {
    hdrToggle.addEventListener("click", () => {
      if (isMobile()) {
        setHeaderOffset(); // recalc in case header wrapped
        document.body.classList.toggle("sidebar-open");
      } else {
        if (sidebar) sidebar.classList.toggle("collapsed");
        if (bottomNav) bottomNav.classList.toggle("collapsed");
      }
    });
  }

  // Close drawer with ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.body.classList.remove("sidebar-open");
  });

  // Close drawer when a sidebar link is clicked (mobile only)
  document.querySelectorAll(".sidebar-nav a").forEach((a) => {
    a.addEventListener("click", () => {
      if (isMobile()) document.body.classList.remove("sidebar-open");
    });
  });

  // Keep states sane on resize & keep offset fresh
  window.addEventListener("resize", () => {
    setHeaderOffset();
    if (isMobile()) {
      if (sidebar) sidebar.classList.remove("collapsed");
      if (bottomNav) bottomNav.classList.remove("collapsed");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  });

  /* =========================================================
   Bottom Nav — Generic wiring (left/right + legacy + checklist alias)
   - Generic IDs: #navLeftBtn (left/back), #navRightBtn (right/next)
   - Legacy fallbacks: #dashboardBtn (left), #assessmentBtn (right)
   - Dashboard alias: #checklistBtn behaves as right button by default
   - Per-page override: set data-href on either button
   - Container defaults (optional): data-left-default / data-right-default on #bottomNav
   ========================================================= */
  (function initBottomNav() {
    if (!bottomNav) return;

    // Prefer generic IDs first
    const genericLeft = document.getElementById("navLeftBtn");
    const genericRight = document.getElementById("navRightBtn");
    // Legacy fallbacks
    const legacyLeft = document.getElementById("dashboardBtn");
    const legacyRight = document.getElementById("assessmentBtn");
    // Dashboard alias (existing single button)
    const checklistBtn = document.getElementById("checklistBtn");

    const leftBtn = genericLeft || legacyLeft || null;
    const rightBtn = genericRight || legacyRight || checklistBtn || null;

    // Defaults: container data attributes → module defaults
    // Dashboard module default: right goes to studcheck.php
    const LEFT_DEFAULT =
      bottomNav.getAttribute("data-left-default") || "studdashb.php";
    const RIGHT_DEFAULT =
      bottomNav.getAttribute("data-right-default") || "studcheck.php";

    function go(btn, fallback) {
      if (!btn) return;
      const href = btn.getAttribute("data-href") || fallback;
      if (href) window.location.href = href;
    }

    // Bind once per element
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

  /* =========================================================
   Active nav state
   ========================================================= */
  (function updateActiveNavItem() {
    const currentPage = window.location.pathname
      .split("/")
      .pop()
      .replace(".php", "");
    document.querySelectorAll(".sidebar-nav .nav-item").forEach((item) => {
      const href = item
        .querySelector("a")
        ?.getAttribute("href")
        ?.split("/")
        .pop()
        .replace(".php", "");
      item.classList.toggle("active", href === currentPage);
    });
  })();

  /* =========================================================
   Sign out
   ========================================================= */
  const signout = document.getElementById("signout-btn");
  if (signout) {
    signout.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Signing out...");
      window.location.href = "login.html";
    });
  }

  /* =========================================================
   Slideshow
   ========================================================= */
  const slideshow = document.getElementById("slideshow");
  if (slideshow) {
    const slides = Array.from(slideshow.querySelectorAll(".slide"));
    const prevBtn = document.getElementById("slidePrev");
    const nextBtn = document.getElementById("slideNext");
    let idx = 0,
      timerId = null;

    const show = (i) =>
      slides.forEach((s, k) => s.classList.toggle("active", k === i));
    const next = () => {
      idx = (idx + 1) % slides.length;
      show(idx);
    };
    const prev = () => {
      idx = (idx - 1 + slides.length) % slides.length;
      show(idx);
    };

    if (prevBtn)
      prevBtn.addEventListener("click", () => {
        prev();
        restart();
      });
    if (nextBtn)
      nextBtn.addEventListener("click", () => {
        next();
        restart();
      });

    const start = () => {
      timerId = setInterval(next, 5000);
    };
    const stop = () => {
      if (timerId) clearInterval(timerId);
    };
    const restart = () => {
      stop();
      start();
    };

    start();
  }

  /* =========================================================
   Deadline Countdown
   ========================================================= */
  const cd = document.getElementById("deadlineCountdown");
  if (cd) {
    const target = new Date(cd.dataset.deadline);
    const q = (p) => cd.querySelector(`[data-cd="${p}"]`);
    const pad = (n) => String(n).padStart(2, "0");

    function tick() {
      const now = new Date();
      let diff = Math.max(0, target - now);
      const d = Math.floor(diff / 86400000);
      diff -= d * 86400000;
      const h = Math.floor(diff / 3600000);
      diff -= h * 3600000;
      const m = Math.floor(diff / 60000);
      diff -= m * 60000;
      const s = Math.floor(diff / 1000);

      q("days").textContent = pad(d);
      q("hrs").textContent = pad(h);
      q("mins").textContent = pad(m);
      q("secs").textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* =========================================================
   Message Validator — overlay modal (matches screenshot)
   ========================================================= */
  (function setupMessageValidator() {
    const emailBtn = document.querySelector(
      ".evaluator-card .panel-actions .btn-outline"
    );
    if (!emailBtn) return;

    // Avoid duplicate overlays
    if (document.getElementById("msgval-overlay")) return;

    const evalCard = document.querySelector(".evaluator-card");
    const evalName =
      evalCard?.querySelector(".eval-name")?.textContent?.trim() || "Validator";
    const evalEmail =
      evalCard?.querySelector(".eval-meta li span")?.textContent?.trim() ||
      "validator@univ.edu";

    const overlay = document.createElement("div");
    overlay.className = "msgval-overlay";
    overlay.id = "msgval-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");

    overlay.innerHTML = `
    <div class="msgval-dialog" role="document" aria-labelledby="msgval-title">
      <div class="msgval-header">
        <div class="msgval-title" id="msgval-title">Send Message to Validator</div>
        <div class="msgval-header-actions">
          <a href="#" class="msgval-hlink" data-action="inbox">
            <i class="fa-solid fa-inbox"></i> Inbox
          </a>
          <a href="#" class="msgval-hlink" data-action="sent">
            <i class="fa-solid fa-paper-plane"></i> Sent
          </a>
        </div>
        <button class="msgval-close" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="msgval-hr"></div>

      <form class="msgval-form" novalidate>
        <div class="msgval-group">
          <label class="msgval-label" for="msgval-subject">Subject</label>
          <select class="msgval-select" id="msgval-subject" name="subject" required>
            <option value="Overload" selected>Overload</option>
            <option value="Schedule Conflict">Schedule Conflict</option>
            <option value="Prerequisite Concern">Prerequisite Concern</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="msgval-group">
          <label class="msgval-label" for="msgval-message">Message</label>
          <textarea class="msgval-textarea" id="msgval-message" name="message"
            placeholder="Write your message..."></textarea>
        </div>

        <div class="msgval-error" aria-live="polite"></div>

        <div class="msgval-actions">
          <button type="button" class="msgval-btn msgval-btn--cancel">Cancel</button>
          <button type="submit" class="msgval-btn msgval-btn--send">
            <i class="fa-solid fa-paper-plane"></i> Send
          </button>
        </div>
      </form>
    </div>
  `;

    document.body.appendChild(overlay);

    const dialog = overlay.querySelector(".msgval-dialog");
    const closeBtn = overlay.querySelector(".msgval-close");
    const cancelBtn = overlay.querySelector(".msgval-btn--cancel");
    const form = overlay.querySelector(".msgval-form");
    const errorEl = overlay.querySelector(".msgval-error");
    const subjectSelect = overlay.querySelector("#msgval-subject");
    const messageTextarea = overlay.querySelector("#msgval-message");

    // Make sure the textarea is visible when the keyboard opens on phones
    messageTextarea.addEventListener("focus", () => {
      // Scroll the dialog just enough to reveal the textarea comfortably
      const y =
        messageTextarea.getBoundingClientRect().top -
        dialog.getBoundingClientRect().top;
      dialog.scrollTo({ top: Math.max(0, y - 24), behavior: "smooth" });
    });

    // Also re-check on viewport resize (e.g., keyboard show/hide on mobile)
    window.addEventListener("resize", () => {
      if (
        document.body.classList.contains("modal-open") &&
        document.activeElement === messageTextarea
      ) {
        const y =
          messageTextarea.getBoundingClientRect().top -
          dialog.getBoundingClientRect().top;
        dialog.scrollTo({ top: Math.max(0, y - 24) });
      }
    });

    function openModal({ subject = "Overload", message = "" } = {}) {
      subjectSelect.value = subject;
      messageTextarea.value = message;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      subjectSelect.focus();
      document.body.classList.add("modal-open");
    }

    function closeModal() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      hideError();
      document.body.classList.remove("modal-open");
    }

    function showError(text) {
      errorEl.textContent = text;
      errorEl.classList.add("is-visible");
    }
    function hideError() {
      errorEl.textContent = "";
      errorEl.classList.remove("is-visible");
    }

    // Open from evaluator card
    emailBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal({ subject: "Overload" });
    });

    // Close handlers
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") closeModal();
    });

    // Form submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const subject = subjectSelect.value.trim();
      const message = messageTextarea.value.trim();

      if (!subject || !message) {
        showError("Please select a subject and enter your message.");
        return;
      }
      hideError();

      // Hook up to your API when ready
      console.log("Email validator ->", {
        to: evalEmail,
        subject,
        message,
        evaluator: evalName,
      });

      closeModal();
    });
  })();

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
   INBOX DROPDOWN — click to open, outside/Esc to close, tabs, mark read
   ========================================================= */
  (function initInboxDropdown() {
    const btn = document.getElementById("inboxBtn");
    const dd = document.getElementById("inboxDropdown");
    const badge = document.getElementById("inboxBadge");
    if (!btn || !dd) return;

    // keep positioned below the header height
    setHeaderOffset();
    window.addEventListener("resize", setHeaderOffset);

    const isOpen = () =>
      dd.classList.contains("open") && !dd.hasAttribute("hidden");

    const open = () => {
      dd.removeAttribute("hidden"); // [hidden] forces display:none !important
      dd.classList.add("open"); // CSS shows it when .open is present
      btn.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      dd.classList.remove("open");
      dd.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
    };
    const toggle = () => (isOpen() ? close() : open());

    // unread badge
    function updateBadge() {
      if (!badge) return;
      const count = dd.querySelectorAll(".message.unread").length;
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    }
    updateBadge();

    // button click
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    // outside click closes
    document.addEventListener("click", (e) => {
      if (!isOpen()) return;
      const insideDropdown = e.target.closest("#inboxDropdown");
      const onButton = e.target.closest("#inboxBtn");
      if (!insideDropdown && !onButton) close();
    });

    // Esc closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) close();
    });

    // delegate actions inside dropdown
    dd.addEventListener("click", (e) => {
      // tabs
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

      // mark all read
      if (e.target.closest("#markAllReadBtn")) {
        dd.querySelectorAll(".message.unread").forEach((li) => {
          li.classList.remove("unread");
          const dot = li.querySelector(".unread-dot");
          if (dot) dot.style.display = "none";
        });
        updateBadge();
        return;
      }

      // clicking a message marks it read for badge purposes
      const msgRow = e.target.closest(".message-row");
      if (msgRow) {
        const li = msgRow.closest(".message");
        if (li && li.classList.contains("unread")) {
          li.classList.remove("unread");
          const dot = li.querySelector(".unread-dot");
          if (dot) dot.style.display = "none";
          updateBadge();
        }
      }
    });
  })();
});
