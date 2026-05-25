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

            "https://script.google.com/macros/s/AKfycbxdmMy9J1qJcMxoJYZYv1V9en2ixGxWFXaR-Z0mpocbTvUAtEhR9rKM3J7jGYa8XJcf2w/exec",

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

    const foods = [

        {
            id: 1,
            name: "ข้าวกะเพราหมูกรอบ",
            category: "อาหารจานหลัก",
            price: 80,
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop"
        },

        {
            id: 2,
            name: "ผัดซีอิ๊ว",
            category: "อาหารจานหลัก",
            price: 70,
            image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop"
        },

        {
            id: 3,
            name: "ชาไทย",
            category: "เครื่องดื่ม",
            price: 45,
            image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1200&auto=format&fit=crop"
        }

    ];

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

renderFoods();