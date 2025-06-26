$(document).ready(function () {
  function register(){
    const customer = {
    firstName: $("#firstName").val(),
    lastName: $("#lastName").val(),
    email: $("#email").val(),
    dob: $("#dob").val(),
    phone: $("#phone").val(),
    address: $("#address").val(),
    password: $("#confirmPassword").val(),
  }
  localStorage.setItem("customer", JSON.stringify(customer));
  }
  let customerinfo = localStorage.getItem("customer");
  console.log(JSON.parse(newObject));
  
});
