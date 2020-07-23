const API_BASE_URL = `https://api.openaq.org/v1`

const setFilterToField = (data, filterField) => {
    const filters = data.results
    const field = document.getElementById(filterField)

    if (filterField === 'city') {
        field.querySelectorAll('*').forEach(child => {
            if (!child.value) return
            field.removeChild(child)
        })
    }

    filters.map(filter => {
        const option = document.createElement('option')
        option.textContent = filter.name || filter.code
        option.value = (filterField === 'country') ? filter.code : filter.city

        field.appendChild(option)
    })
}

const getData = async (url, handleSuccess, filterField = '') => {
    await fetch(`${API_BASE_URL}${url}`)
        .then(response => response.json())
        .then(data => handleSuccess(data, filterField))
        .catch(error => console.error(error.message))
}

const constructLocations = (locations, container) => {
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

            const textValue = document.createElement('p')
            textValue.textContent = `${measurement.parameter}: ${measurement.value}`

            const textSource = document.createElement('div')
            textSource.textContent = measurement.sourceName

            element.appendChild(textValue)
            element.appendChild(textSource)
            measurementsContainer.appendChild(element)
        })

        section.appendChild(name)
        section.appendChild(measurementsContainer)

        container.append(section)
    })
}

const setLatestData = data => {
    const locations = data.results
    const container = document.getElementById('locations')

    constructLocations(locations, container)
}

const countryField = document.getElementById('country')
countryField.addEventListener('change', event => {
    const country = event.target.value
    getData(`/cities?country=${country}`, setFilterToField, 'city')
})

const cityField = document.getElementById('city')
cityField.addEventListener('change', event => {
    const city = event.target.value
    const country = document.getElementById('country').value

    getData(`/latest?country=${country}&city=${city}`, data => {
        const container = document.getElementById('locations')
        container.querySelectorAll('*').forEach(child => {
            if (container.contains(child))
                container.removeChild(child)
        })
        constructLocations(data.results, container)
    })
})

window.addEventListener('DOMContentLoaded', () => {
    getData('/countries', setFilterToField, 'country')
    getData('/latest', setLatestData)
})