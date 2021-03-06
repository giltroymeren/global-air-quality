const API_BASE_URL = `https://api.openaq.org/v1`

let state = {}

const getSortedData = (data) => {
    return data.sort((a, b) => {
        const newA = a.name || a.code || a.location
        const newB = b.name || b.code || b.location
        return (newA > newB) ? 1 : -1
    })
}

const setCountryField = (data) => {
    state.countries = []
    const field = document.getElementById('country')

    const sortedCountries = getSortedData(data.slice())
    state.countries.push(...sortedCountries)

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
    const field = document.getElementById('city')

    cleanCityField()

    const sortedCities = getSortedData(data.slice())
    state.cities.push(...sortedCities)

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

        const nameContainer = document.createElement('p')
        nameContainer.classList.add('location-name')
        nameContainer.textContent = `${item.city}, ${item.country} `
        const nameSpecific = document.createElement('span')
        nameSpecific.textContent = `(${item.location})`
        nameContainer.appendChild(nameSpecific)

        nameContainer.addEventListener('click', event => {
            const sibling = event.currentTarget.nextElementSibling
            sibling.classList.toggle('open')
        })

        const measurementsContainer = document.createElement('ul')
        item.measurements.map((measurement, index) => {
            const element = document.createElement('li')

            if (index === 0) {
                const textSource = document.createElement('div')
                textSource.classList.add('measurement-source')
                textSource.textContent = measurement.sourceName
                measurementsContainer.appendChild(textSource)
            }

            const textContainer = document.createElement('div')
            textContainer.classList.add('measurement-details')

            const textParam = document.createElement('div')
            textParam.classList.add('measurement-param')
            textParam.textContent = measurement.parameter

            const textValue = document.createElement('div')
            textValue.classList.add('measurement-value')
            textValue.textContent = `${Number(measurement.value).toFixed(2)} `
            const textUnit = document.createElement('span')
            textUnit.textContent = measurement.unit
            textValue.appendChild(textUnit)

            textContainer.appendChild(textParam)
            textContainer.appendChild(textValue)

            element.appendChild(textContainer)
            measurementsContainer.appendChild(element)
        })

        section.appendChild(nameContainer)
        section.appendChild(measurementsContainer)

        container.append(section)
    })
}

const setLocations = data => {
    state.locations = []
    const container = document.getElementById('locations')
    container.innerHTML = ''

    const sortedLocations = getSortedData(data.slice())
    state.locations.push(...sortedLocations)

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