    document.getElementById('login-form').addEventListener('submit', async function(e){
        e.preventDefault();
        document.getElementsByClassName('container')[0].style.filter = 'blur(2px)';
        const email = document.getElementById('email').value;
        const password = document.getElementById("password").value;

        const error = await validateForm({email, password});

        if(error){
            showWarning(error);
            return;
        }

        const res = await fetch('/login', {
            method: 'Post',
            headers: {'Content-Type' : 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                email, 
                password
            })
        })

        const data = await res.json();

        if (data.status === 'success') {
            //alert(data.message);
            document.getElementsByClassName('container')[0].style.filter = 'none';
            loginSuccessfully();
            setTimeout(() => {
                window.location.href = data.redirectTo;
            }, 1000);
            
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
function loginSuccessfully(){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'flex';
    document.getElementsByClassName('container')[0].style.filter = 'blur(2px)';
    errorMessage.style.opacity = '1';
    errorMessage.querySelector('.warning-message').textContent = "🛍️ Logged in. Let's find something you'll love."
}
function closeWarning(){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'none';
    document.getElementsByClassName('container')[0].style.filter = 'none';
}

async function validateForm({email, password}){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return "Please enter a valid email address.";
    }

    if (!password || password.length < 6) {
        return "Password must be at least 6 characters.";
    }
    return null;
}