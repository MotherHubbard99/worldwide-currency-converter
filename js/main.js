console.log("The currency converter has loaded!");

//DOM elements ids from html file
const usdInput = document.getElementById("usd-input");
const currencySelect = document.getElementById("country-select");
const convertButton = document.getElementById("conversion-result");
const resultDiv = document.getElementById("country-info");

//country-select 
function loadCountries() {
    countrySelect.innerHTML = "<option value=''>Select a country</option>";
}


//event listener for convert button
function setupEventListeners() {
    usdInput.addEventListener("input", convertCurrency);
    currencySelect.addEventListener("change", convertCurrency);

    countrySelect.addEventListener("change", function () {
        const selectedCountry = countrySelect.value;
        if (selectedCountry) {
            convertCurrency();
        }
    });
}


loadCountries();
setupEventListeners();