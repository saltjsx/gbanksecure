// UI Functions

function selectAccount(accountType, event) {
  // Remove selected class from all cards
  document.querySelectorAll(".account-card").forEach((card) => {
    card.classList.remove("selected");
  });

  // Add selected class to clicked card
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("selected");
  }

  // Check the radio button
  const radioButton = document.getElementById(accountType);
  if (radioButton) {
    radioButton.checked = true;
  }

  return accountType;
}

// Custom popup system
function showPopup(
  message,
  title = "Notification",
  type = "info",
  showCancel = false
) {
  const overlay = document.getElementById("popup-overlay");
  const header = document.getElementById("popup-header");
  const content = document.getElementById("popup-content");
  const okBtn = document.getElementById("popup-ok-btn");
  const cancelBtn = document.getElementById("popup-cancel-btn");

  if (!overlay) {
    console.error("Popup overlay not found!");
    alert(message); // Fallback
    return;
  }

  // Set header title and color based on type
  header.textContent = title;
  if (type === "success") {
    header.style.backgroundColor = "#4CAF50";
  } else if (type === "error") {
    header.style.backgroundColor = "#f44336";
  } else {
    header.style.backgroundColor = "#2196F3";
  }

  // Set content
  content.innerHTML = message;

  // Show/hide cancel button
  if (showCancel) {
    cancelBtn.style.display = "inline-block";
  } else {
    cancelBtn.style.display = "none";
  }

  // Show popup
  overlay.style.display = "block";

  // Return promise for confirmation dialogs
  return new Promise((resolve) => {
    okBtn.onclick = () => {
      hidePopup();
      resolve(true);
    };
    cancelBtn.onclick = () => {
      hidePopup();
      resolve(false);
    };
  });
}

function hidePopup() {
  const overlay = document.getElementById("popup-overlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

function showBiometricPrompt(callback) {
  const modal = document.getElementById("biometric-modal");
  if (!modal) {
    // If modal doesn't exist, skip
    console.warn("Biometric modal not found, skipping.");
    callback(true); // Assume success
    return;
  }

  modal.style.display = "flex";
  const status = document.getElementById("biometric-status");
  status.textContent = "Scanning...";

  setTimeout(() => {
    status.textContent = "Verified";
    setTimeout(() => {
      modal.style.display = "none";
      callback(true);
    }, 500);
  }, 2500);
}

function showOtpPrompt(otp, callback) {
  const modal = document.getElementById("otp-modal");
  if (!modal) {
    // If modal doesn't exist, assume success
    console.warn("OTP modal not found, skipping.");
    callback(true);
    return;
  }

  document.getElementById("otp-display").textContent = otp;
  const otpInput = document.getElementById("otp-input");
  otpInput.value = "";
  modal.style.display = "flex";

  const submitBtn = document.getElementById("otp-submit-btn");
  const newSubmitBtn = submitBtn.cloneNode(true); // Clone the button to remove old listeners
  submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

  newSubmitBtn.addEventListener("click", () => {
    if (otpInput.value === otp) {
      modal.style.display = "none";
      callback(true);
    } else {
      alert("Invalid OTP. Please try again.");
      otpInput.value = "";
      callback(false);
    }
  });
}

// Show/Hide Forms
function showTransferForm() {
  hideAllForms();
  document.getElementById("transfer-form").style.display = "block";
}

function showDepositForm() {
  hideAllForms();
  document.getElementById("deposit-form").style.display = "block";
}

function showWithdrawForm() {
  hideAllForms();
  document.getElementById("withdraw-form").style.display = "block";
}

function showBillPayForm() {
  hideAllForms();
  document.getElementById("billpay-form").style.display = "block";
}

function toggleTransactionHistory() {
  const historySection = document.getElementById("transaction-history");
  if (historySection.style.display === "block") {
    historySection.style.display = "none";
  } else {
    historySection.style.display = "block";
    renderTransactionHistory();
  }
}

function showChangePassword() {
  hideAllForms();
  document.getElementById("change-password-form").style.display = "block";
}

function showCreditCardForm() {
  hideAllForms();
  document.getElementById("credit-card-form").style.display = "block";
}

function showCreditCardStatement() {
  showPopup("This feature is not yet implemented.", "Coming Soon");
}

function hideAllForms() {
  const forms = [
    "transfer-form",
    "deposit-form",
    "withdraw-form",
    "billpay-form",
    "change-password-form",
    "transaction-history",
    "credit-card-form",
    "credit-charge-form",
  ];
  forms.forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) {
      form.style.display = "none";
    }
  });
}

function renderTransactionHistory() {
  const bankingData = getBankingData();
  const transactionList = document.getElementById("transaction-list");

  if (!bankingData || !transactionList) {
    return;
  }

  transactionList.innerHTML = ""; // Clear existing list

  if (bankingData.transactions.length === 0) {
    transactionList.innerHTML = "<p>No transactions yet.</p>";
    return;
  }

  const table = document.createElement("table");
  table.className = "transaction-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Description</th>
        <th class="amount">Amount</th>
        <th class="amount">Balance</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;

  const tbody = table.querySelector("tbody");

  bankingData.transactions.forEach((tx) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${formatDate(tx.date)}</td>
      <td>${tx.type}</td>
      <td>${tx.description}</td>
      <td class="amount ${tx.amount < 0 ? "debit" : "credit"}">${formatCurrency(
      tx.amount
    )}</td>
      <td class="amount">${formatCurrency(tx.balance)}</td>
    `;
  });

  transactionList.appendChild(table);
}

// Load account dashboard
function loadAccountDashboard() {
  const userData = JSON.parse(localStorage.getItem("userAuth"));
  const bankingData = getBankingData();

  if (!userData || !bankingData) {
    // This might happen if the user is not logged in or data is cleared
    // Redirect to login if not on the login page
    if (!window.location.pathname.includes("sso.html")) {
      window.location.href = "./sso.html";
    }
    return;
  }

  try {
    document.getElementById(
      "account-holder-name"
    ).textContent = `${userData.firstName} ${userData.lastName}`;
    document.getElementById("account-type-display").textContent = `${
      userData.accountType.charAt(0).toUpperCase() +
      userData.accountType.slice(1)
    } Account`;
    document.getElementById(
      "account-number-display"
    ).textContent = `**** **** **** ${userData.customerId.slice(-4)}`;
    document.getElementById("current-balance").textContent = formatCurrency(
      bankingData.balance
    );
    document.getElementById("last-login-date").textContent = formatDate(
      bankingData.lastLogin
    );

    // Handle credit card specific fields
    const creditCardSection = document.getElementById("credit-card-section");
    if (userData.accountType === "credit" && creditCardSection) {
      creditCardSection.style.display = "block";
      document.getElementById("credit-limit").textContent = formatCurrency(
        bankingData.creditLimit
      );
      document.getElementById("credit-utilization").textContent =
        formatCurrency(bankingData.creditUtilization);
      document.getElementById("available-credit").textContent = formatCurrency(
        bankingData.creditLimit - bankingData.creditUtilization
      );
    } else if (creditCardSection) {
      creditCardSection.style.display = "none";
    }

    renderTransactionHistory();
  } catch (error) {
    console.error("Error loading dashboard:", error);
    // Maybe show a user-friendly error message
  }
}

function printAccountDetails() {
  window.print();
}
