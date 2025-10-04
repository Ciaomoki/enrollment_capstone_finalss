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
  // Hide delete modal on load to prevent startup popup
  const deleteModal = document.getElementById("deleteConfirmationModal");
  if (deleteModal) {
    deleteModal.style.display = "none";
    deleteModal.dataset.fileId = "";
  }

  // Hide preview modal on load
  const previewModal = document.getElementById("filePreviewModal");
  if (previewModal) {
    previewModal.style.display = "none";
  }

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

  // ===== Load uploaded files on page load =====
  loadUploadedFiles("grades");
  loadUploadedFiles("schedules");

  const cancelGradesBtn = document.getElementById("cancelGradesBtn");
  const cancelSchedulesBtn = document.getElementById("cancelSchedulesBtn");

  let currentType = ""; // 'grades' or 'schedules'

  // Manage buttons
  document.querySelectorAll(".manage-imports-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      currentType = e.currentTarget.dataset.type;
      showManageModal();
    });
  });

  // Delete confirmation modal elements
  const deleteModalClose = document.getElementById("deleteModalClose");
  const deleteCancelBtn = document.getElementById("deleteCancelBtn");
  const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");

  // Delete modal event listeners
  deleteModalClose?.addEventListener("click", () => {
    deleteModal.style.display = "none";
  });
  deleteCancelBtn?.addEventListener("click", () => {
    deleteModal.style.display = "none";
  });
  deleteConfirmBtn?.addEventListener("click", async () => {
    const fileId = deleteModal.dataset.fileId;
    if (!fileId) return;
    deleteModal.style.display = "none";

    try {
      const deleteUrl = `http://localhost:4000/api/import/uploads/${encodeURIComponent(fileId)}`;
      const deleteRes = await fetch(deleteUrl, {
        method: 'DELETE',
        credentials: "include",
        headers: { "X-Requested-With": "fetch" },
      });

      if (!deleteRes.ok) throw new Error(`Delete failed: ${deleteRes.status}`);

      const deleteData = await deleteRes.json();
      if (deleteData.success) {
        showToast("File deleted successfully.", "success");
        // Refresh the files list
        loadUploadedFiles(currentType);
      } else {
        throw new Error(deleteData.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete file: ' + err.message, "error");
    }
  });

  // Close delete modal on outside click or escape
  deleteModal?.addEventListener("click", (e) => {
    if (e.target === deleteModal) deleteModal.style.display = "none";
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && deleteModal.style.display === "flex") {
      deleteModal.style.display = "none";
    }
  });

  // Tab switching for grades modal
  const gradesTabBtns = document.querySelectorAll("#manageGradesModal .tab-btn");
  const gradesTabContents = document.querySelectorAll("#manageGradesModal .tab-content");
  const confirmGradesBtn = document.getElementById("confirmGradesBtn");
  const addGradesFile = document.getElementById("addGradesFile");
  const addGradesAttachments = document.getElementById("addGradesAttachments");
  const storedGradesList = document.getElementById("storedGradesList");

  gradesTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      gradesTabBtns.forEach(b => b.classList.remove("active"));
      gradesTabContents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(target + "GradesTab").classList.add("active");
      // Update confirm button text
      confirmGradesBtn.textContent = target === "add" ? "Add Files" : "Remove Files";
      confirmGradesBtn.disabled = true;

      // Clear any existing attachments when switching tabs
      if (target === "add") {
        addGradesAttachments.innerHTML = "";
        if (addGradesFile) addGradesFile.value = "";
      } else if (target === "remove") {
        addGradesAttachments.innerHTML = "";
        if (addGradesFile) addGradesFile.value = "";
        // Show stored files when switching to remove tab
        showStoredFiles("grades");
      }
    });
  });

  // Tab switching for schedules modal
  const schedulesTabBtns = document.querySelectorAll("#manageSchedulesModal .tab-btn");
  const schedulesTabContents = document.querySelectorAll("#manageSchedulesModal .tab-content");
  const confirmSchedulesBtn = document.getElementById("confirmSchedulesBtn");
  const addSchedulesFile = document.getElementById("addSchedulesFile");
  const addSchedulesAttachments = document.getElementById("addSchedulesAttachments");
  const storedSchedulesList = document.getElementById("storedSchedulesList");

  schedulesTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      schedulesTabBtns.forEach(b => b.classList.remove("active"));
      schedulesTabContents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(target + "SchedulesTab").classList.add("active");
      // Update confirm button text
      confirmSchedulesBtn.textContent = target === "add" ? "Add Files" : "Remove Files";
      confirmSchedulesBtn.disabled = true;

      // Clear any existing attachments when switching tabs
      if (target === "add") {
        addSchedulesAttachments.innerHTML = "";
        if (addSchedulesFile) addSchedulesFile.value = "";
      } else if (target === "remove") {
        addSchedulesAttachments.innerHTML = "";
        if (addSchedulesFile) addSchedulesFile.value = "";
        // Show stored files when switching to remove tab
        showStoredFiles("schedules");
      }
    });
  });

  // Function to show stored files in the remove tab
  async function showStoredFiles(type) {
    const storedList = type === "grades" ? storedGradesList : storedSchedulesList;
    if (!storedList) return;

    try {
      const url = `http://localhost:4000/api/import/uploads/${type}`;
      const res = await fetch(url, {
        credentials: "include",
        headers: { "X-Requested-With": "fetch" },
      });

      if (!res.ok) throw new Error(`Failed to fetch uploads: ${res.status}`);

      const data = await res.json();
      const uploads = Array.isArray(data.uploads) ? data.uploads : [];

      if (uploads.length === 0) {
        storedList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">No stored files found.</p>';
        return;
      }

      const filesHtml = uploads.map(upload => `
        <div class="stored-file-item" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e5e7eb;">
          <i class="fa-solid fa-file-excel" style="color: #dc2626; font-size: 18px;"></i>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #111827;">${escapeHtml(upload.originalName)}</div>
            <div style="font-size: 12px; color: #6b7280;">
              ${(upload.size / 1024).toFixed(1)} KB • ${new Date(upload.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button type="button" class="delete-file-btn" data-file-id="${upload.id}" style="background: #dc2626; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Delete this file">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      `).join('');

      storedList.innerHTML = filesHtml;

      // Add event listeners to delete buttons
      storedList.querySelectorAll('.delete-file-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const fileId = e.currentTarget.dataset.fileId;
          if (!fileId) return;
          deleteModal.dataset.fileId = fileId;
          deleteModal.style.display = "flex";
        });
      });

    } catch (err) {
      console.error('Error fetching stored files:', err);
      storedList.innerHTML = '<p style="text-align: center; color: #dc2626; padding: 20px;">Error loading stored files.</p>';
    }
  }

  function showManageModal() {
    const modal = currentType === "grades" ? document.getElementById("manageGradesModal") : document.getElementById("manageSchedulesModal");
    if (modal) {
      modal.style.display = "flex";
      // Default to add tab
      const tabBtns = modal.querySelectorAll(".tab-btn");
      tabBtns[0]?.click();
    }
  }

  function closeManageModal(modal) {
    if (modal) {
      modal.style.display = "none";
      // Reset state
      const fileInput = modal.querySelector('input[type="file"]');
      const attachments = modal.querySelector('.attachments-list');
      const storedList = modal.querySelector('.stored-files-list');
      const confirmBtn = modal.querySelector('.modal-actions button:last-child');
      if (fileInput) fileInput.value = "";
      if (attachments) attachments.innerHTML = "";
      if (storedList) storedList.innerHTML = "";
      if (confirmBtn) {
        confirmBtn.textContent = "Add Files";
        confirmBtn.disabled = true;
      }
    }
  }

  // Close modal for grades
  const manageGradesModalClose = document.getElementById("manageGradesModalClose");
  manageGradesModalClose?.addEventListener("click", () => closeManageModal(document.getElementById("manageGradesModal")));
  cancelGradesBtn?.addEventListener("click", () => closeManageModal(document.getElementById("manageGradesModal")));

  // Close modal for schedules
  const manageSchedulesModalClose = document.getElementById("manageSchedulesModalClose");
  manageSchedulesModalClose?.addEventListener("click", () => closeManageModal(document.getElementById("manageSchedulesModal")));
  cancelSchedulesBtn?.addEventListener("click", () => closeManageModal(document.getElementById("manageSchedulesModal")));

  // Close on outside click or escape for grades
  const manageGradesModal = document.getElementById("manageGradesModal");
  manageGradesModal?.addEventListener("click", (e) => {
    if (e.target === manageGradesModal) closeManageModal(manageGradesModal);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && manageGradesModal.style.display === "flex") {
      closeManageModal(manageGradesModal);
    }
  });

  // Close on outside click or escape for schedules
  const manageSchedulesModal = document.getElementById("manageSchedulesModal");
  manageSchedulesModal?.addEventListener("click", (e) => {
    if (e.target === manageSchedulesModal) closeManageModal(manageSchedulesModal);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && manageSchedulesModal.style.display === "flex") {
      closeManageModal(manageSchedulesModal);
    }
  });

  // Drag and drop for grades add tab
  const addGradesDropzone = document.querySelector('[data-zone="add-grades"]');
  if (addGradesDropzone) {
    addGradesDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      addGradesDropzone.classList.add("dragover");
    });
    addGradesDropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      addGradesDropzone.classList.remove("dragover");
    });
    addGradesDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      addGradesDropzone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".csv") || file.name.toLowerCase().endsWith(".pdf"))) {
        addGradesFile.files = e.dataTransfer.files;
        updateFileDisplay(file, "add", "grades");
      } else {
        showToast("Please select a XLSX, CSV, or PDF file", "error");
      }
    });
    addGradesDropzone.addEventListener("click", () => {
      addGradesFile.click();
    });
  }

  // Drag and drop for schedules add tab
  const addSchedulesDropzone = document.querySelector('[data-zone="add-schedules"]');
  if (addSchedulesDropzone) {
    addSchedulesDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      addSchedulesDropzone.classList.add("dragover");
    });
    addSchedulesDropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      addSchedulesDropzone.classList.remove("dragover");
    });
    addSchedulesDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      addSchedulesDropzone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".csv"))) {
        addSchedulesFile.files = e.dataTransfer.files;
        updateFileDisplay(file, "add", "schedules");
      } else {
        showToast("Please select a XLSX or CSV file", "error");
      }
    });
    addSchedulesDropzone.addEventListener("click", () => {
      addSchedulesFile.click();
    });
  }

  // File input for grades
  addGradesFile?.addEventListener("change", () => {
    const file = addGradesFile.files[0];
    if (file) {
      updateFileDisplay(file, "add", "grades");
    }
  });

  // File input for schedules
  addSchedulesFile?.addEventListener("change", () => {
    const file = addSchedulesFile.files[0];
    if (file) {
      updateFileDisplay(file, "add", "schedules");
    }
  });

  // Confirm add/remove for grades
  confirmGradesBtn?.addEventListener("click", async () => {
    const activeTab = document.querySelector("#manageGradesModal .tab-btn.active")?.dataset.tab;
    const file = activeTab === "add" ? addGradesFile.files[0] : null;
    if (activeTab === "add" && !file) return;

    if (activeTab === "add") {
      try {
        await uploadFile(file, "grades");
        closeManageModal(document.getElementById("manageGradesModal"));
        loadUploadedFiles("grades");
      } catch (err) {
        showToast(err.message || "Upload failed", "error");
        console.error(err);
      }
    }
  });

  // Confirm add/remove for schedules
  confirmSchedulesBtn?.addEventListener("click", async () => {
    const activeTab = document.querySelector("#manageSchedulesModal .tab-btn.active")?.dataset.tab;
    const file = activeTab === "add" ? addSchedulesFile.files[0] : null;
    if (activeTab === "add" && !file) return;

    if (activeTab === "add") {
      try {
        await uploadFile(file, "schedules");
        closeManageModal(document.getElementById("manageSchedulesModal"));
        loadUploadedFiles("schedules");
      } catch (err) {
        showToast(err.message || "Upload failed", "error");
        console.error(err);
      }
    }
  });

  // Shared file display update function
  function updateFileDisplay(file, tab, type) {
    const attachments = tab === "remove" ? null : (type === "grades" ? addGradesAttachments : addSchedulesAttachments);

    if (!attachments) return;

    // Determine file icon based on type
    let fileIcon = "fa-file";
    if (file.name.toLowerCase().endsWith(".xlsx")) {
      fileIcon = "fa-file-excel";
    } else if (file.name.toLowerCase().endsWith(".csv")) {
      fileIcon = "fa-file-csv";
    } else if (file.name.toLowerCase().endsWith(".pdf")) {
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
    const fileInput = type === "grades" ? addGradesFile : addSchedulesFile;
    const confirmBtn = type === "grades" ? confirmGradesBtn : confirmSchedulesBtn;
    removeBtn?.addEventListener("click", () => {
      fileInput.value = "";
      attachments.innerHTML = "";
      confirmBtn.disabled = true;
    });
    confirmBtn.disabled = false;
  }

  // ===== Show file preview function =====
  async function showFilePreview(fileId) {
    try {
      const response = await fetch(`http://localhost:4000/api/import/preview/${fileId}`);
      const result = await response.json();

      if (!result.success) {
        showToast(result.error || "Failed to load preview", "error");
        return;
      }

      const { fileName, relPath, data, totalRows, truncated } = result;

      // Build table HTML
      let tableHtml = '<table class="preview-table"><thead><tr>';
      if (data.length > 0) {
        data[0].forEach((_, index) => {
          tableHtml += `<th>Column ${index + 1}</th>`;
        });
      }
      tableHtml += '</tr></thead><tbody>';
      data.forEach(row => {
        tableHtml += '<tr>';
        row.forEach(cell => {
          tableHtml += `<td>${escapeHtml(cell || '')}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table>';

      if (truncated) {
        tableHtml += `<p class="preview-note">Showing first 100 rows of ${totalRows} total rows.</p>`;
      }

      // Set modal content
      document.getElementById('previewTableContainer').innerHTML = tableHtml;
      document.getElementById('downloadPreviewBtn').onclick = () => {
        window.open(`http://localhost:4000${relPath}`, '_blank');
      };

      // Show modal
      document.getElementById('filePreviewModal').style.display = 'flex';
    } catch (error) {
      console.error('Preview error:', error);
      showToast('Failed to load file preview', 'error');
    }
  }

  // ===== Load uploaded files function =====
  async function loadUploadedFiles(type) {
    try {
      const url = `http://localhost:4000/api/import/uploads/${type}`;
      const res = await fetch(url, {
        credentials: "include",
        headers: { "X-Requested-With": "fetch" },
      });

      if (!res.ok) throw new Error(`Failed to fetch uploads: ${res.status}`);

      const data = await res.json();
      const uploads = Array.isArray(data.uploads) ? data.uploads : [];

      const listEl = document.getElementById(`${type}FilesList`);
      if (!listEl) return;

      if (uploads.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">No files uploaded yet.</p>';
        return;
      }

      const filesHtml = uploads.map(upload => {
        let fileIcon = "fa-file-excel";
        if (upload.originalName.toLowerCase().endsWith(".csv")) {
          fileIcon = "fa-file-csv";
        } else if (upload.originalName.toLowerCase().endsWith(".pdf")) {
          fileIcon = "fa-file-pdf";
        }
        return `
        <div class="file-item">
          <i class="fa-solid ${fileIcon} file-icon"></i>
          <div class="file-info">
            <div class="file-name">${escapeHtml(upload.originalName)}</div>
            <div class="file-meta">${(upload.size / 1024).toFixed(1)} KB • ${new Date(upload.createdAt).toLocaleDateString()}</div>
          </div>
          <div class="file-actions">
            <button type="button" class="file-preview" data-file-id="${upload.id}" title="Preview file">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button type="button" class="file-delete" data-file-id="${upload.id}" title="Delete file">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `}).join('');

      listEl.innerHTML = filesHtml;

      // Add event listeners
      listEl.querySelectorAll('.file-preview').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const fileId = e.currentTarget.dataset.fileId;
          if (fileId) {
            await showFilePreview(fileId);
          }
        });
      });

      listEl.querySelectorAll('.file-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const fileId = e.currentTarget.dataset.fileId;
          if (fileId) {
            deleteModal.dataset.fileId = fileId;
            deleteModal.style.display = "flex";
          }
        });
      });

    } catch (err) {
      console.error('Error loading uploaded files:', err);
      const listEl = document.getElementById(`${type}FilesList`);
      if (listEl) {
        listEl.innerHTML = '<p style="text-align: center; color: #dc2626; padding: 20px;">Error loading files.</p>';
      }
    }
  }

  // ===== Upload file function =====
  async function uploadFile(file, type) {
    const fd = new FormData();
    fd.append("file", file);

    const url = `http://localhost:4000/api/import/${type}`;
    const res = await fetch(url, {
      method: "POST",
      body: fd,
      credentials: "include",
      headers: { "X-Requested-With": "fetch" },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Upload failed (${res.status})`);
    }

    if (data.duplicate) {
      showToast(`Duplicate detected. File already exists.`, "warning");
    } else {
      showToast(`File uploaded successfully.`, "success");
    }
  }

  // ===== Custom Toasts =====
  function showToast(message, type = "success") {
    const host = document.getElementById("toastHost");
    if (!host) return alert(message);

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === "success" ? "fa-circle-check" : type === "warning" ? "fa-triangle-exclamation" : "fa-circle-xmark"}"></i>
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

  // ===== Admin Search UI =====
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

  // ===== Preview modal event listeners =====
  const filePreviewModalClose = document.getElementById("filePreviewModalClose");
  const closePreviewBtn = document.getElementById("closePreviewBtn");
  const filePreviewModal = document.getElementById("filePreviewModal");

  filePreviewModalClose?.addEventListener("click", () => {
    if (filePreviewModal) filePreviewModal.style.display = "none";
  });
  closePreviewBtn?.addEventListener("click", () => {
    if (filePreviewModal) filePreviewModal.style.display = "none";
  });
  if (filePreviewModal) {
    filePreviewModal.addEventListener("click", (e) => {
      if (e.target === filePreviewModal) filePreviewModal.style.display = "none";
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && filePreviewModal.style.display === "flex") {
        filePreviewModal.style.display = "none";
      }
    });
  }

  // ===== Utility function =====
  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }
});

// === Inbox Dropdown =====
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
