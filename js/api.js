

//countries API
export async function loadCountriesAPI() {
    
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/currency");

    const data = await response.json();
   
    return data.data.map(country => ({
        name: country.name,
        currency: country.currency,
        iso2: country.iso2
    }));
}

//get latest exchange rates
export async function getExchangeRate(targetCurrency) {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();
    return data.rates[targetCurrency];
}

