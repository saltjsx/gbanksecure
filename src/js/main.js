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
