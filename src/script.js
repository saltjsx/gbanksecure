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

// Generate random 6-digit customer ID
function generateCustomerId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    // Fallback to alert if popup elements don't exist
    alert(message);
    return Promise.resolve(true);
  }

  // Set header title and color based on type
  header.textContent = title;
  if (type === "success") {
    header.style.background = "linear-gradient(to bottom, #008000, #006600)";
  } else if (type === "error") {
    header.style.background = "linear-gradient(to bottom, #cc0000, #990000)";
  } else if (type === "warning") {
    header.style.background = "linear-gradient(to bottom, #ff9900, #cc7700)";
  } else {
    header.style.background = "linear-gradient(to bottom, #0066cc, #003399)";
  }

  // Set content
  content.innerHTML = message;

  // Show/hide cancel button
  if (showCancel) {
    cancelBtn.style.display = "inline-block";
    okBtn.textContent = "Yes";
  } else {
    cancelBtn.style.display = "none";
    okBtn.textContent = "OK";
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

// Handle form submission
function handleSignup(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    showPopup("Passwords do not match!", "Registration Error", "error");
    return;
  }

  // Generate customer ID
  const customerId = generateCustomerId();

  // Store user data (in a real app, this would be sent to a server)
  const userData = {
    customerId: customerId,
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    dateOfBirth: formData.get("dateOfBirth"),
    accountType: formData.get("accountType"),
    password: password,
  };

  // Store in localStorage (for demo purposes)
  localStorage.setItem("userAuth", JSON.stringify(userData));

  // Redirect to account confirmation page
  window.location.href = "./myaccount.html";
}

// Handle login
function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const customerId = formData.get("customerId");
  const password = formData.get("password");

  const storedUser = localStorage.getItem("userAuth");

  if (storedUser) {
    const userData = JSON.parse(storedUser);

    if (userData.customerId === customerId && userData.password === password) {
      // Login successful - start security verification
      showBiometricPrompt(() => {
        const otp = generateOtp();
        showOtpPrompt(otp, (isValid) => {
          if (isValid) {
            sessionStorage.setItem("loggedIn", "true");
            updateLastLogin();
            window.location.href = "./my.html";
          } else {
            showPopup(
              "Invalid OTP. Please try again.",
              "Authentication Failed",
              "error"
            );
          }
        });
      });
    } else {
      showPopup("Invalid Customer ID or Password", "Login Error", "error");
    }
  } else {
    showPopup(
      "No account found. Please sign up first.",
      "Login Error",
      "error"
    );
  }
}

// OTP and Biometric Functions
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function showBiometricPrompt(callback) {
  const modal = document.getElementById("biometric-modal");
  if (!modal) return callback(); // If modal doesn't exist, skip

  modal.style.display = "flex";
  const status = document.getElementById("biometric-status");
  status.textContent = "Scanning...";

  setTimeout(() => {
    status.textContent = "Scan Complete";
    setTimeout(() => {
      modal.style.display = "none";
      callback();
    }, 1000);
  }, 2500);
}

function showOtpPrompt(otp, callback) {
  const modal = document.getElementById("otp-modal");
  if (!modal) return callback(true); // If modal doesn't exist, assume success

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
      callback(false);
    }
  });
}

// Function to wrap secure actions with authentication
function secureAction(action, event) {
  event.preventDefault(); // Prevent the form from submitting immediately
  const form = event.target;

  showBiometricPrompt(() => {
    const otp = generateOtp();
    showOtpPrompt(otp, (isValid) => {
      if (isValid) {
        // If authentication is successful, call the action
        action(form);
      } else {
        showPopup(
          "Invalid OTP. Please try again.",
          "Authentication Failed",
          "error"
        );
      }
    });
  });
}

// Banking Functions for my.html

// Initialize banking data if not exists
function initializeBankingData() {
  const userData = JSON.parse(localStorage.getItem("userAuth"));
  if (!userData) return;

  if (!localStorage.getItem("bankingData_" + userData.customerId)) {
    const initialBankingData = {
      balance: 1000.0, // Starting balance
      creditLimit: userData.accountType === "credit" ? 5000.0 : 0,
      transactions: [
        {
          id: "1",
          date: new Date().toISOString(),
          type: "deposit",
          amount: 1000.0,
          description: "Initial deposit - Account opening",
          balance: 1000.0,
        },
      ],
      lastLogin: new Date().toISOString(),
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
    };
    localStorage.setItem(
      "bankingData_" + userData.customerId,
      JSON.stringify(initialBankingData)
    );
  }
}

// Get banking data
function getBankingData() {
  const userData = JSON.parse(localStorage.getItem("userAuth"));
  if (!userData) return null;

  const bankingData = localStorage.getItem(
    "bankingData_" + userData.customerId
  );
  return bankingData ? JSON.parse(bankingData) : null;
}

// Save banking data
function saveBankingData(data) {
  const userData = JSON.parse(localStorage.getItem("userAuth"));
  if (!userData) return;

  localStorage.setItem(
    "bankingData_" + userData.customerId,
    JSON.stringify(data)
  );
}

// Update last login
function updateLastLogin() {
  const userData = JSON.parse(localStorage.getItem("userAuth"));
  if (!userData) return;

  const bankingData = getBankingData();
  if (bankingData) {
    bankingData.lastLogin = new Date().toISOString();
    saveBankingData(bankingData);
  }
}

// Load account dashboard
function loadAccountDashboard() {
  const userData = JSON.parse(localStorage.getItem("userAuth"));
  const bankingData = getBankingData();

  if (!userData || !bankingData) {
    showPopup(
      "Please log in to access your account.",
      "Authentication Required",
      "warning"
    ).then(() => {
      window.location.href = "./sso.html";
    });
    return;
  }

  try {
    // Populate account info
    const customerIdElement = document.getElementById("customer-id-display");
    if (customerIdElement) {
      customerIdElement.textContent = userData.customerId;
    }

    const accountTypeNames = {
      saveeveryday: "SAVEveryday Account",
      goonsaver: "Goon+ Super Saver",
      credit: "Credit Account",
    };

    const accountTypeElement = document.getElementById("account-type-display");
    if (accountTypeElement) {
      accountTypeElement.textContent =
        accountTypeNames[userData.accountType] || userData.accountType;
    }

    const balanceElement = document.getElementById("balance-display");
    if (balanceElement) {
      balanceElement.textContent = formatCurrency(bankingData.balance);
    }

    const creditElement = document.getElementById("credit-display");
    if (creditElement) {
      if (userData.accountType === "credit") {
        if (!bankingData.creditUtilization) bankingData.creditUtilization = 0;
        const availableCredit =
          bankingData.creditLimit - bankingData.creditUtilization;
        creditElement.textContent = formatCurrency(availableCredit);
        creditElement.parentElement.previousElementSibling.textContent =
          "Available Credit:";
      } else {
        creditElement.textContent = formatCurrency(bankingData.creditLimit);
      }
    }

    const lastLoginElement = document.getElementById("last-login");
    if (lastLoginElement) {
      lastLoginElement.textContent = formatDate(bankingData.lastLogin);
    }

    // Show/hide credit card section based on account type
    const creditSection = document.getElementById("credit-card-section");
    const creditButtons = document.getElementById("credit-card-buttons");

    if (userData.accountType === "credit") {
      if (creditSection) creditSection.style.display = "block";
      if (creditButtons) creditButtons.style.display = "block";
    } else {
      if (creditSection) creditSection.style.display = "none";
      if (creditButtons) creditButtons.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showPopup(
      "Error loading account information. Please try refreshing the page.",
      "System Error",
      "error"
    );
  }
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
    hideAllForms();
    renderTransactionHistory();
    historySection.style.display = "block";
  }
}

function showChangePassword() {
  hideAllForms();
  document.getElementById("change-password-form").style.display = "block";
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
    if (form) form.style.display = "none";
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
    transactionList.innerHTML =
      '<p style="text-align: center;">No transactions found.</p>';
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
    const row = document.createElement("tr");
    const amountColor = tx.amount < 0 ? "#c0392b" : "#27ae60";
    row.innerHTML = `
      <td>${formatDate(tx.date)}</td>
      <td>${tx.type}</td>
      <td>${tx.description}</td>
      <td class="amount" style="color: ${amountColor};">${formatCurrency(
      tx.amount
    )}</td>
      <td class="amount">${formatCurrency(tx.balance)}</td>
    `;
    tbody.appendChild(row);
  });

  transactionList.appendChild(table);
}

// Transaction Processing
function processTransfer(form) {
  const formData = new FormData(form);
  const amount = parseFloat(formData.get("amount"));
  const bankingData = getBankingData();

  if (!validateAmount(amount, bankingData.balance, "transfer")) {
    return;
  }

  const recipientAccount = formData.get("recipientAccount");
  const description = formData.get("description") || "Transfer";

  if (!recipientAccount || recipientAccount.trim().length < 5) {
    showPopup(
      "Please enter a valid recipient account number (minimum 5 characters).",
      "Invalid Input",
      "warning"
    );
    return;
  }

  // Process transfer
  bankingData.balance -= amount;

  const transaction = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    type: "transfer",
    amount: -amount,
    description: `Transfer to ${recipientAccount} - ${description}`,
    balance: bankingData.balance,
  };

  bankingData.transactions.unshift(transaction);
  saveBankingData(bankingData);

  showPopup(
    `Transfer of ${formatCurrency(amount)} processed successfully!`,
    "Transfer Complete",
    "success"
  );
  loadAccountDashboard();
  hideAllForms();
  form.reset();
}

function processDeposit(form) {
  const formData = new FormData(form);
  const amount = parseFloat(formData.get("amount"));
  const bankingData = getBankingData();

  if (!validateAmount(amount, 0, "deposit")) {
    return;
  }

  const depositType = formData.get("depositType");
  const reference = formData.get("reference") || "No reference";

  // Process deposit
  bankingData.balance += amount;

  const transaction = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    type: "deposit",
    amount: amount,
    description: `${depositType} deposit - ${reference}`,
    balance: bankingData.balance,
  };

  bankingData.transactions.unshift(transaction);
  saveBankingData(bankingData);

  showPopup(
    `Deposit of ${formatCurrency(amount)} processed successfully!`,
    "Deposit Complete",
    "success"
  );
  loadAccountDashboard();
  hideAllForms();
  form.reset();
}

function processWithdraw(form) {
  const formData = new FormData(form);
  const amount = parseFloat(formData.get("amount"));
  const bankingData = getBankingData();

  if (!validateAmount(amount, bankingData.balance, "withdraw")) {
    return;
  }

  const withdrawType = formData.get("withdrawType");

  // Process withdrawal
  bankingData.balance -= amount;

  const transaction = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    type: "withdrawal",
    amount: -amount,
    description: `${withdrawType} withdrawal`,
    balance: bankingData.balance,
  };

  bankingData.transactions.unshift(transaction);
  saveBankingData(bankingData);

  showPopup(
    `Withdrawal of ${formatCurrency(amount)} processed successfully!`,
    "Withdrawal Complete",
    "success"
  );
  loadAccountDashboard();
  hideAllForms();
  form.reset();
}

function processBillPay(form) {
  const formData = new FormData(form);
  const amount = parseFloat(formData.get("amount"));
  const bankingData = getBankingData();

  if (!validateAmount(amount, bankingData.balance, "bill payment")) {
    return;
  }

  const payee = formData.get("payee");
  const accountNumber = formData.get("accountNumber");

  // Process bill payment
  bankingData.balance -= amount;

  const transaction = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    type: "bill-payment",
    amount: -amount,
    description: `Payment to ${payee} (Acct: ${accountNumber})`,
    balance: bankingData.balance,
  };

  bankingData.transactions.unshift(transaction);
  saveBankingData(bankingData);

  showPopup(
    `Bill payment of ${formatCurrency(amount)} to ${payee} scheduled.`,
    "Payment Scheduled",
    "success"
  );
  loadAccountDashboard();
  hideAllForms();
  form.reset();
}

// Account Settings Functions
function changePassword(form) {
  const formData = new FormData(form);
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  const userData = JSON.parse(localStorage.getItem("userAuth"));

  if (!userData || userData.password !== currentPassword) {
    showPopup("Incorrect current password.", "Password Change Error", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showPopup("New passwords do not match.", "Password Change Error", "error");
    return;
  }

  if (newPassword.length < 8) {
    showPopup(
      "New password must be at least 8 characters long.",
      "Password Change Error",
      "error"
    );
    return;
  }

  // Update password
  userData.password = newPassword;
  localStorage.setItem("userAuth", JSON.stringify(userData));

  showPopup("Password changed successfully!", "Success", "success");
  hideAllForms();
  form.reset();
}

function updateNotificationSettings(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const emailNotifications = formData.get("emailNotifications") === "on";
  const smsNotifications = formData.get("smsNotifications") === "on";
  const pushNotifications = formData.get("pushNotifications") === "on";

  const bankingData = getBankingData();
  bankingData.notifications.email = emailNotifications;
  bankingData.notifications.sms = smsNotifications;
  bankingData.notifications.push = pushNotifications;

  saveBankingData(bankingData);

  showPopup("Notification settings updated.", "Settings Updated", "success");
  hideAllForms();
}

// Credit Card Functions
function processCreditCardPayment(form) {
  const formData = new FormData(form);
  const amount = parseFloat(formData.get("amount"));
  const bankingData = getBankingData();

  if (!validateAmount(amount, bankingData.balance, "credit card payment")) {
    return;
  }

  const paymentSource = formData.get("paymentSource");

  // Process payment
  bankingData.balance -= amount;
  if (!bankingData.creditUtilization) bankingData.creditUtilization = 0;
  bankingData.creditUtilization -= amount;
  if (bankingData.creditUtilization < 0) bankingData.creditUtilization = 0;

  const transaction = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    type: "credit-payment",
    amount: -amount,
    description: `Credit card payment from ${paymentSource}`,
    balance: bankingData.balance,
  };

  bankingData.transactions.unshift(transaction);
  saveBankingData(bankingData);

  showPopup(
    `Credit card payment of ${formatCurrency(amount)} processed.`,
    "Payment Complete",
    "success"
  );
  loadAccountDashboard();
  hideAllForms();
  form.reset();
}

function processCreditCharge(form) {
  const formData = new FormData(form);
  const amount = parseFloat(formData.get("amount"));
  const bankingData = getBankingData();
  const userData = JSON.parse(localStorage.getItem("userAuth"));

  if (userData.accountType !== "credit") {
    showPopup(
      "This action is only available for credit accounts.",
      "Action Failed",
      "error"
    );
    return;
  }

  if (!bankingData.creditUtilization) bankingData.creditUtilization = 0;
  const availableCredit =
    bankingData.creditLimit - bankingData.creditUtilization;

  if (!validateAmount(amount, availableCredit, "credit charge")) {
    return;
  }

  const description = formData.get("description") || "Store purchase";

  // Process charge
  bankingData.creditUtilization += amount;

  const transaction = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    type: "credit-charge",
    amount: -amount, // Represented as a negative amount in transaction history
    description: `Purchase: ${description}`,
    balance: bankingData.balance, // Balance doesn't change, only credit utilization
  };

  bankingData.transactions.unshift(transaction);
  saveBankingData(bankingData);

  showPopup(
    `Purchase of ${formatCurrency(amount)} approved.`,
    "Purchase Complete",
    "success"
  );
  loadAccountDashboard();
  hideAllForms();
  form.reset();
}

function requestCreditIncrease() {
  secureAction(() => {
    const bankingData = getBankingData();
    const currentLimit = bankingData.creditLimit;
    const requestedLimitStr = prompt(
      `Your current credit limit is ${formatCurrency(
        currentLimit
      )}. What new limit would you like to request?`,
      (currentLimit + 1000).toString()
    );

    if (requestedLimitStr) {
      const requestedLimit = parseFloat(requestedLimitStr);
      if (isNaN(requestedLimit) || requestedLimit <= currentLimit) {
        showPopup(
          "Please enter a valid amount greater than your current limit.",
          "Invalid Amount",
          "error"
        );
        return;
      }

      // Simulate approval
      bankingData.creditLimit = requestedLimit;
      saveBankingData(bankingData);

      showPopup(
        `Credit limit increased to ${formatCurrency(requestedLimit)}. `,
        "Request Approved",
        "success"
      );
      loadAccountDashboard();
    }
  });
}

function logout() {
  sessionStorage.removeItem("loggedIn");
  showPopup("You have been logged out successfully.", "Logout", "success").then(
    () => {
      window.location.href = "../index.html";
    }
  );
}

function printAccountDetails() {
  secureAction(() => {
    window.print();
  });
}

function processAccountUpgrade(form) {
  const formData = new FormData(form);
  const newAccountType = formData.get("newAccountType");
  const userData = JSON.parse(localStorage.getItem("userAuth"));

  if (!userData) return;

  userData.accountType = newAccountType;
  localStorage.setItem("userAuth", JSON.stringify(userData));

  showPopup(
    `Your account has been upgraded to ${newAccountType}! `,
    "Upgrade Complete",
    "success"
  );
  loadAccountDashboard();
  hideAllForms();
  form.reset();
}

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function validateAmount(amount, balance, type) {
  if (isNaN(amount) || amount <= 0) {
    showPopup(
      "Please enter a valid positive amount.",
      "Invalid Amount",
      "error"
    );
    return false;
  }
  if (type !== "deposit" && type !== "credit charge" && amount > balance) {
    showPopup(
      `Insufficient funds for this ${type}. Your balance is ${formatCurrency(
        balance
      )}. `,
      "Transaction Error",
      "error"
    );
    return false;
  }
  return true;
}

// --- Initialization logic ---

function initMyAccountPage() {
  const userData = JSON.parse(localStorage.getItem("userAuth"));
  if (!userData) {
    showPopup(
      "Please sign up first to access this page.",
      "Access Denied",
      "error"
    ).then(() => {
      window.location.href = "./signup.html";
    });
    return;
  }

  // Populate account details
  document.getElementById("customer-id-display").textContent =
    userData.customerId;
  document.getElementById("customer-id-note").textContent = userData.customerId;
  document.getElementById("account-date").textContent =
    new Date().toLocaleDateString();

  const accountTypeNames = {
    saveeveryday: "SAVEveryday Account",
    goonsaver: "Goon+ Super Saver",
    credit: "Credit Account",
  };

  document.getElementById("account-type-display").textContent =
    accountTypeNames[userData.accountType] || userData.accountType;

  const accountDetails = document.getElementById("account-details");
  accountDetails.innerHTML = `
        <div class="section-header">Account Holder Information</div>
        <table class="form-table">
          <tr>
            <td class="label-cell">Full Name:</td>
            <td>${userData.firstName} ${userData.lastName}</td>
          </tr>
          <tr>
            <td class="label-cell">Email:</td>
            <td>${userData.email}</td>
          </tr>
          <tr>
            <td class="label-cell">Phone:</td>
            <td>${userData.phone}</td>
          </tr>
          <tr>
            <td class="label-cell">Date of Birth:</td>
            <td>${userData.dateOfBirth}</td>
          </tr>
        </table>
      `;
}

function initMyDashboardPage() {
  // Check if logged in
  if (sessionStorage.getItem("loggedIn") !== "true") {
    showPopup(
      "You must be logged in to access this page.",
      "Access Denied",
      "error"
    ).then(() => {
      window.location.href = "./sso.html";
    });
    return;
  }

  initializeBankingData();
  loadAccountDashboard();

  // Add secure action listeners
  document
    .querySelector("#transfer-form form")
    .addEventListener("submit", (event) =>
      secureAction(processTransfer, event)
    );
  document
    .querySelector("#deposit-form form")
    .addEventListener("submit", (event) => secureAction(processDeposit, event));
  document
    .querySelector("#withdraw-form form")
    .addEventListener("submit", (event) =>
      secureAction(processWithdraw, event)
    );
  document
    .querySelector("#billpay-form form")
    .addEventListener("submit", (event) => secureAction(processBillPay, event));
  document
    .querySelector("#change-password-form form")
    .addEventListener("submit", (event) => secureAction(changePassword, event));
  document
    .querySelector("#credit-card-form form")
    .addEventListener("submit", (event) =>
      secureAction(processCreditCardPayment, event)
    );
  document
    .querySelector("#credit-charge-form form")
    .addEventListener("submit", (event) =>
      secureAction(processCreditCharge, event)
    );

  // Non-secure listeners
  document
    .getElementById("notification-settings-form")
    .addEventListener("submit", updateNotificationSettings);
  document
    .getElementById("account-upgrade-form")
    .addEventListener("submit", (event) =>
      secureAction(processAccountUpgrade, event)
    );
}

document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname.split("/").pop();

  if (page === "my.html") {
    initMyDashboardPage();
  } else if (page === "myaccount.html") {
    initMyAccountPage();
  }
});
