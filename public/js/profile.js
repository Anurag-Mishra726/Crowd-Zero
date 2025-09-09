const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const inputs = document.querySelectorAll('#profileForm input');
const profileImage = document.getElementById('profileImage');
const profileImageInput = document.getElementById('profileImageInput');
const profileImageContainer = document.getElementById('profileImageContainer');
const form = document.querySelector(".profile-form");

let initialValues = {};
inputs.forEach(i => initialValues[i.name] = i.value);

editBtn.onclick = () => {
  inputs.forEach(i => {
    if (i.name != 'email') {
        i.readOnly = false
    }
  });
  editBtn.classList.add('hidden');
  saveBtn.classList.remove('hidden');
  cancelBtn.classList.remove('hidden');
}

cancelBtn.onclick = () => {
  inputs.forEach(i => { i.value = initialValues[i.name]; i.readOnly = true; });
  saveBtn.classList.add('hidden');
  cancelBtn.classList.add('hidden');
  editBtn.classList.remove('hidden');
}


form.addEventListener("submit", async (e) => {

    e.preventDefault();
    inputs.forEach( async i => { initialValues[i.name] = i.value; i.readOnly = true; });
    saveBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    editBtn.classList.remove('hidden');

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
       const response = await fetch("/profile/update/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if(!result.success){
        showWarning(result.message)
      }
      if (result.success) {
        showMessage(result.message, "success");
      } else {
        showMessage(result.message, "error");
      }
    } catch (err) {
      showMessage("Something went wrong!");
      console.log(err);
    }
  });

  function showMessage(message) {
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'flex';
    document.getElementsByClassName('main')[0].style.filter = 'blur(2px)';
    errorMessage.style.opacity = '1';
    errorMessage.querySelector('.warning-message').textContent = "✅ " + message;

    setTimeout(() => {
        closeWarning();
    }, 2000);
}

function showWarning(message){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'flex';
    document.getElementsByClassName('main')[0].style.filter = 'blur(2px)';
    errorMessage.style.opacity = '1';
    errorMessage.querySelector('.warning-message').textContent = "⚠️ " + message;
}

function closeWarning(){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'none';
    document.getElementsByClassName('main')[0].style.filter = 'none';
}