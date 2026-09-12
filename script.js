/* =========================================================
   SaleHub — JavaScript
   Powered by mehedi1only
   ========================================================= */

/* =========================
   Supabase Configuration
   ========================= */

const SUPABASE_URL =
  "https://eavqyzgamuelwyplhqjf.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_OSypObpmAQMHjMZrct7QNQ_AtrYXY8Z";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================
   State
   ========================= */

let currentUser = null;
let sales = [];
let deletedSale = null;


/* =========================
   DOM Elements
   ========================= */

const loginScreen =
  document.getElementById("loginScreen");

const app =
  document.getElementById("app");

const loginForm =
  document.getElementById("loginForm");

const email =
  document.getElementById("email");

const password =
  document.getElementById("password");

const loginError =
  document.getElementById("loginError");

const logoutBtn =
  document.getElementById("logoutBtn");

const saleForm =
  document.getElementById("saleForm");

const amountInput =
  document.getElementById("amountInput");

const countValue =
  document.getElementById("countValue");

const totalValue =
  document.getElementById("totalValue");

const todayValue =
  document.getElementById("todayValue");

const lastSaleValue =
  document.getElementById("lastSaleValue");

const historyList =
  document.getElementById("historyList");

const exportBtn =
  document.getElementById("exportBtn");

const undoBtn =
  document.getElementById("undoBtn");

const resetBtn =
  document.getElementById("resetBtn");

const backupBtn =
  document.getElementById("backupBtn");

const restoreBtn =
  document.getElementById("restoreBtn");

const restoreInput =
  document.getElementById("restoreInput");

const onlineText =
  document.getElementById("onlineText");

const statusDot =
  document.getElementById("statusDot");

const toast =
  document.getElementById("toast");

const modalBg =
  document.getElementById("modalBg");

const modalTitle =
  document.getElementById("modalTitle");

const modalMessage =
  document.getElementById("modalMessage");

const modalInput =
  document.getElementById("modalInput");

const modalCancel =
  document.getElementById("modalCancel");

const modalConfirm =
  document.getElementById("modalConfirm");


/* =========================
   Helpers
   ========================= */

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}


function formatDateTime(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


function formatTime(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}


function isToday(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}


/* =========================
   Online / Offline
   ========================= */

function updateOnlineStatus() {
  const online = navigator.onLine;

  if (online) {
    if (onlineText) {
      onlineText.textContent = "Online";
    }

    if (statusDot) {
      statusDot.style.background = "#22c55e";
      statusDot.style.boxShadow =
        "0 0 10px rgba(34,197,94,.7)";
    }
  } else {
    if (onlineText) {
      onlineText.textContent = "Offline";
    }

    if (statusDot) {
      statusDot.style.background = "#ef4444";
      statusDot.style.boxShadow =
        "0 0 10px rgba(239,68,68,.7)";
    }
  }
}

window.addEventListener(
  "online",
  updateOnlineStatus
);

window.addEventListener(
  "offline",
  updateOnlineStatus
);

updateOnlineStatus();


/* =========================
   Show / Hide App
   ========================= */

function showApp() {
  if (loginScreen) {
    loginScreen.classList.add("hidden");
  }

  if (app) {
    app.classList.remove("hidden");
  }
}


function showLogin() {
  if (loginScreen) {
    loginScreen.classList.remove("hidden");
  }

  if (app) {
    app.classList.add("hidden");
  }
}


/* =========================
   Load Sales
   ========================= */

async function loadSales() {
  if (!currentUser) return;

  if (historyList) {
    historyList.innerHTML =
      `<div class="loading">Loading sales...</div>`;
  }

  const { data, error } =
    await supabaseClient
      .from("sales")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error(error);

    sales = [];

    if (historyList) {
      historyList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">!</div>
          <h3>Could not load sales</h3>
          <p>${escapeHTML(error.message)}</p>
        </div>
      `;
    }

    showToast("Failed to load sales");
    updateStats();

    return;
  }

  sales = data || [];

  updateStats();
  renderHistory();
}


/* =========================
   Update Statistics
   ========================= */

function updateStats() {
  const count = sales.length;

  const total = sales.reduce(
    (sum, sale) =>
      sum + Number(sale.amount || 0),
    0
  );

  const todayTotal = sales
    .filter(sale => isToday(sale.created_at))
    .reduce(
      (sum, sale) =>
        sum + Number(sale.amount || 0),
      0
    );

  if (countValue) {
    countValue.textContent = count;
  }

  if (totalValue) {
    totalValue.textContent =
      formatMoney(total);
  }

  if (todayValue) {
    todayValue.textContent =
      formatMoney(todayTotal);
  }

  if (lastSaleValue) {
    if (sales.length > 0) {
      lastSaleValue.textContent =
        formatTime(sales[0].created_at);
    } else {
      lastSaleValue.textContent = "--";
    }
  }
}


/* =========================
   Render History
   ========================= */

function renderHistory() {
  if (!historyList) return;

  if (!sales.length) {
    historyList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">◷</div>
        <h3>No sales yet</h3>
        <p>Add your first sale to see it here.</p>
      </div>
    `;

    return;
  }

  historyList.innerHTML =
    sales.map(sale => `
      <div
        class="history-item"
        data-id="${escapeHTML(sale.id)}"
      >
        <div class="history-left">
          <div class="history-amount">
            ${formatMoney(sale.amount)}
          </div>

          <div class="history-time">
            ${escapeHTML(
              formatDateTime(sale.created_at)
            )}
          </div>
        </div>

        <div class="history-actions">
          <button
            class="icon-btn edit-btn"
            data-id="${escapeHTML(sale.id)}"
            type="button"
            title="Edit sale"
            aria-label="Edit sale"
          >
            ✎
          </button>

          <button
            class="icon-btn delete delete-btn"
            data-id="${escapeHTML(sale.id)}"
            type="button"
            title="Delete sale"
            aria-label="Delete sale"
          >
            ×
          </button>
        </div>
      </div>
    `).join("");

  document
    .querySelectorAll(".edit-btn")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const id = button.dataset.id;
          editSale(id);
        }
      );
    });

  document
    .querySelectorAll(".delete-btn")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const id = button.dataset.id;
          deleteSale(id);
        }
      );
    });
}


/* =========================
   Add Sale
   ========================= */

if (saleForm) {
  saleForm.addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      if (!currentUser) {
        showToast("Please login first");
        return;
      }

      const amount =
        Number(amountInput?.value);

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        showToast(
          "Please enter a valid amount"
        );

        amountInput?.focus();

        return;
      }

      const submitButton =
        saleForm.querySelector(
          'button[type="submit"]'
        );

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent =
          "Adding...";
      }

      const { data, error } =
        await supabaseClient
          .from("sales")
          .insert({
            amount: amount,
            user_id: currentUser.id
          })
          .select()
          .single();

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent =
          "Add Sale";
      }

      if (error) {
        console.error(error);

        showToast(
          "Could not add sale"
        );

        return;
      }

      if (data) {
        sales.unshift(data);
      }

      amountInput.value = "";

      updateStats();
      renderHistory();

      showToast("Sale added successfully");
    }
  );
}


/* =========================
   Edit Sale
   ========================= */

async function editSale(id) {
  const sale =
    sales.find(
      item => String(item.id) === String(id)
    );

  if (!sale) {
    showToast("Sale not found");
    return;
  }

  const newAmount =
    await openModal({
      title: "Edit Sale",
      message:
        "Enter the new sale amount.",
      input: true,
      inputValue:
        formatMoney(sale.amount),
      confirmText: "Save",
      cancelText: "Cancel",
      confirmClass: "confirm"
    });

  if (newAmount === null) {
    return;
  }

  const amount =
    Number(newAmount);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    showToast(
      "Please enter a valid amount"
    );

    return;
  }

  const { data, error } =
    await supabaseClient
      .from("sales")
      .update({
        amount: amount
      })
      .eq("id", sale.id)
      .eq("user_id", currentUser.id)
      .select()
      .single();

  if (error) {
    console.error(error);

    showToast(
      "Could not update sale"
    );

    return;
  }

  const index =
    sales.findIndex(
      item =>
        String(item.id) ===
        String(sale.id)
    );

  if (index !== -1 && data) {
    sales[index] = data;
  }

  updateStats();
  renderHistory();

  showToast("Sale updated");
}


/* =========================
   Delete Sale
   ========================= */

async function deleteSale(id) {
  const sale =
    sales.find(
      item => String(item.id) === String(id)
    );

  if (!sale) {
    showToast("Sale not found");
    return;
  }

  const confirmed =
    await openModal({
      title: "Delete Sale",
      message:
        `Delete this sale of ${formatMoney(
          sale.amount
        )}? This action can be undone.`,
      input: false,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmClass: "danger"
    });

  if (!confirmed) {
    return;
  }

  const { error } =
    await supabaseClient
      .from("sales")
      .delete()
      .eq("id", sale.id)
      .eq("user_id", currentUser.id);

  if (error) {
    console.error(error);

    showToast(
      "Could not delete sale"
    );

    return;
  }

  deletedSale = {
    amount: Number(sale.amount),
    created_at: sale.created_at
  };

  sales =
    sales.filter(
      item =>
        String(item.id) !==
        String(sale.id)
    );

  updateStats();
  renderHistory();

  showToast(
    "Sale deleted. You can undo it."
  );
}


/* =========================
   Undo Delete
   ========================= */

if (undoBtn) {
  undoBtn.addEventListener(
    "click",
    async () => {
      if (!currentUser) {
        showToast("Please login first");
        return;
      }

      if (!deletedSale) {
        showToast("Nothing to undo");
        return;
      }

      const backup =
        deletedSale;

      const { data, error } =
        await supabaseClient
          .from("sales")
          .insert({
            amount:
              Number(backup.amount),

            created_at:
              backup.created_at,

            user_id:
              currentUser.id
          })
          .select()
          .single();

      if (error) {
        console.error(error);

        showToast(
          "Could not restore sale"
        );

        return;
      }

      if (data) {
        sales.push(data);

        sales.sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        );
      }

      deletedSale = null;

      updateStats();
      renderHistory();

      showToast("Sale restored");
    }
  );
}


/* =========================
   Export CSV
   ========================= */

if (exportBtn) {
  exportBtn.addEventListener(
    "click",
    () => {
      if (!sales.length) {
        showToast(
          "There are no sales to export"
        );

        return;
      }

      const rows = [
        [
          "Amount",
          "Created At"
        ],
        ...sales.map(sale => [
          formatMoney(sale.amount),
          sale.created_at
        ])
      ];

      const csv =
        rows
          .map(row =>
            row
              .map(value =>
                `"${String(value)
                  .replaceAll('"', '""')}"`
              )
              .join(",")
          )
          .join("\n");

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        `salehub-sales-${getFileDate()}.csv`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

      showToast(
        "CSV exported successfully"
      );
    }
  );
}


/* =========================
   File Date
   ========================= */

function getFileDate() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =========================
   Reset All
   ========================= */

if (resetBtn) {
  resetBtn.addEventListener(
    "click",
    async () => {
      if (!currentUser) {
        showToast("Please login first");
        return;
      }

      if (!sales.length) {
        showToast(
          "There are no sales to reset"
        );

        return;
      }

      const typed =
        await openModal({
          title: "Reset All Sales",
          message:
            'This will permanently delete all your sales. Type "RESET ALL" to continue.',
          input: true,
          inputValue: "",
          placeholder: "RESET ALL",
          confirmText: "Continue",
          cancelText: "Cancel",
          confirmClass: "danger"
        });

      if (typed === null) {
        return;
      }

      if (
        String(typed).trim() !==
        "RESET ALL"
      ) {
        showToast(
          'Please type exactly "RESET ALL"'
        );

        return;
      }

      const finalConfirm =
        await openModal({
          title: "Final Confirmation",
          message:
            `You are about to delete ${sales.length} sale(s). This cannot be undone.`,
          input: false,
          confirmText: "Delete Everything",
          cancelText: "Cancel",
          confirmClass: "danger"
        });

      if (!finalConfirm) {
        return;
      }

      const { error } =
        await supabaseClient
          .from("sales")
          .delete()
          .eq(
            "user_id",
            currentUser.id
          );

      if (error) {
        console.error(error);

        showToast(
          "Could not reset sales"
        );

        return;
      }

      sales = [];
      deletedSale = null;

      updateStats();
      renderHistory();

      showToast(
        "All sales have been deleted"
      );
    }
  );
}


/* =========================
   Backup JSON
   ========================= */

if (backupBtn) {
  backupBtn.addEventListener(
    "click",
    () => {
      if (!sales.length) {
        showToast(
          "There are no sales to backup"
        );

        return;
      }

      const backup = {
        app: "SaleHub",
        version: 1,
        exported_at:
          new Date().toISOString(),

        sales: sales.map(sale => ({
          amount:
            Number(sale.amount),

          created_at:
            sale.created_at
        }))
      };

      const json =
        JSON.stringify(
          backup,
          null,
          2
        );

      const blob =
        new Blob(
          [json],
          {
            type:
              "application/json"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `salehub-backup-${getFileDate()}.json`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

      showToast(
        "Backup created successfully"
      );
    }
  );
}


/* =========================
   Restore JSON
   ========================= */

if (restoreBtn && restoreInput) {
  restoreBtn.addEventListener(
    "click",
    () => {
      restoreInput.click();
    }
  );

  restoreInput.addEventListener(
    "change",
    async () => {
      const file =
        restoreInput.files?.[0];

      if (!file) {
        return;
      }

      await restoreBackup(file);

      restoreInput.value = "";
    }
  );
}


async function restoreBackup(file) {
  if (!currentUser) {
    showToast("Please login first");
    return;
  }

  try {
    const text =
      await file.text();

    const backup =
      JSON.parse(text);

    if (
      !backup ||
      !Array.isArray(
        backup.sales
      )
    ) {
      throw new Error(
        "Invalid SaleHub backup file."
      );
    }

    const validSales =
      backup.sales
        .map(item => ({
          amount:
            Number(item.amount),

          created_at:
            item.created_at
        }))
        .filter(item =>
          Number.isFinite(
            item.amount
          ) &&
          item.amount > 0 &&
          item.created_at &&
          !Number.isNaN(
            new Date(
              item.created_at
            ).getTime()
          )
        );

    if (!validSales.length) {
      showToast(
        "No valid sales found in backup"
      );

      return;
    }

    const confirmed =
      await openModal({
        title: "Restore Backup",
        message:
          `This will add ${validSales.length} sale(s) to your current sales. Existing sales will not be deleted.`,
        input: false,
        confirmText: "Restore",
        cancelText: "Cancel",
        confirmClass: "confirm"
      });

    if (!confirmed) {
      return;
    }

    const rows =
      validSales.map(item => ({
        amount:
          item.amount,

        created_at:
          item.created_at,

        user_id:
          currentUser.id
      }));

    const { data, error } =
      await supabaseClient
        .from("sales")
        .insert(rows)
        .select();

    if (error) {
      console.error(error);

      showToast(
        "Could not restore backup"
      );

      return;
    }

    if (data?.length) {
      sales.push(...data);

      sales.sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );
    }

    updateStats();
    renderHistory();

    showToast(
      `${validSales.length} sale(s) restored`
    );

  } catch (error) {
    console.error(error);

    showToast(
      "Invalid or corrupted backup file"
    );
  }
}


/* =========================
   Modal
   ========================= */

function openModal(options = {}) {
  return new Promise(resolve => {
    if (!modalBg) {
      resolve(
        options.input
          ? null
          : false
      );

      return;
    }

    const {
      title = "Confirmation",
      message = "",
      input = false,
      inputValue = "",
      placeholder = "",
      confirmText = "Confirm",
      cancelText = "Cancel",
      confirmClass = "confirm"
    } = options;

    if (modalTitle) {
      modalTitle.textContent =
        title;
    }

    if (modalMessage) {
      modalMessage.textContent =
        message;
    }

    if (modalInput) {
      modalInput.value =
        inputValue || "";

      modalInput.placeholder =
        placeholder || "";

      modalInput.classList.toggle(
        "hidden",
        !input
      );

      modalInput.type =
        "text";
    }

    if (modalCancel) {
      modalCancel.textContent =
        cancelText;
    }

    if (modalConfirm) {
      modalConfirm.textContent =
        confirmText;

      modalConfirm.className =
        "modal-btn " +
        confirmClass;
    }

    modalBg.classList.add("show");

    if (input && modalInput) {
      setTimeout(() => {
        modalInput.focus();
        modalInput.select();
      }, 50);
    }

    let finished = false;

    function finish(value) {
      if (finished) return;

      finished = true;

      modalBg.classList.remove("show");

      if (modalCancel) {
        modalCancel.onclick = null;
      }

      if (modalConfirm) {
        modalConfirm.onclick = null;
      }

      modalBg.onclick = null;

      document.removeEventListener(
        "keydown",
        keyHandler
      );

      resolve(value);
    }

    function keyHandler(event) {
      if (event.key === "Escape") {
        finish(null);
      }

      if (
        event.key === "Enter" &&
        input &&
        document.activeElement ===
          modalInput
      ) {
        event.preventDefault();

        const value =
          modalInput.value;

        finish(value);
      }
    }

    modalCancel.onclick = () => {
      finish(null);
    };

    modalConfirm.onclick = () => {
      if (input) {
        finish(
          modalInput
            ? modalInput.value
            : ""
        );
      } else {
        finish(true);
      }
    };

    modalBg.onclick = event => {
      if (
        event.target === modalBg
      ) {
        finish(null);
      }
    };

    document.addEventListener(
      "keydown",
      keyHandler
    );
  });
}


/* =========================
   Login
   ========================= */

if (loginForm) {
  loginForm.addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      if (loginError) {
        loginError.textContent = "";
        loginError.classList.add(
          "hidden"
        );
      }

      const userEmail =
        email?.value.trim();

      const userPassword =
        password?.value;

      if (!userEmail || !userPassword) {
        if (loginError) {
          loginError.textContent =
            "Please enter your email and password.";

          loginError.classList.remove(
            "hidden"
          );
        }

        return;
      }

      const submitButton =
        loginForm.querySelector(
          'button[type="submit"]'
        );

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent =
          "Signing in...";
      }

      const {
        data,
        error
      } =
        await supabaseClient.auth
          .signInWithPassword({
            email: userEmail,
            password: userPassword
          });

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent =
          "Login";
      }

      if (error) {
        console.error(error);

        if (loginError) {
          loginError.textContent =
            error.message;

          loginError.classList.remove(
            "hidden"
          );
        }

        return;
      }

      if (data?.user) {
        currentUser =
          data.user;

        showApp();

        await loadSales();

        showToast(
          "Welcome to SaleHub"
        );
      }
    }
  );
}


/* =========================
   Logout
   ========================= */

if (logoutBtn) {
  logoutBtn.addEventListener(
    "click",
    async () => {
      const confirmed =
        await openModal({
          title: "Logout",
          message:
            "Are you sure you want to logout?",
          input: false,
          confirmText: "Logout",
          cancelText: "Cancel",
          confirmClass: "danger"
        });

      if (!confirmed) {
        return;
      }

      const {
        error
      } =
        await supabaseClient.auth
          .signOut();

      if (error) {
        console.error(error);

        showToast(
          "Could not logout"
        );

        return;
      }

      currentUser = null;
      sales = [];
      deletedSale = null;

      showLogin();

      if (email) {
        email.value = "";
      }

      if (password) {
        password.value = "";
      }

      showToast("Logged out");
    }
  );
}


/* =========================
   Auth State
   ========================= */

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {
    if (session?.user) {
      currentUser =
        session.user;

      showApp();

      await loadSales();

    } else {
      currentUser = null;
      sales = [];
      deletedSale = null;

      showLogin();
    }
  }
);


/* =========================
   Initial Session
   ========================= */

async function init() {
  try {
    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getSession();

    if (error) {
      console.error(error);

      showLogin();

      return;
    }

    if (data?.session?.user) {
      currentUser =
        data.session.user;

      showApp();

      await loadSales();

    } else {
      showLogin();
    }

  } catch (error) {
    console.error(error);

    showLogin();
  }
}

init();