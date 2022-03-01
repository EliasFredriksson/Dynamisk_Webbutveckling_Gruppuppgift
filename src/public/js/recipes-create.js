let currentIngredients = [];

window.onload = () => {
    document.getElementById("add-ingredient").addEventListener("click", () => {
        let ingredientForm = document.getElementById("add-ingredient-form");
        ingredientForm.reportValidity();
        if (ingredientForm.checkValidity()) {
            addIngredient();
        }
    });

    document.getElementById("submit-recipe").addEventListener("click", (e) => {
        e.preventDefault();
        let recipeForm = document.getElementById("submit-recipe-form");
        recipeForm.reportValidity();
        if (recipeForm.checkValidity()) {
            if (currentIngredients.length == 0) {
                triggerIngredientAlert();
            } else {
                AddRecipe();
            }
        }
    });

    renderIngredients();
};

function addIngredient() {
    let name = document.getElementById("ingredient").value;
    let amount = document.getElementById("amount").value;
    let unit = document.getElementById("unit").value;
    let category = document.getElementById("category").value;

    let newIngredient = {
        ingredient: name,
        amount: parseFloat(amount),
        unit: unit,
        category: category,
    };
    currentIngredients.push(newIngredient);
    renderIngredients();
}

function renderIngredients() {
    console.log(currentIngredients);

    let currentIngredientsContainer = document.getElementById(
        "current-ingredients"
    );
    currentIngredientsContainer.innerHTML = "";

    if (currentIngredients.length == 0) {
        let emptyMessageContainer = document.createElement("div");
        emptyMessageContainer.id = "empty-ingredients-container";
        let emptyMessageTag = document.createElement("span");
        emptyMessageContainer.id = "empty-ingredients-message";
        emptyMessageTag.innerText = "Lägg till lite ingredienser!";
        emptyMessageContainer.appendChild(emptyMessageTag);
        currentIngredientsContainer.appendChild(emptyMessageContainer);
    } else {
        currentIngredients.forEach((entry, index) => {
            let ingredientDiv = document.createElement("div");
            ingredientDiv.className = "ingredient";

            let nameTag = document.createElement("span");
            nameTag.innerText = entry.ingredient;
            nameTag.className = "ingredient-name";

            let amountTag = document.createElement("span");
            amountTag.innerText = entry.amount + entry.unit;
            amountTag.className = "ingredient-amount";

            let categoryTag = document.createElement("span");
            categoryTag.innerText = entry.category;
            categoryTag.className = "ingredient-category";

            ingredientDiv.appendChild(nameTag);
            ingredientDiv.appendChild(amountTag);
            ingredientDiv.appendChild(categoryTag);

            let deleteButton = document.createElement("i");
            deleteButton.className = "fas fa-trash-alt";
            deleteButton.addEventListener("click", () => {
                currentIngredients.splice(index, 1);
                renderIngredients();
            });
            ingredientDiv.appendChild(deleteButton);

            currentIngredientsContainer.appendChild(ingredientDiv);
        });
    }
}

function triggerIngredientAlert() {
    let textTag = document.getElementById("empty-ingredients-message");
    textTag.classList.add("pulsating");
    setTimeout(() => {
        textTag.classList.remove("pulsating");
    }, 1500);
}

function AddRecipe() {
    fetch(window.location.href, {
        method: "POST",
        body: JSON.stringify({
            name: document.getElementById("recipe-name").value,
            description: document.getElementById("recipe-description").value,
            ingredients: currentIngredients,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((newRecipeId) => {
            console.log("DATA: ", newRecipeId);
            window.location.href = `${window.location.origin}/recipes/${newRecipeId}`;
        })
        .catch((error) => {
            console.log("ERROR: ", error);
        });
}
