/* =========================================================
   Admin Dashboard JS — keeps existing behavior + new modal
   ========================================================= */

/* ---------- Mobile-only sidebar drawer (safe per page) ---------- */
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

/* ---------- Main bindings ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const hdrToggle = document.getElementById("toggleBtnHeader");
  const bottomNav = document.getElementById("bottomNav");
  const evaluatorsBtn = document.getElementById("evaluatorsBtn"); // optional

  // Sidebar collapse (desktop)
  if (hdrToggle) {
    hdrToggle.addEventListener("click", () => {
      if (sidebar) sidebar.classList.toggle("collapsed");
      if (bottomNav) bottomNav.classList.toggle("collapsed");
    });
  }

  /* ---------- Bottom Nav wiring ---------- */
  (function initBottomNav() {
    if (!bottomNav) return;
    if (bottomNav.dataset.navBound === "1") return;
    bottomNav.dataset.navBound = "1";

    const leftBtn = document.getElementById("navLeftBtn") || null;
    const rightBtn = document.getElementById("navRightBtn") || null;

    const LEFT_DEFAULT = bottomNav.getAttribute("data-left-default") || "";
    const RIGHT_DEFAULT =
      bottomNav.getAttribute("data-right-default") || "admineval.php";

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

  // Evaluators Button Navigation (optional)
  if (evaluatorsBtn) {
    evaluatorsBtn.addEventListener(
      "click",
      () => (window.location.href = "admineval.php")
    );
  }

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
      if (href === currentPage) item.classList.add("active");
      else item.classList.remove("active");
    });
  })();

  // Sign out (demo)
  const signout = document.getElementById("signout-btn");
  if (signout) {
    signout.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "login.html";
    });
  }

  /* ---------- Quick actions ---------- */
  document.querySelectorAll(".qa-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      switch (action) {
        case "import":
          window.location.href = "admindataim.php";
          break;
        case "approve-eval":
          window.location.href = "admineval.php";
          break;
        case "monitor":
          window.location.href = "adminstudlist.php";
          break;
        case "reports":
          window.location.href = "adminreport.php";
          break;
      }
    });
  });

  /* ---------- Admin header search (combobox) ---------- */
  (function initAdminSearchUI() {
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
        /sign-?out|log-?out/.test(href) ||
        page === "signout";
      const excluded = a.getAttribute("data-search") === "exclude";
      return !isSignOut && !excluded;
    });
    if (!sidebarLinks.length) return;

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
            <i class="${m.icon}"></i>
            <span>${m.label}</span>
            <kbd>↵</kbd>
          </button>
        </li>
      `
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
    input.addEventListener("blur", () =>
      setTimeout(() => closeDropdown(), 120)
    );
    applyFilter("");
  })();

  /* ---------- Countdown manager ---------- */
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

      if (it.parts.days) it.parts.days.textContent = pad(d);
      if (it.parts.hrs) it.parts.hrs.textContent = pad(h);
      if (it.parts.mins) it.parts.mins.textContent = pad(m);
      if (it.parts.secs) it.parts.secs.textContent = pad(s);
      if (!it.parts.days && !it.parts.hrs && !it.parts.mins && !it.parts.secs) {
        it.el.textContent = `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
      }

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
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      } else {
        tick();
        timerId = setInterval(tick, 1000);
      }
    });
  })();

  /* =========================================================
     FLAGGED ASSESSMENT PREVIEW — Modal
     ========================================================= */

  // Demo data (replace with server data as needed)
  const ASSESSMENT_DATA = {
    "stu-001": {
      studentName: "Maria Santos",
      studentMeta: "BSIT 501A • 2025-0001",
      evaluator: { name: "Arvin Cruz", email: "acruz@college.edu" },
      remarks: "Overload in scheduled units. Please review and adjust.",
      rows: [
        [
          "001749",
          "CTIE1008",
          "App Development",
          "3",
          "Wed",
          "8–11am",
          "BSIT 501A",
        ],
        [
          "001750",
          "CTIE1009",
          "Systems Development",
          "3",
          "Fri",
          "1–4pm",
          "BSIT 501B",
        ],
        [
          "001751",
          "CTIE1010",
          "Database Systems",
          "3",
          "Mon",
          "10–1pm",
          "BSIT 502A",
        ],
        [
          "001752",
          "CTIE1011",
          "UX/UI Design",
          "3",
          "Tue",
          "9–12pm",
          "BSIT 503",
        ],
        [
          "001753",
          "CTIE1012",
          "Mobile Development",
          "3",
          "Thu",
          "10–1pm",
          "BSIT 504",
        ],
        [
          "001754",
          "CTIE1013",
          "Capstone Project",
          "3",
          "Fri",
          "2–5pm",
          "BSIT 505",
        ],
        [
          "001755",
          "CTIE1014",
          "Network Security",
          "3",
          "Mon",
          "1–4pm",
          "BSIT 502B",
        ],
        [
          "001756",
          "CTIE1015",
          "Cloud Computing",
          "3",
          "Wed",
          "2–5pm",
          "BSIT 503",
        ],
        ["001757", "CTIE1016", "Data Mining", "3", "Thu", "8–11am", "BSIT 504"],
        [
          "001758",
          "CTIE1017",
          "AI Fundamentals",
          "3",
          "Tue",
          "1–4pm",
          "BSIT 505",
        ],
      ],
    },
    "stu-002": {
      studentName: "J. Dela Cruz",
      studentMeta: "BSIT 502B • 2025-0002",
      evaluator: { name: "Kyla Lim", email: "klim@college.edu" },
      remarks: "Duplicate course detected: CTIE1010 listed twice.",
      rows: [
        [
          "001751",
          "CTIE1010",
          "Database Systems",
          "3",
          "Mon",
          "10–1pm",
          "BSIT 502A",
        ],
        [
          "001751",
          "CTIE1010",
          "Database Systems",
          "3",
          "Thu",
          "10–1pm",
          "BSIT 502A",
        ],
        [
          "001752",
          "CTIE1011",
          "UX/UI Design",
          "3",
          "Tue",
          "9–12pm",
          "BSIT 503",
        ],
        [
          "001756",
          "CTIE1015",
          "Cloud Computing",
          "3",
          "Wed",
          "2–5pm",
          "BSIT 503",
        ],
        ["001757", "CTIE1016", "Data Mining", "3", "Thu", "8–11am", "BSIT 504"],
        [
          "001758",
          "CTIE1017",
          "AI Fundamentals",
          "3",
          "Tue",
          "1–4pm",
          "BSIT 505",
        ],
        [
          "001759",
          "CTIE1018",
          "Web Frameworks",
          "3",
          "Fri",
          "8–11am",
          "BSIT 502B",
        ],
        [
          "001760",
          "CTIE1019",
          "Security Lab",
          "2",
          "Fri",
          "1–3pm",
          "BSIT 502B",
        ],
        ["001761", "CTIE1020", "Cloud Lab", "2", "Wed", "5–7pm", "BSIT 503"],
        ["001762", "CTIE1021", "Data Viz", "3", "Tue", "9–12pm", "BSIT 503"],
      ],
    },
    "stu-003": {
      studentName: "Paolo Reyes",
      studentMeta: "BSIT 503 • 2025-0003",
      evaluator: { name: "Mina Tan", email: "mtan@college.edu" },
      remarks: "Prerequisite not met for CTIE1013 (Capstone).",
      rows: [
        [
          "001753",
          "CTIE1012",
          "Mobile Development",
          "3",
          "Thu",
          "10–1pm",
          "BSIT 504",
        ],
        [
          "001754",
          "CTIE1013",
          "Capstone Project",
          "3",
          "Fri",
          "2–5pm",
          "BSIT 505",
        ],
        [
          "001751",
          "CTIE1010",
          "Database Systems",
          "3",
          "Mon",
          "10–1pm",
          "BSIT 502A",
        ],
        [
          "001760",
          "CTIE1019",
          "Security Lab",
          "2",
          "Fri",
          "1–3pm",
          "BSIT 502B",
        ],
        ["001761", "CTIE1020", "Cloud Lab", "2", "Wed", "5–7pm", "BSIT 503"],
        ["001762", "CTIE1021", "Data Viz", "3", "Tue", "9–12pm", "BSIT 503"],
        ["001763", "CTIE1022", "Ethics in IT", "2", "Mon", "7–9pm", "BSIT 503"],
        ["001764", "CTIE1023", "Project Mgt", "2", "Sat", "8–10am", "BSIT 503"],
        [
          "001765",
          "CTIE1024",
          "Research Methods",
          "2",
          "Sat",
          "10–12pm",
          "BSIT 503",
        ],
        [
          "001766",
          "CTIE1025",
          "DevOps Basics",
          "3",
          "Thu",
          "1–4pm",
          "BSIT 503",
        ],
      ],
    },
    "stu-004": {
      studentName: "A. Villanueva",
      studentMeta: "BSIT 504 • 2025-0004",
      evaluator: { name: "Ramon Gomez", email: "rgomez@college.edu" },
      remarks: "Schedule conflict between Tue 9–12 and Tue 10–1.",
      rows: [
        [
          "001752",
          "CTIE1011",
          "UX/UI Design",
          "3",
          "Tue",
          "9–12pm",
          "BSIT 503",
        ],
        [
          "001751",
          "CTIE1010",
          "Database Systems",
          "3",
          "Tue",
          "10–1pm",
          "BSIT 502A",
        ],
        [
          "001760",
          "CTIE1019",
          "Security Lab",
          "2",
          "Fri",
          "1–3pm",
          "BSIT 502B",
        ],
        ["001761", "CTIE1020", "Cloud Lab", "2", "Wed", "5–7pm", "BSIT 503"],
        ["001762", "CTIE1021", "Data Viz", "3", "Tue", "9–12pm", "BSIT 503"],
        ["001763", "CTIE1022", "Ethics in IT", "2", "Mon", "7–9pm", "BSIT 503"],
        ["001764", "CTIE1023", "Project Mgt", "2", "Sat", "8–10am", "BSIT 503"],
        [
          "001765",
          "CTIE1024",
          "Research Methods",
          "2",
          "Sat",
          "10–12pm",
          "BSIT 503",
        ],
        [
          "001766",
          "CTIE1025",
          "DevOps Basics",
          "3",
          "Thu",
          "1–4pm",
          "BSIT 503",
        ],
        ["001767", "CTIE1026", "QA Testing", "3", "Wed", "8–11am", "BSIT 503"],
      ],
    },
  };

  /* ---- modal elements ---- */
  const modal = document.getElementById("flaggedPreview");
  const overlay = modal?.querySelector(".fp-overlay");
  const btnClose = modal?.querySelector(".fp-close");
  const tblWrap = modal?.querySelector("#fpTableWrap");
  const tblBody = modal?.querySelector("#fpTableBody");
  const resizeHandle = modal?.querySelector("#fpResizeHandle");
  const tableCard = modal?.querySelector("#fpTableCard");

  const studentNameEl = modal?.querySelector("#fpStudentName");
  const studentMetaEl = modal?.querySelector("#fpStudentMeta");
  const evalNameEl = modal?.querySelector("#fpAssigneeName");
  const evalEmailEl = modal?.querySelector("#fpAssigneeEmail");
  const remarksEl = modal?.querySelector("#fpRemarks");
  const msgEl = modal?.querySelector("#fpMessage");
  const sendBtn = modal?.querySelector("#fpSendBtn");

  function renderRows(rows) {
    tblBody.innerHTML = rows
      .map(
        (r) => `
      <tr>
        <td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>
        <td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td>${r[6]}</td>
      </tr>
    `
      )
      .join("");
  }

  function openFlaggedModal(studentId, fallback) {
    if (!modal) return;
    const data = ASSESSMENT_DATA[studentId] || fallback;
    if (!data) return;

    studentNameEl.textContent = data.studentName || "Student";
    studentMetaEl.textContent = data.studentMeta || "";
    evalNameEl.textContent = data.evaluator?.name || "—";
    evalEmailEl.textContent = data.evaluator?.email || "—";
    remarksEl.textContent = data.remarks || "—";
    renderRows(data.rows || []);

    // reset size state
    tableCard?.classList.remove("is-resized");
    tblWrap.style.maxHeight = ""; // CSS controls first
    modal.setAttribute("aria-hidden", "false");

    // initialize horizontal scroll hint
    initFlaggedTableScrollHint(modal);
  }

  function closeFlaggedModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    const evt = new CustomEvent("fp:close");
    modal.dispatchEvent(evt);
  }

  // Bind open on panel rows
  document.querySelectorAll(".panel-flagged .modal-trigger").forEach((row) => {
    row.addEventListener("click", () => {
      const id = row.dataset.studentId;
      const fallback = {
        studentName: row.dataset.student || "Student",
        studentMeta: row.dataset.section || "",
        evaluator: { name: row.dataset.evaluator || "—", email: "—" },
        remarks: row.dataset.remarks || "—",
        rows: [],
      };
      openFlaggedModal(id, fallback);
    });
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        row.click();
      }
    });
  });

  // Close handlers
  overlay?.addEventListener("click", closeFlaggedModal);
  btnClose?.addEventListener("click", closeFlaggedModal);
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      modal &&
      modal.getAttribute("aria-hidden") === "false"
    )
      closeFlaggedModal();
  });

  // Send message (same ids structure as evaluators module: fpSendBtn & fpMessage)
  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      const body = (msgEl?.value || "").trim();
      if (!body) {
        alert("Please enter a message before sending.");
        msgEl?.focus();
        return;
      }
      alert("Message sent to the evaluator.");
      if (msgEl) msgEl.value = "";
    });
  }

  // Resize handle drag to expand table area (like StudList/Curr)
  if (resizeHandle && tblWrap && tableCard) {
    let startY = 0,
      startH = 0,
      dragging = false;

    function onDown(e) {
      dragging = true;
      tableCard.classList.add("is-resized");
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      startH = tblWrap.getBoundingClientRect().height;
      document.addEventListener("mousemove", onMove);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("mouseup", onUp, { once: true });
      document.addEventListener("touchend", onUp, { once: true });
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const delta = y - startY;
      const next = Math.max(
        160,
        Math.min(window.innerHeight * 0.7, startH + delta)
      );
      tblWrap.style.maxHeight = next + "px";
      e.preventDefault();
    }
    function onUp() {
      dragging = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onMove);
    }

    resizeHandle.addEventListener("mousedown", onDown);
    resizeHandle.addEventListener("touchstart", onDown, { passive: false });
  }

  // Modal-local horizontal scroll hint
  function initFlaggedTableScrollHint(modalEl) {
    const wrap = modalEl.querySelector(".fp-table-wrap");
    const hint = modalEl.querySelector("#fpScrollHint");
    if (!wrap || !hint) return;

    function evaluate() {
      const canScroll = wrap.scrollWidth > wrap.clientWidth + 2;
      hint.dataset.open = canScroll ? "1" : "0";
      if (canScroll) {
        const hide = () => (hint.dataset.open = "0");
        wrap.addEventListener("pointerdown", hide, { once: true });
        wrap.addEventListener("scroll", hide, { once: true });
        setTimeout(hide, 2200);
      }
    }
    evaluate();
    const ro = new ResizeObserver(evaluate);
    ro.observe(wrap);
    const onWin = () => evaluate();
    window.addEventListener("resize", onWin);

    modalEl.addEventListener(
      "fp:close",
      () => {
        ro.disconnect();
        window.removeEventListener("resize", onWin);
      },
      { once: true }
    );
  }
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
