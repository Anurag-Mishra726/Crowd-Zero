document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const passwordField = document.getElementById(targetId);
      const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordField.setAttribute('type', type);
      
        if(type === 'text'){
           this.classList.replace('fa-eye-slash', 'fa-eye');
        } else{
            this.classList.replace('fa-eye', 'fa-eye-slash');
        }
    });
});

