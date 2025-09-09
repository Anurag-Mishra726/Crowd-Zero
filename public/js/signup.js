document.getElementById('signup-form').addEventListener('submit', async function (e){
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('terms').checked;

    const error = validateForm({name, email, password, confirmPassword, termsAccepted});

    if (error) {
        showWarning(error);
        return;
    }

    const res = await fetch('/signup', {
        method: 'Post',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({
            name, 
            email, 
            password, 
            confirmPassword, 
            terms:termsAccepted
        })
    });

    const data = await res.json();

    if (data.status === 'success') {
        document.getElementsByClassName('container')[0].style.filter = 'blur(2px)';
        signedUpSuccessfully();
        setTimeout(() => {
            window.location.href = data.redirectTo;
        }, 1500);
    }else{
        showWarning(data.message);
    }
});

function showWarning(message){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'flex';
    document.getElementsByClassName('container')[0].style.filter = 'blur(2px)';
    errorMessage.style.opacity = '1';
    errorMessage.querySelector('.warning-message').textContent = "⚠️ " + message;
}
function signedUpSuccessfully(){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'flex';
    document.getElementsByClassName('container')[0].style.filter = 'blur(2px)';
    errorMessage.style.opacity = '1';
    errorMessage.querySelector('.warning-message').innerHTML = "🛍️ Welcome to <strong>Crowd Zero!</strong> Your style journey begins now."
}
function closeWarning(){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'none';
    document.getElementsByClassName('container')[0].style.filter = 'none';
}

function validateForm({ name, email, password, confirmPassword, termsAccepted }) {
    if (!name || name.trim().length === 0) {
        return "Name can not be empty.";
    }

    if(name.length < 2){
        return "Name is too short."
    } 

    const trimmed = name.trim();
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;

    if (!nameRegex.test(trimmed)) {
        return "Please enter a valid name (only letters, spaces, hyphens, or apostrophes).";
    }

    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
        return "Name must contain only letters and spaces.";
    }

    let checkEmail = validateEmail(email);
    if(checkEmail){
        return checkEmail;
    }

    if (!password || password.length < 6) {
        return "Password must be at least 6 characters.";
    }
    if (password !== confirmPassword) {
        return "Passwords do not match.";
    }
    if (!termsAccepted) {
        showWarning('Please accept the terms and conditions');
        return;
    }

    return null; 
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return "Please enter a valid email address.";
    }

    return null;
}
