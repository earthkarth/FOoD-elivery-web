const API_URL =
    "https://script.google.com/macros/s/AKfycbxt9npSPQaR8vtnySTkjwHe8dJRwHwXRTFblpZm4zG-Uq7a00j3vGFijGKKLSgJHdJ4Ig/exec";

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

            return Number(item.id) === Number(foodId);
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
        document.getElementById(
            "cart-items"
        );

    const totalPrice =
        document.getElementById(
            "total-price"
        );

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach((item) => {

        total +=
            item.price * item.quantity;

        cartItems.innerHTML += `

            <div class="cart-item">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    ${item.spicy || ""}
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

            alert("ยังไม่มีสินค้า");

            return;
        }

        let message =

            "🛒 ออเดอร์ใหม่\n\n";

        cart.forEach((item) => {

            message +=

                `${item.name}
                x ${item.quantity}\n`;
        });

        const total =

            cart.reduce((sum, item) =>

                sum +
                item.price * item.quantity

            , 0);

        message += `\n💰 รวม ${total} บาท`;

        if (window.liff) {

            await liff.sendMessages([{

                type: "text",

                text: message

            }]);

            alert("ส่งออเดอร์เข้า LINE แล้ว");
        }
    }

// =====================
// LIFF LOGIN
// =====================

async function initializeLIFF() {

    try {

        await liff.init({

            liffId:
                "2010184903-n2TCZvo7"
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

    let currentCategory = "ทั้งหมด";

    let searchText = "";

    async function loadFoods() {

        const response =
            await fetch(API_URL);

        const data =
            await response.json();

        foods = data;

        console.log(data);

        renderFoods();
    }

    function filterCategory(category) {

    currentCategory = category;

    renderFoods();
}



        //  renderFoods();

        function renderFoods() {

            const foodContainer =
                document.getElementById(
                    "food-container"
                );

            foodContainer.innerHTML = "";

            searchText =
                document
                    .getElementById(
                        "search-input"
                    )
                    .value
                    .toLowerCase();

            foods.forEach((food) => {

                // FILTER CATEGORY
                if (

                    currentCategory !== "ทั้งหมด"

                    &&

                    food.category !== currentCategory

                ) {

                    return;
                }

                // SEARCH
                if (

                    !food.name
                        .toLowerCase()
                        .includes(searchText)

                ) {

                    return;
                }

                foodContainer.innerHTML += `

                    <div class="food-card">

                        <img src="${food.image}">

                        <div class="food-card-content">

                            <h2>
                                ${food.name}
                            </h2>

                            <p>
                                ${food.category}
                            </p>

                            <p>
                                ราคา ${food.price} บาท
                            </p>

                            <button
                                onclick="addToCart(${food.id})"
                            >

                                เพิ่มลงตะกร้า

                            </button>

                        </div>

                    </div>

                `;
            });
        }

// หมวดหมู่
function filterCategory(category) {

    if (category === "ทั้งหมด") {

        renderFoods();

        return;
    }

    const filteredFoods =

        foods.filter((food) =>

            food.category === category
        );

    const container =

        document.getElementById(
            "food-container"
        );

    container.innerHTML = "";

    filteredFoods.forEach((food) => {

        container.innerHTML += `

            <div class="food-card">

                <img src="${food.image}">

                <h2>
                    ${food.name}
                </h2>

                <p>
                    ${food.price} บาท
                </p>

            </div>

        `;
    });
}

initializeLIFF();

console.log("CALL RENDER");

loadFoods();