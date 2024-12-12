// Enable strict mode for better error handling
"use strict";

// DOM Element References
const cityName = document.querySelector(".city-name");
const cityChanceOfRain = document.querySelector(".city-chance-of-rain");
const cityDegree = document.querySelector(".city-degree");
const cityStateImg = document.querySelector(".city-state-img");
const cityStateCaption = document.querySelector(".city-state-caption");
const searchBar = document.querySelector(".search-container input");
const feelsLikeCondition = document.querySelector(".air-condition-temp");
const humidityCondition = document.querySelector(".air-condition-humidity");
const windCondition = document.querySelector(".air-condition-wind");
const uvCondition = document.querySelector(".air-condition-uv-index");
const weatherItems = document.querySelectorAll(".weather-item");
const weekForecastItems = document.querySelectorAll(".week-forecast-container .day-item");
const navLinks = document.querySelectorAll(".main-container .navbar .navbar-nav .nav-link");
const apiKey = 'c9112fddd5f4458daaa185648240912';
let globalSearchState = false;

// Navigation Link Event Listeners
for (let index = 0; index < navLinks.length; index++) {
    // Highlight link on click
    navLinks[index].addEventListener('click', function() {
        navLinks[index].style = 'color: rgb(0, 185, 241)';
    });

    // Highlight link on mouse enter
    navLinks[index].addEventListener('mouseenter', function() {
        navLinks[index].style = 'color: rgb(0, 185, 241)';
    });

    // Reset link color on mouse leave
    navLinks[index].addEventListener('mouseleave', function() {
        navLinks[index].style = 'color: #F0F1F1';
    });
}

// Search Bar Input Event Listener
searchBar.addEventListener('input', async function() {
    const isSearchValid = searchValidation(searchBar.value);

    if (isSearchValid) {
        // Fetch weather data
        const retrievedData = await getData(searchBar.value);
        const sevenDaysForecast = await getSevenDaysData(searchBar.value);

        // Update UI with fetched data
        setCityDegreeAndState(retrievedData, sevenDaysForecast);
        setDayWeather(sevenDaysForecast);
        setAirCondition(retrievedData);
        setWeekForecast(sevenDaysForecast);
    }
});

// Fetch and Display Weather Data on Page Load
document.addEventListener('DOMContentLoaded', function() {
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
});

// Fetch Current Weather Data from API
async function getData(location) {
    const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`);
    return await res.json();
}

// Fetch 7-Day Weather Forecast Data from API
async function getSevenDaysData(location) {
    const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7`);
    return await res.json();
}

// Validate Search Input
function searchValidation(searchValue) {
    const regex = /^[\s\S]+$/gm; // Accept any non-empty input
    return regex.test(searchValue);
}

// Handle Successful Geolocation
async function geoSuccess(position) {
    const crd = position;
    const myLocation = await getData([crd.coords.latitude, crd.coords.longitude]);
    const myLocation7Days = await getSevenDaysData([crd.coords.latitude, crd.coords.longitude]);

    // Update UI with geolocation data
    setCityDegreeAndState(myLocation, myLocation7Days);
    setAirCondition(myLocation);
    setDayWeather(myLocation7Days);
    setWeekForecast(myLocation7Days);
}

// Handle Geolocation Error
function geoError(error) {
    console.log(error);
}

// Update Week Forecast in UI
function setWeekForecast(myLocation7Days) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let index = 0; index < weekForecastItems.length; index++) {
        let date = new Date(myLocation7Days.forecast.forecastday[index].date);
        let dayIndex = date.getDay();
        let weekdayName = dayIndex > 6 ? 0 : days[dayIndex];

        if (index === 0) weekdayName = 'Today';

        // Update UI for each day's forecast
        weekForecastItems[index].childNodes[1].innerHTML = weekdayName;
        weekForecastItems[index].childNodes[3].childNodes[0].src = `http:${myLocation7Days.forecast.forecastday[index].day.condition.icon}`;
        weekForecastItems[index].childNodes[3].childNodes[2].innerHTML = myLocation7Days.forecast.forecastday[index].day.condition.text;
        weekForecastItems[index].childNodes[5].childNodes[0].innerHTML = `${Math.floor(myLocation7Days.forecast.forecastday[index].day.maxtemp_c)}°C`;
        weekForecastItems[index].childNodes[5].childNodes[2].innerHTML = `/${Math.floor(myLocation7Days.forecast.forecastday[index].day.mintemp_c)}°C`;
    }
}

// Update Day Weather in UI
function setDayWeather(myLocation7Days) {
    let hourlyIndex = 6; // Start from 6 AM

    for (let index = 0; index < weatherItems.length; index++) {
        weatherItems[index].childNodes[3].src = `http:${myLocation7Days.forecast.forecastday[index].hour[hourlyIndex].condition.icon}`;
        weatherItems[index].childNodes[5].innerHTML = `${Math.floor(myLocation7Days.forecast.forecastday[index].hour[hourlyIndex].temp_c)}°C`;
        hourlyIndex += 3; // Increment by 3 hours
    }
}

// Update Air Conditions in UI
function setAirCondition(myLocation) {
    feelsLikeCondition.innerHTML = `${Math.floor(myLocation.current.feelslike_c)}°C`;
    humidityCondition.innerHTML = `${myLocation.current.humidity}%`;
    windCondition.innerHTML = `${myLocation.current.wind_kph}km/h`;
    uvCondition.innerHTML = `${myLocation.current.uv}`;
}

// Update City Degree and State in UI
function setCityDegreeAndState(myLocation, myLocation7Days) {
    cityName.innerHTML = myLocation.location.name;
    cityDegree.innerHTML = `${Math.floor(myLocation.current.temp_c)}°C`;
    cityStateCaption.innerHTML = myLocation.current.condition.text;
    cityChanceOfRain.innerHTML = myLocation7Days.forecast.forecastday[0].day.daily_chance_of_rain;
    cityStateImg.src = `https:${myLocation.current.condition.icon}`;
}
