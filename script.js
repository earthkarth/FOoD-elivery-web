console.log("SCRIPT LOADED");

// =====================
// CART
// =====================

let cart = [];

// =====================
// เพิ่มสินค้า
// =====================

function addToCart() {

    let basePrice = 80;

    let toppings = [];

    let extraPrice = 0;

    const spicyLevel =
        document.getElementById("spicy-level").value;

    // ไข่ดาว
    if (
        document.getElementById("egg").checked
    ) {

        toppings.push("ไข่ดาว");

        extraPrice += 15;
    }

    // ชีส
    if (
        document.getElementById("cheese").checked
    ) {

        toppings.push("ชีส");

        extraPrice += 20;
    }

    const finalPrice =
        basePrice + extraPrice;

    // หาเมนูเดิม
    const existingItem =
        cart.find((item) => {

            return (

                item.spicy === spicyLevel &&

                JSON.stringify(item.toppings)
                === JSON.stringify(toppings)

            );
        });

    // ถ้ามีแล้ว
    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            name: "ข้าวกะเพราหมูกรอบ",

            spicy: spicyLevel,

            toppings: toppings,

            price: finalPrice,

            quantity: 1
        });
    }

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
                    🍳 ${item.toppings.join(", ")}
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

    if (cart.length === 0) {

        alert("กรุณาเลือกอาหารก่อน");

        return;
    }

    let orderMessage =
        "🛒 ออเดอร์ใหม่\n\n";

    let total = 0;

    cart.forEach((item) => {

        orderMessage +=
            `🍛 ${item.name}\n`;

        orderMessage +=
            `🌶 ${item.spicy}\n`;

        orderMessage +=
            `🍳 ${item.toppings.join(", ")}\n`;

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

    console.log(orderMessage);

    try {

        await fetch(
            "https://script.google.com/macros/s/AKfycbyvnhR0GAzEGZzJQtYLJ6jMAr9J3kWwMUeVR6v46FNRBTHDGh5VccT6l-UrYmL8rg10/exec",

            {

                method: "POST",

                mode: "no-cors",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

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

initializeLIFF();