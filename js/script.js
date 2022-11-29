const search = document.getElementById('search')
const msg = document.querySelector('.msg')
const textMode = document.querySelector('.text-mode')
const region = document.getElementById('region')
const content = document.querySelector('.content')

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

const getAllCountries = () => {
    const url = 'https://restcountries.com/v3.1/all'
    getDataFromUrl(url)
}

region.addEventListener('change', e => {
    const value = region.options[region.selectedIndex].value
    const urlFilterRegion = `https://restcountries.com/v3.1/region/${value}`
    content.innerHTML = ''

    getDataFromUrl(urlFilterRegion)
})

search.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const country = search.value
        const url = `https://restcountries.com/v3.1/name/${country}`
        content.innerHTML = ''
        getDataFromUrl(url)
    }
})

const switchMode = () => {
    const element = document.body
    const picDark = document.querySelector('.fa-solid.fa-moon')
    const picLight = document.querySelector('.fa-solid.fa-sun')

    if (textMode.textContent === 'Dark Mode') {
        element.classList.remove('light-mode')
        picDark.classList.remove('fa-moon')
        picDark.classList.toggle('fa-sun')
        element.classList.toggle('dark-mode')
        textMode.textContent = 'Light Mode'
    } else {
        element.classList.remove('dark-mode')
        picLight.classList.remove('fa-sun')
        picLight.classList.toggle('fa-moon')
        element.classList.toggle('light-mode')
        textMode.textContent = 'Dark Mode'
    }
}