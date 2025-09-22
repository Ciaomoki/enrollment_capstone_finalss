// ===== Mobile-only header ⇄ sidebar drawer =====
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

document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const hdrToggle = document.getElementById("toggleBtnHeader");
  const bottomNav = document.getElementById("bottomNav");
  const evaluatorsBtn = document.getElementById("evaluatorsBtn");
  const studentListBtn = document.getElementById("studentListBtn");

  // Toggle Sidebar (desktop collapse)
  hdrToggle?.addEventListener("click", () => {
    const mqMobile = window.matchMedia("(max-width: 768px)");
    if (mqMobile.matches) return;
    sidebar?.classList.toggle("collapsed");
    bottomNav?.classList.toggle("collapsed");
  });

  // ===== Bottom Nav wiring =====
  (function initBottomNav() {
    if (!bottomNav) return;
    if (bottomNav.dataset.navBound === "1") return;
    bottomNav.dataset.navBound = "1";

    const leftBtn = document.getElementById("navLeftBtn") || null;
    const rightBtn = document.getElementById("navRightBtn") || null;

    const LEFT_DEFAULT =
      bottomNav.getAttribute("data-left-default") || "admineval.php";
    const RIGHT_DEFAULT =
      bottomNav.getAttribute("data-right-default") || "adminstudlist.php";

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

  // Navigation Buttons
  evaluatorsBtn?.addEventListener(
    "click",
    () => (window.location.href = "admineval.php")
  );
  studentListBtn?.addEventListener(
    "click",
    () => (window.location.href = "adminstudlist.php")
  );

  // Update sidebar active nav item
  (function updateActiveNavItem() {
    const currentPage = window.location.pathname
      .split("/")
      .pop()
      .replace(".php", "");
    document.querySelectorAll(".sidebar-nav .nav-item").forEach((item) => {
      const link = item.querySelector("a");
      if (!link) return;
      const href = (link.getAttribute("href") || "")
        .split("/")
        .pop()
        .replace(".php", "");
      item.classList.toggle("active", href === currentPage);
    });
  })();

  // Sign out
  document.getElementById("signout-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "login.html";
  });

  // ===== Drag & drop visual affordances =====
  const dropzones = document.querySelectorAll(".dropzone");
  dropzones.forEach((dropzone) => {
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.style.borderColor = "#FFD700";
      dropzone.style.backgroundColor = "rgba(255, 215, 0, 0.2)";
    });
    dropzone.addEventListener("dragleave", () => {
      dropzone.style.borderColor = "#0c2d52";
      dropzone.style.backgroundColor = "";
    });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.style.borderColor = "#0c2d52";
      dropzone.style.backgroundColor = "";
      if (e.dataTransfer.files.length) {
        const fileInput = dropzone.querySelector(".file-input");
        if (fileInput) {
          fileInput.files = e.dataTransfer.files;
          fileInput.dispatchEvent(new Event("change"));
        }
      }
    });
  });

  // ===== Custom Toasts (theme-aligned) =====
  function showToast(type, message) {
    const host = document.getElementById("toastHost");
    if (!host) return alert(message); // safety fallback
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${
        type === "success"
          ? "fa-circle-check"
          : type === "warning"
          ? "fa-triangle-exclamation"
          : "fa-circle-xmark"
      }"></i>
      <span>${message}</span>
      <button type="button" class="toast-close" aria-label="Close">&times;</button>
    `;
    host.appendChild(toast);
    const timer = setTimeout(() => toast.remove(), 5000);
    toast.querySelector(".toast-close").addEventListener("click", () => {
      clearTimeout(timer);
      toast.remove();
    });
  }

  // ===== Admin Data Import → Node API wiring =====
  (function wireAdminDataImportToNode() {
    const API_BASE = "http://localhost:4000/api/import";

    // utilities
    function fmtBytes(n) {
      if (!Number.isFinite(n)) return "";
      const u = ["B", "KB", "MB", "GB"];
      let i = 0;
      while (n >= 1024 && i < u.length - 1) {
        n /= 1024;
        i++;
      }
      return `${n.toFixed(n > 10 || i === 0 ? 0 : 1)} ${u[i]}`;
    }

    function buildPill(host, file) {
      host.innerHTML = "";
      const pill = document.createElement("div");
      pill.className = "attach-pill";
      pill.innerHTML = `
        <div class="attach-name" title="${file.name}">${file.name}</div>
        <div class="attach-meta">
          <span>${fmtBytes(file.size)}</span>
          <span class="attach-pct">0%</span>
          <button type="button" class="attach-remove" title="Remove">&times;</button>
        </div>
        <div class="attach-progress"><span style="width:0%"></span></div>
      `;
      host.appendChild(pill);
      pill.querySelector(".attach-remove").addEventListener("click", () => {
        host.innerHTML = "";
        const form = host.closest("form");
        const input = form?.querySelector(".file-input");
        const btn = form?.querySelector(".btn-submit");
        if (input) input.value = "";
        if (btn) btn.setAttribute("disabled", "true");
      });
      return {
        fill: pill.querySelector(".attach-progress > span"),
        pct: pill.querySelector(".attach-pct"),
        pill,
      };
    }

    // Pre-upload read progress using FileReader (must reach 100% to enable Upload)
    async function runPreReadProgress(file, progress, btn) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const p = Math.max(1, Math.round((e.loaded / e.total) * 100));
            progress.fill.style.width = p + "%";
            progress.pct.textContent = p + "%";
          }
        };
        reader.onload = () => {
          progress.fill.style.width = "100%";
          progress.pct.textContent = "100%";
          progress.pill.setAttribute("data-stage", "ready"); // visual state
          btn?.removeAttribute("disabled");
          resolve();
        };
        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };
        // Read as array buffer to trigger progressive events
        reader.readAsArrayBuffer(file);
      });
    }

    document.querySelectorAll(".import-form").forEach((form) => {
      const input = form.querySelector(".file-input");
      const zone = form.querySelector(".dropzone");
      const host = form.querySelector(".attachments");
      const btn = form.querySelector(".btn-submit");
      const type = form.getAttribute("data-import-type"); // 'grades' | 'schedules'
      let inflight = false; // prevent double-submit

      input?.addEventListener("change", async () => {
        if (!input.files || !input.files[0]) {
          host.innerHTML = "";
          btn?.setAttribute("disabled", "true");
          return;
        }
        const file = input.files[0];
        const progress = buildPill(host, file);

        // highlight dropzone
        if (zone) {
          zone.style.borderColor = "#FFD700";
          zone.style.backgroundColor = "rgba(255, 215, 0, 0.1)";
        }

        // Pre-upload reader progress
        btn?.setAttribute("disabled", "true");
        try {
          await runPreReadProgress(file, progress, btn);
        } catch (err) {
          console.error(err);
          showToast("error", "Could not prepare file. Please try again.");
          btn?.setAttribute("disabled", "true");
        }
      });

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (inflight) return; // block double-submits
        const file = input?.files?.[0];
        if (!file) return;

        inflight = true;
        btn?.setAttribute("disabled", "true");

        // Reuse existing pill; switch to "uploading" stage
        const pillEls = host.querySelector(".attach-pill");
        const fill = pillEls?.querySelector(".attach-progress > span");
        const pctEl = pillEls?.querySelector(".attach-pct");
        pillEls?.setAttribute("data-stage", "uploading");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE}/${encodeURIComponent(type)}`, true);

        xhr.upload.addEventListener("progress", (evt) => {
          if (!evt.lengthComputable) return;
          const p = Math.round((evt.loaded / evt.total) * 100);
          if (fill) fill.style.width = p + "%";
          if (pctEl) pctEl.textContent = p + "%";
        });

        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4) return;

          try {
            const res = JSON.parse(xhr.responseText || "{}");
            if (xhr.status === 200 && res.success) {
              // Final visual state
              if (fill) fill.style.width = "100%";
              if (pctEl) pctEl.textContent = "100%";
              pillEls?.setAttribute("data-stage", "done");

              if (res.duplicate) {
                showToast(
                  "warning",
                  `Duplicate detected. Reused existing upload.`
                );
              } else {
                showToast(
                  "success",
                  `Uploaded ${res.originalName || file.name} successfully.`
                );
              }
            } else {
              pillEls?.setAttribute("data-stage", "error");
              showToast(
                "error",
                res.error
                  ? `Upload failed: ${res.error}`
                  : `Upload failed (HTTP ${xhr.status})`
              );
            }
          } catch {
            pillEls?.setAttribute("data-stage", "error");
            showToast("error", "Unexpected response from server.");
          } finally {
            inflight = false;
            // Re-enable choose to allow a new file; keep Upload disabled until new pre-read completes
            btn?.setAttribute("disabled", "true");
          }
        };

        const fd = new FormData();
        fd.append("file", file, file.name);
        xhr.send(fd);
      });
    });
  })();

  // ===== Admin Search UI (unchanged) =====
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
    if (!host) return;

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
            <button type="button"
                    class="search-item${idx === activeIndex ? " active" : ""}"
                    data-href="${m.href}"
                    data-index="${idx}">
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
});

// === Inbox Dropdown (unchanged) =========================================
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
