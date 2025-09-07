const btnInc = document.querySelectorAll(".btn-inc");
const btnDec = document.querySelectorAll(".btn-dec");
const quantity = document.querySelectorAll(".quantity-input");

btnDec.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        let currentVal = parseInt(quantity[index].value) || 1;
        if (quantity[index].value <= 2) {
            btn.disabled = true;
        }
        if (currentVal > 1 ) {
            quantity[index].value = currentVal - 1;
        }
    });
});

btnInc.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        let currentVal = parseInt(quantity[index].value) || 1;
            quantity[index].value = currentVal + 1;
            if (currentVal >= 1) {
                btnDec[index].disabled = false;
            }
    });
});

const quantityControl = document.querySelectorAll(".quantity-controls");
const debounceTimers = new Map();

quantityControl.forEach((control) => {
    control.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-inc') || e.target.classList.contains('btn-dec')) {
            const quantityInput = e.target.closest('.quantity-controls').querySelector('.quantity-input');
            const newQuantity = quantityInput.value;
            const productId = e.target.dataset.productId; 
            
            if (debounceTimers.has(productId)) {
                clearTimeout(debounceTimers.get(productId));
            }

            const timer = setTimeout(async () => {
                await updateCart(productId, newQuantity, e);
            }, 500); 

            debounceTimers.set(productId, timer);
        }
    });
});


async function updateCart(productId, newQuantity, e){

    try {
        const response = await fetch(`/cart/api/cart/${productId}`,{
            method : "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                quantity: parseInt(newQuantity),
            })
        });
    
        const responseInJson = await response.json();
        if (responseInJson.status === "success") {
            await updateCartUi(e);
            showAddedToCartMessage(responseInJson.message);
          } else if (responseInJson.status === "unauthorized") {
            showWarning(responseInJson.message);
            setTimeout(() => {
                const currentUrl = window.location.pathname;  
                window.location.href = `/login?redirectTo=${encodeURIComponent(currentUrl)}`;
            }, 1000);
          } else {
            showWarning(responseInJson.message);
          } 
    } catch (error) {
        showWarning("Server error. Please try again later.");
    }
}

async function updateCartUi(e){
    try {
        
        const response = await fetch("/cart/updatedData",{
            method: "GET",
            headers:{
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });
        const result = await response.json();
        if (result.status === "unauthorized") {
            showWarning(result.message);
            return;
        }
        if (!response.ok) {
            showWarning(result.message || "Failed to fetch updated cart data.");
            return;
        }
        if (e == 'summary-only') {
            document.querySelector(".sub-total").innerHTML = `<strong>$${parseFloat(result.subTotal).toLocaleString()}</strong>`;
            document.querySelector(".discount-percentage").innerHTML = `<strong>${parseFloat((((result.subTotal - result.grandTotal) / result.subTotal) * 100).toFixed(2)).toLocaleString()}% off</strong>`;
            document.querySelector(".grand-total").innerHTML = `<strong>$${parseFloat(result.grandTotal).toLocaleString()}</strong><strong><small>(INR - ${parseFloat(result.grandTotal * 88).toLocaleString('en-IN', {style: 'currency', currency: 'INR', minimumFractionDigits: 2})})</small></strong>`;
            return;
        }
        
        result.cartItems.forEach(items => {
            if (items.cart_id == e.target.closest("tr").dataset.cartId) {
                e.target.closest("tr").querySelector(".total-col").innerHTML = `$${parseFloat(items.totalPrice).toLocaleString()}`;
                document.querySelector(".sub-total").innerHTML = `<strong>$${parseFloat(result.subTotal).toLocaleString()}</strong>`;
                document.querySelector(".discount-percentage").innerHTML = `<strong>${parseFloat((((result.subTotal - result.grandTotal) / result.subTotal) * 100).toFixed(2)).toLocaleString()}% off</strong>`;
                document.querySelector(".grand-total").innerHTML = `<strong>$${parseFloat(result.grandTotal).toLocaleString()}</strong> <strong><small>(INR - ${parseFloat(result.grandTotal * 88).toLocaleString('en-IN', {style: 'currency', currency: 'INR', minimumFractionDigits: 2})})</small></strong>`;
            }
        })

    } catch (error) {
        console.error(error);
    }
}

const removeButtons = document.querySelectorAll(".remove-col");
removeButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        const productId = e.target.dataset.productId;
        try {
            const response = await fetch(`/cart/api/cart/${productId}`,{
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ productId: productId}),
                credentials: 'include',
            });

            const result = await response.json();
            if (result.status === "success") {

                const row = e.target.closest(".cart-row");
                row.classList.add("removing");

                row.addEventListener("transitionend", async () => {
                    row.remove();
                    if (document.querySelectorAll("tbody tr").length === 0) {
                        document.querySelector(".summary").style.display = 'none'
                        document.querySelector("tbody").innerHTML = `
                        <tr>
                            <td colspan="5" class="cart-empty">
                                <h3>Your cart is empty <i class="fa-solid fa-cart-plus" style="color: #000000;"></i></h3>
                                <a href="/products">Start Shopping</a>
                            </td>
                        </tr>`;
                        // setTimeout(() => window.location.reload(), 2500);
                        return;
                    }
                    await updateCartUi("summary-only");
                }, { once: true });
                showAddedToCartMessage(result.message);                
              } else if (result.status === "unauthorized") {
                showWarning(result.message);
                setTimeout(() => {
                    const currentUrl = window.location.pathname;  
                    window.location.href = `/login?redirectTo=${encodeURIComponent(currentUrl)}`;
                }, 1500);
              } else {
                showWarning(result.message);
              } 
        } catch (error) {
            console.log(error);
            showWarning("Server error. Please try again later.");
        }
    });
});

function showAddedToCartMessage(message) {
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'flex';
    //document.getElementsByClassName('container')[0].style.filter = 'blur(2px)';
    errorMessage.style.opacity = '1';
    errorMessage.querySelector('.warning-message').textContent = "✅ " + message;

    setTimeout(() => {
        closeWarning();
    }, 1500);
}

function showWarning(message){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'flex';
    //document.getElementsByClassName('container')[0].style.filter = 'blur(2px)';
    errorMessage.style.opacity = '1';
    errorMessage.querySelector('.warning-message').textContent = "⚠️ " + message;
}

function closeWarning(){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'none';
    //document.getElementsByClassName('container')[0].style.filter = 'none';
}

if (document.querySelector('.summary')) {
    const checkout = document.querySelector(".checkout");
    checkout.addEventListener('click', () => {
    window.location.href = '/billing';
})
}