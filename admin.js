const API_URL =
    "https://script.google.com/macros/s/AKfycbzZEoDK6YYFyMTW4asCYS4q-5XWLs7Q_wGye-1Np_zbQhIx2kBXKPIdG1lv8aP5NPxfiA/exec";

let foods = [];

// =====================
// LOAD FOODS
// =====================

async function loadFoods() {

    const response =
        await fetch(API_URL);

    foods =
        await response.json();

    renderFoods();
}

// =====================
// RENDER FOODS
// =====================

function renderFoods() {

    const container =
        document.getElementById(
            "admin-food-list"
        );

    container.innerHTML = "";

    foods.forEach((food) => {

        container.innerHTML += `

            <div class="food-card">

                <img
                    src="${food.image}"
                    width="200"
                >

                <input
                    type="text"
                    id="name-${food.id}"
                    value="${food.name}"
                >

                <input
                    type="number"
                    id="price-${food.id}"
                    value="${food.price}"
                >

                <input
                    type="text"
                    id="image-${food.id}"
                    value="${food.image}"
                >

                <button
                    onclick="updateFood(${food.id})"
                >

                    บันทึก

                </button>

                <button
                    onclick="deleteFood(${food.id})"
                >

                    ลบเมนู

                </button>

            </div>

        `;
    });
}

// =====================
// ADD FOOD
// =====================

async function addFood() {

    const name =
        document.getElementById(
            "food-name"
        ).value;

    const price =
        document.getElementById(
            "food-price"
        ).value;

    const image =
        document.getElementById(
            "food-image"
        ).value;

    await fetch(API_URL, {

        method: "POST",

        body:
            new URLSearchParams({

                action: "add",

                name,
                price,
                image
            })
    });

    alert("เพิ่มเมนูแล้ว");

    loadFoods();
}

async function updateFood(id) {

    const name =
        document.getElementById(
            `name-${id}`
        ).value;

    const price =
        document.getElementById(
            `price-${id}`
        ).value;

    const image =
        document.getElementById(
            `image-${id}`
        ).value;

    await fetch(API_URL, {

        method: "POST",

        body:
            new URLSearchParams({

                action: "update",

                id,

                name,

                price,

                image
            })
    });

    alert("แก้ไขเมนูแล้ว");

    loadFoods();
}

 loadFoods();