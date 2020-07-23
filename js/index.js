const API_BASE_URL = `https://api.openaq.org/v1`

const setFilterToField = (data, filterField) => {
    const filters = data.results
    const field = document.getElementById(filterField)

    filters.map(filter => {
        const option = document.createElement('option')
        option.textContent = filter.name || filter.code
        option.value = filter.code

        field.appendChild(option)
    })
}

const getData = async (url, handleSuccess, filterField) => {
    await fetch(`${API_BASE_URL}${url}`)
        .then(response => response.json())
        .then(data => handleSuccess(data, filterField))
        .catch(error => console.error(error.message))
}

getData('/countries', setFilterToField, 'country')
getData('/cities', setFilterToField, 'city')