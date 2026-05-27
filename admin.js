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

                <h3>
                    ${food.name}
                </h3>

                <p>
                    ${food.price} บาท
                </p>

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

async function deleteFood(id) {

    await fetch(API_URL, {

        method: "POST",

        body:
            new URLSearchParams({

                action: "delete",

                id
            })
    });

    alert("ลบเมนูแล้ว");

    loadFoods();
}

loadFoods();