const API_BASE_URL = `https://api.openaq.org/v1`

const setFilterToField = (data, filterField) => {
    const filters = data.results
    const field = document.getElementById(filterField)

    if (filterField === 'city') {
        field.querySelectorAll('*').forEach(child => field.removeChild(child))
    }

    filters.map(filter => {
        const option = document.createElement('option')
        option.textContent = filter.name || filter.code
        option.value = filter.code

        field.appendChild(option)
    })
}

const getData = async (url, handleSuccess, filterField = '') => {
    await fetch(`${API_BASE_URL}${url}`)
        .then(response => response.json())
        .then(data => handleSuccess(data, filterField))
        .catch(error => console.error(error.message))
}

const setLatestData = data => {
    const locations = data.results
    const container = document.getElementById('locations')

    locations.map(item => {
        const section = document.createElement('div')
        section.classList.add('location')
        section.setAttribute('data-country', item.country)
        section.setAttribute('data-city', item.city)

        const name = document.createElement('p')
        name.textContent = `${item.location}, ${item.city}`

        const measurementsContainer = document.createElement('ul')
        item.measurements.map(measurement => {
            const element = document.createElement('li')
            const text = document.createElement('p')

            const textValue = document.createElement('span')
            textValue.textContent = measurement.value

            const textParam = document.createElement('span')
            textParam.textContent = measurement.parameter

            const textSource = document.createElement('span')
            textSource.textContent = measurement.sourceName

            text.appendChild(textValue)
            text.appendChild(textParam)
            text.appendChild(textSource)

            element.appendChild(text)
            measurementsContainer.appendChild(element)
        })

        section.appendChild(name)
        section.appendChild(measurementsContainer)

        container.append(section)
    })
}

getData('/countries', setFilterToField, 'country')

const countryField = document.getElementById('country')
countryField.addEventListener('change', event => {
    const country = event.target.value
    console.log(country)
    getData(`/cities?country=${country}`, setFilterToField, 'city')
})

getData('/latest', setLatestData)