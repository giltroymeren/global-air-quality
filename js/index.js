const API_BASE_URL = `https://api.openaq.org/v1`

let state = {}

const setCountryField = (data) => {
    state.countries = []
    state.countries.push(...data)
    const field = document.getElementById('country')

    state.countries.map(country => {
        const option = document.createElement('option')
        option.textContent = country.name || country.code
        option.value = country.code

        field.appendChild(option)
    })
}

const cleanCityField = () => {
    const field = document.getElementById('city')
    field.selectedIndex = 0

    field.querySelectorAll('*').forEach(child => {
        if (!child.value) return
        field.removeChild(child)
    })
}

const setCityField = (data) => {
    state.cities = []
    state.cities.push(...data)
    const field = document.getElementById('city')

    cleanCityField()

    state.cities.map(city => {
        const option = document.createElement('option')
        option.textContent = city.name || city.code
        option.value = city.city

        field.appendChild(option)
    })

    field.removeAttribute('disabled')
}

const getData = async (url, handleSuccess) => {
    await fetch(`${API_BASE_URL}${url}`)
        .then(response => response.json())
        .then(data => handleSuccess(data.results))
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

const setLocations = data => {
    state.locations = []
    state.locations.push(...data)
    const container = document.getElementById('locations')
    container.innerHTML = ''

    constructLocations(state.locations, container)
}

document.getElementById('country').addEventListener('change', event => {
    const country = event.target.value

    if (country !== '') {
        getData(`/cities?country=${country}`, setCityField)
    } else {
        const cityField = document.getElementById('city')
        cleanCityField()
        prepareLocations()
    }

    document.getElementById('city').setAttribute('disabled', true)
})

const prepareLocations = () => {
    if (state.locations.length) {
        setLocations(state.locations)
    } else {
        getData('/latest', setLocations)
    }
}

const setResultLocations = (country, city) => {
    getData(`/latest?country=${country}&city=${city}`, data => {
        const container = document.getElementById('locations')
        container.querySelectorAll('*').forEach(child => {
            if (container.contains(child))
                container.removeChild(child)
        })
        constructLocations(data, container)
    })
}

document.getElementById('city').addEventListener('change', event => {
    const city = event.target.value
    const country = document.getElementById('country').value

    if (country === '' && city === '') {
        prepareLocations()
    } else {
        setResultLocations(country, city)
    }
})

window.addEventListener('DOMContentLoaded', () => {
    getData('/countries', setCountryField, 'country')
    getData('/latest', setLocations)
})