import {
  initMyDashboardPage,
  initMyAccountPage,
  initSsoPage,
  initSignupPage,
} from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname.split("/").pop();

  if (page === "my.html") {
    initMyDashboardPage();
  } else if (page === "myaccount.html") {
    initMyAccountPage();
  } else if (page === "sso.html") {
    initSsoPage();
  } else if (page === "signup.html") {
    initSignupPage();
  }
});

function initMyDashboardPageLocal() {
  // Check login status
  if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "./sso.html";
    return;
  }

  initializeBankingData();
  updateLastLogin();
  loadAccountDashboard();

  // Attach event listeners for forms
  const transferForm = document.querySelector("#transfer-form form");
  if (transferForm) {
    transferForm.addEventListener("submit", (e) =>
      secureAction(processTransfer, e)
    );
  }

  const depositForm = document.querySelector("#deposit-form form");
  if (depositForm) {
    depositForm.addEventListener("submit", (e) =>
      secureAction(processDeposit, e)
    );
  }

  const withdrawForm = document.querySelector("#withdraw-form form");
  if (withdrawForm) {
    withdrawForm.addEventListener("submit", (e) =>
      secureAction(processWithdraw, e)
    );
  }

  const billpayForm = document.querySelector("#billpay-form form");
  if (billpayForm) {
    billpayForm.addEventListener("submit", (e) =>
      secureAction(processBillPay, e)
    );
  }

  const changePasswordForm = document.querySelector(
    "#change-password-form form"
  );
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", (e) =>
      secureAction(changePassword, e)
    );
  }

  const creditCardForm = document.querySelector("#credit-card-form form");
  if (creditCardForm) {
    creditCardForm.addEventListener("submit", (e) =>
      secureAction(processCreditCardPayment, e)
    );
  }

  const creditChargeForm = document.querySelector("#credit-charge-form form");
  if (creditChargeForm) {
    creditChargeForm.addEventListener("submit", (e) =>
      secureAction(processCreditCharge, e)
    );
  }

  // Add event listeners for buttons with data-action
  document.body.addEventListener("click", function (event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;

    const action = target.dataset.action;

    switch (action) {
      case "logout":
        logout();
        break;
      case "showTransferForm":
        showTransferForm();
        break;
      case "showDepositForm":
        showDepositForm();
        break;
      case "showWithdrawForm":
        showWithdrawForm();
        break;
      case "showBillPayForm":
        showBillPayForm();
        break;
      case "toggleTransactionHistory":
        toggleTransactionHistory();
        break;
      case "refreshDashboard":
        loadAccountDashboard();
        break;
      case "showCreditCardForm":
        showCreditCardForm();
        break;
      case "showCreditCardStatement":
        showCreditCardStatement();
        break;
      case "requestCreditIncrease":
        requestCreditIncrease();
        break;
      case "showCreditChargeForm":
        hideAllForms();
        document.getElementById("credit-charge-form").style.display = "block";
        break;
    }
  });
}
