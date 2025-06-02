onReady(() => {
  const token = localStorage.getItem("jwt");
  if (token) {
    window.location.href = "admin-dashboard.html";
    return;
  }

  document
    .getElementById("adminLoginForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("adminUsername").value.trim();
      const password = document.getElementById("adminPassword").value.trim();
      const errorDiv = document.getElementById("adminLoginError");
      errorDiv.textContent = "";

      try {
        const res = await fetchJSON("/api/admin/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });
        localStorage.setItem("jwt", res.token);
        window.location.href = "admin-dashboard.html";
      } catch (err) {
        errorDiv.textContent = "Geçersiz kullanıcı adı veya parola.";
      }
    });
});
