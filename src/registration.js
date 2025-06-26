$(document).ready(function () {
  // This part handles the click event on the registration page
  $("#registerButton").on("click", function (e) {
    // Prevent the link inside the button from navigating immediately
    e.preventDefault();

    const customer = {
      firstName: $("#firstName").val(),
      lastName: $("#lastName").val(),
      email: $("#email").val(),
      dateOfBirth: $("#dob").val(),
      phone: $("#phone").val(),
      address: $("#address").val(),
      password: $("#confirmPassword").val(),
      customerID: Math.floor(100000 + Math.random() * 900000),
    };

    // Store the customer details in local storage
    localStorage.setItem("customer", JSON.stringify(customer));

    // Now, navigate to the details page
    window.location.href = "details.html";
  });

  // This part runs when the details page loads
  // It checks for an element that only exists on the details page
  if ($("#detFirstname").length) {
    const customer = JSON.parse(localStorage.getItem("customer"));

    if (customer) {
      $("#detFirstname").text(customer.firstName);
      $("#detLastName").text(customer.lastName);
      $("#detEmail").text(customer.email);
      $("#detDob").text(customer.dateOfBirth);
      $("#detPhone").text(customer.phone);
      $("#detAddress").text(customer.address);
      $("#detConfirmPassword").text(customer.password);
      $("#detCustomerId").text(customer.customerID);
    }
  }
});
