// Banking Functions

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
    showPopup("Invalid recipient account number.", "Transfer Error", "error");
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
    showPopup("Incorrect current password.", "Error", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showPopup("New passwords do not match.", "Error", "error");
    return;
  }

  if (newPassword.length < 8) {
    showPopup("Password must be at least 8 characters long.", "Error", "error");
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
    showPopup("This action is only for credit accounts.", "Error", "error");
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
    amount: -amount, // This is a charge, so it's represented as negative in some contexts
    description: `Purchase: ${description}`,
    balance: bankingData.balance, // Balance of checking/savings, not credit
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
    showPopup(
      "Your request for a credit limit increase has been submitted for review.",
      "Request Submitted",
      "success"
    );
  });
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
