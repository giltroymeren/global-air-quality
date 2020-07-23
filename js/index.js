const API_BASE_URL = `https://api.openaq.org/v1`

const setCountriesToField = data => {
    const countries = data.results
    const field = document.getElementById('country')

    countries.map(country => {
        const option = document.createElement('option')
        option.textContent = country.name || country.code
        option.value = country.code

        field.appendChild(option)
    })
}

const setCitiesToField = data => {
    const countries = data.results
    const field = document.getElementById('city')

    countries.map(city => {
        const option = document.createElement('option')
        option.textContent = city.name
        option.value = city.code

        field.appendChild(option)
    })
}

const getData = async (url, handleSuccess) => {
    await fetch(`${API_BASE_URL}${url}`)
        .then(response => response.json())
        .then(data => handleSuccess(data))
        .catch(error => console.error(error.message))
}

getData('/countries', setCountriesToField)
getData('/cities', setCitiesToField)