const form = document.querySelector(".contact__form");
if (form) {
  const fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    topic: document.getElementById("topic"),
    message: document.getElementById("message"),
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  Object.values(fields).forEach((field) => {
    const errorElem = document.createElement("div");
    errorElem.className = "field-error";
    errorElem.style.color = "red";
    errorElem.style.fontSize = "0.9rem";
    errorElem.style.marginTop = "4px";
    errorElem.style.display = "none";
    field.parentNode.insertBefore(errorElem, field.nextSibling);

    field.addEventListener("input", () => {
      const value = field.value.trim();
      let message = "";

      if (!value) {
        message = "This field is required!";
      } else if (field.id === "email" && !emailRegex.test(value)) {
        message = "Please enter a valid email!";
      }

      if (message) {
        errorElem.textContent = message;
        errorElem.style.display = "block";
        field.style.borderColor = "red";
      } else {
        errorElem.style.display = "none";
        field.style.borderColor = "";
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let hasError = false;

    Object.values(fields).forEach((field) => {
      const value = field.value.trim();
      const errorElem = field.nextSibling;

      if (!value || (field.id === "email" && !emailRegex.test(value))) {
        errorElem.style.display = "block";
        field.style.borderColor = "red";
        if (!hasError) field.focus();
        hasError = true;
      }
    });

    if (!hasError) {
      alert("Form submitted successfully!");
      form.reset();

      Object.values(fields).forEach((field) => {
        field.nextSibling.style.display = "none";
        field.style.borderColor = "";
      });
    }
  });
}
