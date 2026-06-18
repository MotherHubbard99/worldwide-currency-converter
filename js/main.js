import {
    loadCountriesAPI,
    getExchangeRate
} from "./api.js";


console.log("The currency converter has loaded!");

//DOM elements ids from html file
const usdInput = document.getElementById("usd-input");
const countrySelect = document.getElementById("country-select");
const resultDiv = document.getElementById("conversion-result");
const errorMessages = document.getElementById("error-messages");


//country-select: loading country options from API
async function loadCountries() {
    try {
        const countries = await loadCountriesAPI();

        //sort countries alphabetically
        countries.sort((a, b) => a.name.localeCompare(b.name));

        //Reset the country select options
        countrySelect.innerHTML = "<option value=''>Select a country</option>";

        // Populate the country select dropdown with country names and their corresponding currency codes
        countries.forEach(country => {
            // Only include countries that have currency information
            if (!country.currency) return;

            const option = document.createElement("option");
            // currency code for exchange rate API
            //used for country info card
            option.value = country.currency; //needed for converted amount output: DON'T DELETE
            option.dataset.currency = country.currency;
            // display country name in the dropdown
            option.dataset.name = country.name;
            // Store ISO2 code for later use in country info card
            option.dataset.iso2 = country.iso2; 
            
            option.textContent = country.name;

            countrySelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading countries:", error);
        errorMessages.textContent = "Error loading country options. Please try again later.";
    }   
    // save for history chart
    const savedCurrency = localStorage.getItem('lastCurrency');
    if (savedCurrency) {
        countrySelect.value = savedCurrency;
    }
}

function showCountryInfo(country) {
    const countryCard = document.getElementById("country-card");

    countryCard.innerHTML = `
        <h3>${country.name}</h3>
        <img src="https://flagsapi.com/${country.iso2}/flat/64.png" alt="Flag of ${country.name}">
        <p>Currency: ${country.currency}</p>
    `;
}

const savedUSD = localStorage.getItem('lastUSD');
if (savedUSD) {
    usdInput.value = savedUSD;
}

if (savedUSD && localStorage.getItem('lastCurrency')) {
    convertCurrency();
}

//convert currency function
async function convertCurrency() {
    const usdAmount = parseFloat(usdInput.value);
    const selectedCurrency = countrySelect.value;

    //validation for user input
    if (!usdAmount || usdAmount <= 0) {
        errorMessages.textContent = "Please enter a valid amount in US Dollars.";
        resultDiv.textContent = "";
        return;
    }

    //Validate country selection
    if (!selectedCurrency) {
        errorMessages.textContent = "Please select a country.";
        resultDiv.textContent = "";
        return;
    }

    //save to local storage
    localStorage.setItem('lastUSD', usdAmount);
    localStorage.setItem('lastCurrency', selectedCurrency);
    

    //clear error messages
    errorMessages.textContent = "";

    //favorites
    addFavorite(selectedCurrency);
    showStoredValues();

    //fetch exchange rate from API and calculate conversion
    const rate = await getExchangeRate(selectedCurrency);

    if (!rate) {
        errorMessages.textContent = "Error fetching exchange rate.";
        return;
    }

    const convertedAmount = usdAmount * rate;
    resultDiv.textContent = `Converted Amount: ${convertedAmount.toFixed(2)} ${selectedCurrency}`;

    //show favorite
    showStoredValues();
}

//event listener for convert 
function setupEventListeners() {
    usdInput.addEventListener("input", convertCurrency);
    
    countrySelect.addEventListener("change", () => {
        const selected = countrySelect.options[countrySelect.selectedIndex];

        const currency = selected.value;

        const country = {
            name: selected.dataset.name,
            currency: selected.dataset.currency,
            iso2: selected.dataset.iso2, 
        };

        showCountryInfo(country);
        convertCurrency();
    });
}

function addFavorite(currency) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (!favorites.includes(currency)) {
        favorites.push(currency);
        localStorage.setItem('favorites', JSON.stringify(favorites))
    }
}

function showStoredValues() {
    const output = document.getElementById('storage-output');

    const lastUSD = localStorage.getItem('lastUSD') || 'None saved';
    const lastCurrency = localStorage.getItem('lastCurrency') || 'None saved';
    const favoritesList = JSON.parse(localStorage.getItem('favorites')) || [];

    const favoritesHTML = favoritesList.length > 0
        ? favoritesList.map(fav => `
            <span class='favorite-item'>
                ${fav}
                <button class='remove-fav' data-currency='${fav}'>✖</button>
            </span>
        `).join('')
        : 'None saved';

    output.innerHTML = `
        <h3>Saved Data</h3>
        <p><strong>Last USD Amount:</strong> ${lastUSD}</p>
        <p><strong>Last Currency Code:</strong> ${lastCurrency}</p>
         <p><strong>Favorites:</strong> ${favoritesHTML}</p>
    `;
     // attach remove handlers
    document.querySelectorAll(".remove-fav").forEach(btn => {
        btn.addEventListener("click", () => {
            removeFavorite(btn.dataset.currency);
        });
    });

}

//remove from favorites
function removeFavorite(currency) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    favorites = favorites.filter(fav => fav !== currency);

    localStorage.setItem('favorites', JSON.stringify(favorites));

    //refresh
    showStoredValues(); 
}


//initialize the app by loading countries and setting up event listeners
loadCountries();


//run conversion automatically if both values exist in localStorage
if  (savedUSD && localStorage.getItem('lastCurrency')) {
    convertCurrency();
}

//favorites
showStoredValues();

setupEventListeners();