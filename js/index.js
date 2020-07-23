const API_BASE_URL = `https://api.openaq.org/v1`

const setCountriesToField = data => {
    const countries = data.results
    const field = document.getElementById('country')

    countries.map(country => {
        const option = document.createElement('option')
        option.textContent = country.name ? country.name : country.code
        option.value = country.code

        field.appendChild(option)
    })
}

const getCountries = async () => {
    await fetch(`${API_BASE_URL}/countries`)
        .then(response => response.json())
        .then(data => setCountriesToField(data))
        .catch(error => console.error(error.message))
}

getCountries()