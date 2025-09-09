# 🛒 Crowd Zero 
[![Crowd Zero](https://img.shields.io/badge/Crowd%20Zero-Live%20Website-2D9BF0?style=for-the-badge&logo=google-chrome&logoColor=white)](https://crowd-zero-production.up.railway.app)


![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-555555?style=for-the-badge&logo=javascript&logoColor=yellow)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Railway](https://img.shields.io/badge/Hosted%20on-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Test%20Mode-02042B?style=for-the-badge&logo=razorpay&logoColor=white)

Crowd Zero is a dynamic e-commerce website built using **EJS, CSS, JavaScript, Node.js, Express.js, and MySQL**.  
It provides users with a seamless shopping experience, including category-wise product browsing, detailed product pages, cart management, orders, and more.  

Currently, the website is optimized for **desktop/laptop** use and is not fully responsive for mobile devices.  


---

## 🚀 Features

- 📂 **Category-wise product browsing**
- 🔍 **Product details page** with images, description, price
- 🛒 **Cart & Order management**
- 👤 **User Profile page**
- 🔑 **Authentication** (Signup/Login) with **session-based auth**
- 📝 **Reviews & Ratings**  of products
- 🛠️ **Account management** (delete account option)
- 🏬 **Become a Seller** (post products to sell)
- 📄 Static pages → Contact, About, FAQ
- 🏦 **Razorpay Integration (Test Mode)** for payments (no real money used)
- 🖥️ **Dynamic EJS templates** → server-side rendering
- 📡 **API-based communication** between frontend & backend
- 📦 **Service Layer** for reusable functions
- 🌐**Router-based backend structure** for organized routes
---

## 🛠️ Tech Stack

- **Frontend:**  
  - EJS (HTML templating)  
  - CSS  
  - JavaScript  

- **Backend:**  
  - Node.js  
  - Express.js  

- **Database:**  
  - MySQL  

- **Authentication:** 
  - Session-based

- **Payment Gateway:** 
  - Razorpay (Test Mode)

- **Hosting:**
  - Railway 

- **Other:**  
  - MVC-style folder structure with services and routes  

---

## 📂 Project Structure
```
crowd-zero/
│── public/ # Static files (CSS, client-side JS, images)
│── src/
│── router/ # Express route files
│── services/ # Shared functions used across APIs
│── views/ # EJS templates for UI rendering
│── package.json # Dependencies
|── pakage-lock.json # Auto generated
│── app.js # Main server file
│── README.md # Documentation

```
---

## ⚙️ Installation (For Developers)

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd crowd-zero
   ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Setup the MySQL database:

    -   Create a database crowd_zero

    -   Import tables for products, users, carts, orders, reviews, etc.

    -   Update credentials in .env

4. Create a .env file in the root directory:
    ```bash
    DB_DATABASE=your-database-name
    DB_HOST=your-db-host
    DB_USER=your-db-username
    DB_PASS=your-db-password
    DB_NAME=crowd_zero
    SESSION_SECRET=your-session-secret
    RAZORPAY_KEY_ID=your-razorpay-test-key
    RAZORPAY_KEY_SECRET=your-razorpay-test-secret
    PORT=3000
    ```

5. Start the development server:
    ```bash 
    npm start
    ```

6. Open the app in browser:
    ```bash
    http://localhost:3000
    ```

---

## 🌐 Usage (For Users)

- *Open the website.*

- *Create an account or log in.*

- *Browse products by category.*

- *Click a product to view details and reviews.*

- *Add items to your cart.*

- *Place an order from the cart.*

- *Make a test payment using Razorpay sandbox*

- *Manage your profile (update details, delete account, etc.).*

- *Use other pages: Contact, About, FAQ.*

## 💳 Payments

- Crowd Zero integrates Razorpay for handling payments.
Currently, the integration is in Test Mode, meaning:

- All transactions are simulated using Razorpay’s sandbox environment

- No real money is involved

- Developers can test payments using Razorpay’s test cards and UPI IDs

*🔮 Future Plan: Enable **Live Mode** for real transactions once production-ready*

## ⚠️ Limitations

- ❌ Not mobile responsive (works best on laptops/desktops)

- ❌ Payment gateway only works in Test Mode

- ❌ No admin dashboard yet

## 👨‍💻 Author

- Anurag Mishra

- GitHub: [https://github.com/Anurag-Mishra726/Crowd-Zero]

- Crowd Zero: [https://crowd-zero-production.up.railway.app]

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Anurag-Mishra726/Crowd-Zero)


[![Crowd Zero](https://img.shields.io/badge/Crowd%20Zero-Live%20Website-2D9BF0?style=for-the-badge&logo=google-chrome&logoColor=white)](https://crowd-zero-production.up.railway.app)