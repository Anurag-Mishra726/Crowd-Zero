document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('payment-method');
    const iconElement = document.querySelector('.payment-dropdown-icon');

    selectElement.addEventListener('click', () => {
        iconElement.classList.toggle('is-rotated');
    });
});

document.addEventListener('DOMContentLoaded', async() => {
    const selectElement = document.getElementById('payment-method');
    const submitButton = document.getElementById('submit-payment');
    const modal = document.getElementById('payment-modal');
    const modalContent = document.querySelector('.modal-content > p');
    const paymentconfirm = document.getElementById('order-success-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const paymentconfirmCloseBtn = document.getElementById('order-success-ok');

    // Validate selection and show the pop-up
    submitButton.addEventListener('click', async() => {
        const selectedValue = selectElement.value;
        if (selectedValue === '') {
            modal.style.display = 'flex';
        }else if(document.querySelector('.total-amount-in-inr').dataset.inr >= 100000 && selectedValue === "online"){
            modalContent.innerText = "For payments above ₹1,00,000, please use Cash on Delivery payment method.";
            modal.style.display = 'flex';
            return;
        }else if(selectedValue == "cash" || "online") {
            await order();
        }
    });
    
    modalCloseBtn.addEventListener('click', async () => {
        modal.style.display = 'none';
        window.location.reload();
    });
    paymentconfirmCloseBtn.addEventListener('click', () => {
        paymentconfirm.style.display = 'none';
        window.location.reload();
    });


    async function order(){
        try {
            const orderStatus = await fetch(`/billing/api/order${window.location.search}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethod: selectElement.value
                }),
                credentials : 'include'
                
            })
        const response = await orderStatus.json();
        
        if(response.status === "success"){
            paymentconfirm.style.display = 'flex';
        }else if (response.status === "created") {
                const options = {
                    key: response.key,
                    amount: response.amount,
                    currency: response.currency,
                    name: "Crowd Zero",
                    description: "Order Payment",
                    order_id: response.razorpayOrderId,
                    handler: async function (rzpResponse) {
                        // Call backend to verify payment
                        const verify = await fetch(`/billing/api/payment/verify${window.location.search}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: rzpResponse.razorpay_order_id,
                                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                                razorpay_signature: rzpResponse.razorpay_signature
                            }),
                            credentials: "include"
                        });
                        const verifyRes = await verify.json();
    
                        if (verifyRes.status === "success") {
                            paymentconfirm.style.display = 'flex';
                        } else {
                            modalContent.innerText = verifyRes.message || "Payment failed!";
                            modal.style.display = 'flex';
                        }
                        
                    },
                    modal: {
                        ondismiss: async function () {
                            const cancelOrder = await fetch(`/billing/api/order/cancel${window.location.search}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ razorpayOrderId: response.razorpayOrderId }),
                                credentials: "include"
                            });
                            const cancelRes = await cancelOrder.json();
                            if (cancelRes.status === "cancelled") {
                                modalContent.innerText = "Payment cancelled!";
                                modal.style.display = 'flex';
                            } else {
                                modalContent.innerText = cancelRes.message || "Unable to cancel order. Please contact support.";
                                modal.style.display = 'flex';
                            }
                        }
                    },
                    theme: {
                        color: "#3399cc"
                    }
                };
    
                const rzp = new Razorpay(options);

                rzp.on("payment.failed", function (response) {
                    modalContent.innerText = response.error.description || "Payment failed!";
                    modal.style.display = 'flex';
            
                    console.error("Payment failed:", response.error);
                });
                rzp.open();

        }else if(response.status === "unauthorized"){

            modalContent.innerText = response.message;
            modal.style.display = 'flex';

            setTimeout(() => {
                const currentUrl = window.location.pathname;  
                window.location.href = `/login?redirectTo=${encodeURIComponent(currentUrl)}`;
            }, 1500);
        }else if(response.status === "error"){
            modalContent.innerText = response.message;
            modal.style.display = 'flex';
        }
        } catch (error) {
            modalContent.innerText = "Server error. Please try again later.";
            modal.style.display = 'flex';
        }
    }
});