document.addEventListener("DOMContentLoaded", function() {
    // Mock data pro demonstrační účely
    const recipes = [
        { id: 1, name: "Škůdce 1", description: "Popis 1", date: "2024-06-01", ingredients: [{name: "Složka 1", amount: 100}] },
        { id: 2, name: "Škůdce 2", description: "Popis 2", date: "2024-06-02", ingredients: [{name: "Složka 2", amount: 200}] }
    ];

    // Získání reference na HTML elementy
    const recipeTableBody = document.getElementById('recipeTableBody');
    const editModal = document.getElementById('editModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const saveRecipeButton = document.getElementById('saveRecipeButton');
    const addRecipeButton = document.getElementById('addRecipeButton');
    let currentRecipeId = null;

    // Funkce pro renderování seznamu receptur
    function renderRecipes() {
        // Vyčištění obsahu tabulky
        recipeTableBody.innerHTML = '';
        // Pro každou recepturu vytvoří nový řádek v tabulce
        recipes.forEach(recipe => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${recipe.name}</td>
                <td>${recipe.date}</td>
                <td>
                    <button onclick="editRecipe(${recipe.id})">Upravit</button>
                    <button onclick="deleteRecipe(${recipe.id})">Smazat</button>
                </td>
            `;
            // Přidání nového řádku do tabulky
            recipeTableBody.appendChild(row);
        });
    }

    // Funkce pro otevření modálního okna a naplnění formuláře pro úpravu receptury
    window.editRecipe = function(id) {
        currentRecipeId = id;
        const recipe = recipes.find(r => r.id === id);
        if (recipe) {
            document.getElementById('recipeName').value = recipe.name;
            document.getElementById('recipeDescription').value = recipe.description;
            const ingredientsList = document.getElementById('ingredientsList');
            ingredientsList.innerHTML = '';
            recipe.ingredients.forEach(ingredient => {
                const ingredientDiv = document.createElement('div');
                ingredientDiv.innerHTML = `
                    <label for="ingredientName">Složka:</label>
                    <input type="text" name="ingredientName" value="${ingredient.name}">
                    <label for="ingredientAmount">Dávkování v g/l:</label>
                    <input type="number" name="ingredientAmount" value="${ingredient.amount}">
                `;
                ingredientsList.appendChild(ingredientDiv);
            });
            editModal.style.display = "block";
        }
    }

    // Funkce pro smazání receptury
    window.deleteRecipe = function(id) {
        const index = recipes.findIndex(r => r.id === id);
        if (index > -1) {
            recipes.splice(index, 1);
            renderRecipes();
        }
    }

    // Funkce pro přidání nové receptury
    addRecipeButton.onclick = function() {
        currentRecipeId = null;
        document.getElementById('recipeName').value = '';
        document.getElementById('recipeDescription').value = '';
        const ingredientsList = document.getElementById('ingredientsList');
        ingredientsList.innerHTML = '';
        const ingredientDiv = document.createElement('div');
        ingredientDiv.innerHTML = `
            <label for="ingredientName">Složka:</label>
            <input type="text" name="ingredientName" value="">
            <label for="ingredientAmount">Dávkování v g/l:</label>
            <input type="number" name="ingredientAmount" value="">
        `;
        ingredientsList.appendChild(ingredientDiv);
        editModal.style.display = "block";
    }

    // Funkce pro zavření modálního okna
    closeBtn.onclick = function() {
        editModal.style.display = "none";
    }

    // Zavření modálního okna při kliknutí mimo něj
    window.onclick = function(event) {
        if (event.target === editModal) {
            editModal.style.display = "none";
        }
    }

    // Funkce pro uložení (přidání nebo úpravu) receptury
    saveRecipeButton.onclick = function() {
        const recipeName = document.getElementById('recipeName').value;
        const recipeDescription = document.getElementById('recipeDescription').value;
        const ingredientsDivs = document.getElementById('ingredientsList').children;
        const ingredients = Array.from(ingredientsDivs).map(div => {
            return {
                name: div.querySelector('[name="ingredientName"]').value,
                amount: div.querySelector('[name="ingredientAmount"]').value
            };
        });

        if (currentRecipeId) {
            // Pokud je currentRecipeId nastaveno, upravuje existující recepturu
            const recipe = recipes.find(r => r.id === currentRecipeId);
            if (recipe) {
                recipe.name = recipeName;
                recipe.description = recipeDescription;
                recipe.ingredients = ingredients;
            }
        } else {
            // Pokud není currentRecipeId nastaveno, přidává novou recepturu
            const newRecipe = {
                id: recipes.length ? Math.max(...recipes.map(r => r.id)) + 1 : 1,
                name: recipeName,
                description: recipeDescription,
                date: new Date().toISOString().split('T')[0],
                ingredients: ingredients
            };
            recipes.push(newRecipe);
        }

        // Aktualizuje zobrazení receptur a zavře modální okno
        renderRecipes();
        editModal.style.display = "none";
    }

    // Inicializace - zobrazení receptur po načtení stránky
    renderRecipes();
});
