// Utility Functions

function generateCustomerId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
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
      )}.`,
      "Insufficient Funds",
      "error"
    );
    return false;
  }
  return true;
}

// Banking Data Management
function initializeBankingData() {
  const userData = JSON.parse(localStorage.getItem("userAuth"));
  if (!userData) return;

  const dataKey = "bankingData_" + userData.customerId;
  if (!localStorage.getItem(dataKey)) {
    const initialData = {
      balance: 1000.0, // Starting balance for demo
      creditLimit: 5000.0,
      creditUtilization: 0.0,
      transactions: [],
      lastLogin: new Date().toISOString(),
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
    };
    localStorage.setItem(dataKey, JSON.stringify(initialData));
  }
}

function getBankingData() {
  const userData = JSON.parse(localStorage.getItem("userAuth"));
  if (!userData) return null;

  const dataKey = "bankingData_" + userData.customerId;
  const bankingData = localStorage.getItem(dataKey);
  return bankingData ? JSON.parse(bankingData) : null;
}

function saveBankingData(data) {
  const userData = JSON.parse(localStorage.getItem("userAuth"));
  if (!userData) return;

  const dataKey = "bankingData_" + userData.customerId;
  localStorage.setItem(dataKey, JSON.stringify(data));
}

function updateLastLogin() {
  const userData = JSON.parse(localStorage.getItem("userAuth"));
  if (!userData) return;

  const bankingData = getBankingData();
  if (bankingData) {
    bankingData.lastLogin = new Date().toISOString();
    saveBankingData(bankingData);
  }
}
