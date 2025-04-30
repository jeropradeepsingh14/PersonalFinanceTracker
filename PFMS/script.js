document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expense-form");
    const expenseList = document.getElementById("expense-list");
    const filterCategory = document.getElementById("filter-category");
    const expenseCategorySelect = document.getElementById("expense-category");

    const totalIncomeEl = document.getElementById("total-income");
    const totalExpenseEl = document.getElementById("total-expense");
    const balanceEl = document.getElementById("balance");

    // Predefined categories
    const categories = ["Food", "Transport", "Entertainment", "Salary", "Deposit", "Received", "Other"];

    // Populate the category select dropdown dynamically
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        expenseCategorySelect.appendChild(option);
    });

    // Load entries from localStorage or initialize to an empty array if no data
    let currentUser = localStorage.getItem("currentUser");
    let allUsers = JSON.parse(localStorage.getItem("users")) || {};
    
    if (!currentUser || !allUsers[currentUser]) {
        alert("Please log in first.");
        window.location.href = "login.html";
    }
    
    let entries = allUsers[currentUser].entries || [];
    

    // Initial call to display entries and update totals
    applyFilter();

    // Add new entry when form is submitted
    expenseForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("expense-name").value;
        const amount = parseFloat(document.getElementById("expense-amount").value);
        const category = document.getElementById("expense-category").value;
        const date = document.getElementById("expense-date").value;
        const type = document.querySelector('input[name="entry-type"]:checked').value;

        const entry = {
            id: Date.now(),
            name,
            amount,
            category,
            date,
            type
        };

        // Add new entry to the entries array
        entries.push(entry);

        // Save updated entries to localStorage
        function saveEntriesToStorage(updatedEntries) {
            allUsers[currentUser].entries = updatedEntries;
            localStorage.setItem("users", JSON.stringify(allUsers));
        }
        

        // Update the table and totals
        applyFilter();

        // Reset the form
        expenseForm.reset();
    });

    // Handle click on Edit or Delete buttons in the entries table
    expenseList.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);

        if (e.target.classList.contains("delete-btn")) {
            // Remove the entry from the entries array
            entries = entries.filter(entry => entry.id !== id);

            // Save the updated entries to localStorage
            saveEntriesToStorage(entries);

            // Update the table and totals
            applyFilter();
        }

        if (e.target.classList.contains("edit-btn")) {
            // Find the entry to edit
            const entry = entries.find(entry => entry.id === id);

            // Pre-fill the form with the entry's data
            document.getElementById("expense-name").value = entry.name;
            document.getElementById("expense-amount").value = entry.amount;
            document.getElementById("expense-category").value = entry.category;
            document.getElementById("expense-date").value = entry.date;
            document.querySelector(`input[value="${entry.type}"]`).checked = true;

            // Remove the entry from the array and save the updated array to localStorage
            entries = entries.filter(entry => entry.id !== id);
            saveEntriesToStorage(entries);

            // Update the table and totals
            applyFilter();
        }
    });

    // Filter entries by category
    filterCategory.addEventListener("change", applyFilter);

    // Function to filter and display entries
    function applyFilter() {
        const category = filterCategory.value;
        const filtered = category === "All"
            ? entries
            : entries.filter(entry => entry.category === category);

        // Display entries in the table
        displayEntries(filtered);

        // Update total income, expenses, and balance
        updateTotals(filtered);
    }

    // Function to display entries in the table
    function displayEntries(list) {
        expenseList.innerHTML = "";
        list.forEach(entry => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${entry.name}</td>
                <td>${entry.type === "Income" ? "+" : "-"} ₹${entry.amount.toFixed(2)}</td>
                <td>${entry.category}</td>
                <td>${entry.date}</td>
                <td>
                    <button class="edit-btn" data-id="${entry.id}">Edit</button>
                    <button class="delete-btn" data-id="${entry.id}">Delete</button>
                </td>
            `;
            expenseList.appendChild(row);
        });
    }

    // Function to update the totals
    function updateTotals(list) {
        const income = list.filter(e => e.type === "Income")
            .reduce((sum, e) => sum + e.amount, 0);

        const expense = list.filter(e => e.type === "Expense")
            .reduce((sum, e) => sum + e.amount, 0);

        const balance = income - expense;

        totalIncomeEl.textContent = income.toFixed(2);
        totalExpenseEl.textContent = expense.toFixed(2);
        balanceEl.textContent = balance.toFixed(2);
    }

    // Function to save entries to localStorage
    function saveEntriesToStorage(entries) {
        localStorage.setItem('entries', JSON.stringify(entries));
    }

    // Function to load entries from localStorage
    function loadEntriesFromStorage() {
        const savedEntries = localStorage.getItem('entries');
        return savedEntries ? JSON.parse(savedEntries) : [];
    }
});
