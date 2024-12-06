const search = document.getElementById('search')
const msg = document.querySelector('.msg')
const switcher = document.querySelector('.switch')
const iconMoon = document.querySelector('.icon.moon')
const region = document.getElementById('region')
const loading = document.getElementById('loading')
const content = document.querySelector('.content')
const clearButton = document.getElementById('clear-btn')
let currentUrl = 'https://restcountries.com/v3.1/all'
const timeout   = 500;

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
    const countryBox = `
        <div class="flag"><img src="${flagUrl}" alt="${country.name.common}"></div>
        <div class="info">
            <div class="name-common">${country.name.common}</div>
            <div class="official">Official: ${country.name.official}</div>
            <div class="population">Population: ${(country.population).toLocaleString('en')}</div>
            <div class="region">Region: ${country.region}</div>
            <div class="capital">Capital: ${country.capital || "N/A"}</div>
        </div>`;
    div.innerHTML = countryBox

    content.appendChild(div)
}


const fetchData = (url) => {

    if (isLoading) return

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
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    console.log('Scroll Top:', scrollTop);
    console.log('Client Height:', clientHeight);
    console.log('Scroll Height:', scrollHeight);
    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
        fetchData(currentUrl)
    }
}

/*
const getDataFromUrl = (url) => {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            data.forEach((item) => {
                const div = document.createElement("div")
                div.classList.add('country-box')
                const flagUrl = item.flags.png
                const countryBox = `                                       
                        <div class="flag"><img src="${flagUrl}" alt="${item.name.common}"></div>
                        <div class="info">
                            <div class="name-common">${item.name.common}</div>
                            <div class="population">Population: ${(item.population).toLocaleString('en')}</div>
                            <div class="region">Region: ${item.region}</div>
                            <div class="capital">Capital: ${item.capital}</div>  
                        </div>                                      
               `
                div.innerHTML = countryBox
                content.appendChild(div)
            })
        })
        .catch(() => {
            msg.textContent = 'Something was wrong'
        })
}
*/
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

    window.addEventListener('scroll', onScroll)

    fetchData(currentUrl)
})

/*search.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const country = search.value
        const url = `https://restcountries.com/v3.1/name/${country}`
        content.innerHTML = ''
        fetchData(url)
    }
})*/

const debounce = (fn, delay) => {
    let timeoutId
    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

search.addEventListener('input', debounce((e) => {
    const query = e.target.value.trim()
    searchCountries(query)
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