const search = document.getElementById('search')
const msg = document.querySelector('.msg')
const switcher = document.querySelector('.switch')
const iconMoon = document.querySelector('.icon.moon')
const region = document.getElementById('region')
const loading = document.getElementById('loading')
const content = document.querySelector('.content')
const clearButton = document.getElementById('clear-btn')
let currentUrl = 'https://restcountries.com/v3.1/all'
const timeout   = 500

let isSearching = false
let isLoading = false
let offset = 0
const limit = 10
let allData = []

document.body.className = localStorage.getItem('theme') || 'light-mode'
switcher.checked = document.body.classList.contains('dark-mode')

const renderCountry = (country) => {
    const div = document.createElement('div')
    div.classList.add('country-box')

    const flagUrl = country.flags.png
    const currencies = country.currencies
    const languages = country.languages
    const languagesKeys = Object.keys(languages || {})
    const currencyKeys = Object.keys(currencies || {})

    const countryBox = `
        <div class="flag"><img src="${flagUrl}" alt="${country.name.common}"></div>
        <div class="info">
            <div class="name-common">${country.name.common}</div>
            <div class="official">Official: ${country.name.official}</div>
            <div class="lang">Language: ${languagesKeys || {}}</div>                     
            <div class="population">Population: ${(country.population).toLocaleString('en')}</div>
            <div class="currency">Currency: ${currencyKeys.length > 0 ? currencies[currencyKeys[0]].name : "N/A"}<br>Currency symbol: ${currencyKeys.length > 0 ? currencies[currencyKeys[0]].symbol : "N/A" }</div>           
            <div class="region">Region: ${country.region}</div>
            <div class="capital">Capital: ${country.capital || "N/A"}</div>
            <div class="map">GoogleMap: <a href="${country.maps.googleMaps}">look on the map</a></div>
        </div>`;
    div.innerHTML = countryBox

    content.appendChild(div)
}


const fetchData = (url) => {

    if (isLoading) {
        return
    }

    isLoading = true
    loading.style.display = 'block'

    if (allData.length === 0) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                allData = data
                setTimeout(loadMoreItems, timeout)
            })
            .catch(() => {
                msg.textContent = 'Something went wrong'
                isLoading = false
                loading.style.display = 'none'
            })
    } else {
        setTimeout(loadMoreItems, timeout)
    }
}


const loadMoreItems = () => {
    if (isSearching) {
        return
    }
    isLoading = true

    const nextData = allData.slice(offset, offset + limit)

    if (nextData.length === 0) {
        msg.textContent = 'No more items to load'
        window.removeEventListener('scroll', onScroll)
        loading.style.display = 'none'
        return
    }

    nextData.forEach(renderCountry)

    offset += limit
    isLoading = false
    loading.style.display = 'none'
}


const onScroll = () => {
    if (isSearching || search.value.trim() !== '') {
        return
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    const scrollHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
    )

    //const { scrollTop, scrollHeight, clientHeight } = document.documentElement

    if (scrollTop + clientHeight >= scrollHeight - 300 && !isLoading) {
        fetchData(currentUrl)
    }
}

const getAllCountries = () => {
    fetchData(currentUrl)
}

region.addEventListener('change', (e) => {
    const value = region.value
    currentUrl = value
        ? `https://restcountries.com/v3.1/region/${value}`
        : 'https://restcountries.com/v3.1/all'

    content.innerHTML = ''
    offset = 0
    allData = []
    isLoading = false
    msg.textContent = ''
    search.value = ''
    clearButton.style.display = 'none'

    window.addEventListener('scroll', onScroll, {passive: true})

    fetchData(currentUrl)
})

const debounce = (fn, delay) => {
    let timeoutId
    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

search.addEventListener('input', debounce((e) => {
    const query = e.target.value.trim()
    isSearching = true
    searchCountries(query)
    isSearching = false
}, timeout))

search.addEventListener('input', () => {
    clearButton.style.display = search.value.trim() ? 'block' : 'none';
})

clearButton.addEventListener('click', () => {
    search.value = ''
    clearButton.style.display = 'none'
    content.innerHTML = ''
    msg.textContent = ''
    getAllCountries()
})

const searchCountries = (query) => {
    if (!query) {
        content.innerHTML = ''
        msg.textContent = ''
        return
    }
    isSearching = true
    fetch(`https://restcountries.com/v3.1/name/${query}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('No results found')
            }
            return response.json()
        })
        .then((data) => {
            displayCountries(data)
    })
        .catch((error) => {
            content.innerHTML = ''
            msg.textContent = error.message
        })
        .finally(() => {
            isSearching = false;
        })

}

const displayCountries = (countries) => {
    content.innerHTML = ''
    msg.textContent = ''

    countries.forEach(renderCountry);
}

const switchMode = () => {

    switcher.addEventListener('change', () => {
        if (switcher.checked) {
            document.body.classList.remove('light-mode')
            document.body.classList.add('dark-mode')
            document.body.className = 'dark-mode'
            iconMoon.style.color = '#fff'
            localStorage.setItem('theme', 'dark-mode')
        } else {
            document.body.classList.remove('dark-mode')
            document.body.classList.add('light-mode')
            document.body.className = 'light-mode'
            iconMoon.style.color = '#000'
            localStorage.setItem('theme', 'light-mode')
        }
    })
}

document.addEventListener('DOMContentLoaded', getAllCountries)
window.addEventListener('scroll', onScroll)