console.log("SCRIPT LOADED");

// =====================
// CART
// =====================

let cart = [];

// =====================
// เพิ่มสินค้า
// =====================

function addToCart(foodId) {

    console.log("ADD TO CART", foodId);
    
    // หาเมนูจาก foods[]
    const food =
        foods.find((item) => {

            return item.id === foodId;
        });

    // หาเมนูเดิมใน cart
    const existingItem =
        cart.find((item) => {

            return item.id === food.id;
        });

    console.log(food);

    // ถ้ามีแล้ว
    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            id: food.id,

            name: food.name,

            price: food.price,

            quantity: 1
        });
    }

    console.log(cart);

    renderCart();
}


// =====================
// แสดงตะกร้า
// =====================

function renderCart() {

    const cartItems =
        document.getElementById("cart-items");

    const totalPrice =
        document.getElementById("total-price");

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach((item) => {

        total +=
            item.price * item.quantity;

        cartItems.innerHTML += `

            <div class="cart-item">

                <h3>${item.name}</h3>

                <p>
                    🌶 ${item.spicy}
                </p>

                <p>
                    ${item.price} บาท ×
                    ${item.quantity}
                </p>

            </div>
        `;
    });

    totalPrice.innerText = total;
}

    // =====================
    // CHECKOUT
    // =====================

    async function checkout() {

        console.log(cart);

        if (cart.length === 0) {

            alert("กรุณาเลือกอาหารก่อน");

            return;
        }

        let orderMessage =
            "🛒 ออเดอร์ใหม่\n\n";

        let total = 0;

        cart.forEach((item) => {

            orderMessage +=
                `${item.name}\n`;

            orderMessage +=
                `จำนวน: ${item.quantity}\n`;

            orderMessage +=
                `รวม: ${
                    item.price * item.quantity
                } บาท\n\n`;

            total +=
                item.price * item.quantity;
        });

        orderMessage +=
            `💰 ราคารวม ${total} บาท`;

            try {

        await fetch(

            "https://script.google.com/macros/s/AKfycbzHFRyN-zyFLIDAPqSBa9rLOOTDEj6ym71N7pG4LecIpc4-hZ80zptWzWQmyB786RK1Sw/exec",

            {

                method: "POST",

                mode: "no-cors",

                body:
                    new URLSearchParams({

                        message: orderMessage
                    })
            }
        );

                alert("ส่งออเดอร์เรียบร้อย 🎉");

                cart = [];

                renderCart();

            } catch(error) {

                console.error(error);

                alert("เกิดข้อผิดพลาด");
            }
}

// =====================
// LIFF LOGIN
// =====================

async function initializeLIFF() {

    try {

        await liff.init({

            liffId:
                "2010184903-PSIDCmFU"
        });

        if (!liff.isLoggedIn()) {

            liff.login();

            return;
        }

        const profile =
            await liff.getProfile();

        document.getElementById("username")
            .innerText =
            profile.displayName;

        console.log(profile.userId);

    } catch(error) {

        console.error(error);
    }
}

    let foods = [];

    async function loadFoods() {

        const response =
            await fetch(
                "https://script.google.com/macros/s/AKfycbzHFRyN-zyFLIDAPqSBa9rLOOTDEj6ym71N7pG4LecIpc4-hZ80zptWzWQmyB786RK1Sw/exec"
            );

        foods =
            await response.json();

        renderFoods();
    }

        function renderFoods() {

            console.log("renderFoods working");

            const foodContainer =
                document.getElementById("food-container");

            console.log(foodContainer);

            foodContainer.innerHTML = "";

            foods.forEach((food) => {

                foodContainer.innerHTML += `

                    <div class="food-card">

                        <img
                            src="${food.image}"
                            width="300"
                        >

                        <h2>${food.name}</h2>

                        <p>
                            ราคา ${food.price} บาท
                        </p>

                        <button onclick="addToCart(${food.id})">

                            เพิ่มลงตะกร้า

                        </button>

                    </div>

                `;
            });
        }

initializeLIFF();

console.log("CALL RENDER");

loadFoods();