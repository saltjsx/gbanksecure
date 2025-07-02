import { showBiometricPrompt, showOtpPrompt, showPopup } from "./ui.js";
import { generateCustomerId } from "./utils.js";
import { initializeBankingData, updateLastLogin } from "./banking.js";

// Handle form submission
export function handleSignup(event) {
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
export function handleLogin(event) {
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

// Function to wrap secure actions with authentication
export function secureAction(action, event) {
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

export function logout() {
  sessionStorage.removeItem("loggedIn");
  showPopup("You have been logged out successfully.", "Logout", "success").then(
    () => {
      window.location.href = "../index.html";
    }
  );
}

// --- Initialization logic ---

export function initMyAccountPage() {
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

export function initMyDashboardPage() {
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

export function initSsoPage() {
  const loginForm = document.querySelector(".login-form-container form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
}

export function initSignupPage() {
  const signupForm = document.querySelector(".signup-form-container form");
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }
}
