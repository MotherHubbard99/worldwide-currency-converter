console.log("The currency converter has loaded!");

//DOM elements ids from html file
const usdInput = document.getElementById("usd-input");
const countrySelect = document.getElementById("country-select");
const resultDiv = document.getElementById("conversion-result");
const errorMessages = document.getElementById("error-messages");


//country-select: loading country options from API
async function loadCountries() {
    try {
        //const response = await fetch("https://restcountries.com/v3.1/all"); //API server not sending the required CORS headers
        const response = await fetch("https://countriesnow.space/api/v0.1/countries/currency");
        const data = await response.json();
        const countries = data.data; // Adjusted to match the new API response structure

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
            //used for conversion and for fetching historical data for the chart
            option.value = country.currency;
            // display country name in the dropdown
            option.dataset.name = country.name;
            // Store ISO2 code for later use in country info card
            option.dataset.iso2 = country.iso2; 
            // Store currency code for country info card
            option.dataset.currency = country.currency; 

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
function convertCurrency() {
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

    //savefor history chart
    localStorage.setItem('lastUSD', usdAmount);
    localStorage.setItem('lastCurrency', selectedCurrency);

    //clear error messages
    errorMessages.textContent = "";

    //fetch exchange rate from API and calculate conversion
    fetch(`https://open.er-api.com/v6/latest/USD`)
        .then(response => response.json())
        .then(data => {
            const exchangeRate = data.rates[selectedCurrency];
            if (exchangeRate) {
                const convertedAmount = usdAmount * exchangeRate;
                resultDiv.textContent = `Converted Amount: ${convertedAmount.toFixed(2)} ${selectedCurrency}`;
            } else {
                errorMessages.textContent = "Error fetching exchange rate. Please try again later.";
            }
        })
        .catch(error => {
            console.error("Error fetching exchange rate:", error);
            errorMessages.textContent = "Error fetching exchange rate. Please try again later.";
        });

}

//event listener for convert 
function setupEventListeners() {
    usdInput.addEventListener("input", convertCurrency);
    
    countrySelect.addEventListener("change", () => {
        const selected = countrySelect.options[countrySelect.selectedIndex];

        if (!selected.value) {
            document.getElementById("country-card").innerHTML = "";
            return;
        }

        const country = {
            name: selected.dataset.name,
            currency: selected.dataset.currency,
            iso2: selected.dataset.iso2
        };

        showCountryInfo(country);
        convertCurrency();
    });
}

//initialize the app by loading countries and setting up event listeners
loadCountries();


//run conversion automatically if both values exist in localStorage
if  (savedUSD && localStorage.getItem('lastCurrency')) {
    convertCurrency();
}

setupEventListeners();