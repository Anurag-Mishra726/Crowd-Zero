document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".newsletter-form form");
    const emailInput = document.getElementById("email");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); 
  
      const email = emailInput.value.trim();
      if (!email) return alert("Please enter a valid email.");
  
      try {
        const response = await fetch("newsletter/api/newsletter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          showMessage("Thank you for subscribing!", "success");
          emailInput.value = ""; 
        } else {
          showMessage(data.error || "Something went wrong!", "error");
        }
      } catch (err) {
        console.error(err);
        showMessage("Network error. Please try again later.", "error");
      }
    });
  
    function showMessage(msg, type) {
      let messageEl = document.querySelector(".newsletter-message");
      if (!messageEl) {
        messageEl = document.createElement("p");
        messageEl.className = "newsletter-message";
        document.querySelector(".newsletter-container").appendChild(messageEl);
      }
      messageEl.textContent = msg;
      messageEl.style.color = type === "success" ? "#ffff" : "#ffff";
    }
  });

