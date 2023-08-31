// API Key
var apiKey = "84b79da5e5d7c92085660485702f4ce8";
var savedSearches = [];

//search history
var searchHistoryList = function(cityName) {
$('.past-search:contains("' + cityName + '")').remove();
var searchHistoryEntry = $("<p>");
searchHistoryEntry.addClass("past-search");
searchHistoryEntry.text(cityName);
var searchEntryContainer = $("<div>");
searchEntryContainer.addClass("past-search-container");
searchEntryContainer.append(searchHistoryEntry);
var searchHistoryContainerEl = $("#search-history-container");
searchHistoryContainerEl.append(searchEntryContainer);

if (savedSearches.length > 0){
var previousSavedSearches = localStorage.getItem("savedSearches");
savedSearches = JSON.parse(previousSavedSearches);
    }

// save city names to local storage
savedSearches.push(cityName);
localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

$("#search-input").val("");

};

var loadSearchHistory = function() {
// view saved searches
var savedSearchHistory = localStorage.getItem("savedSearches");

if (!savedSearchHistory) {
return false;
    }

savedSearchHistory = JSON.parse(savedSearchHistory);
for (var i = 0; i < savedSearchHistory.length; i++) {
searchHistoryList(savedSearchHistory[i]);
    }
};
// current weather
var currentWeatherSection = function(cityName) {
fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
.then(function(response) {
return response.json();
    })
.then(function(response) {
// longitude and latitude
var cityLon = response.coord.lon;
var cityLat = response.coord.lat;

fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)

.then(function(response) {
return response.json();
})
.then(function(response){
searchHistoryList(cityName);

var currentWeatherContainer = $("#current-weather-container");
currentWeatherContainer.addClass("current-weather-container");

// adds city name and date
var currentTitle = $("#current-title");
var currentDay = moment().format("M/D/YYYY");
currentTitle.text(`${cityName} (${currentDay})`);
var currentIcon = $("#current-weather-icon");
currentIcon.addClass("current-weather-icon");
var currentIconCode = response.current.weather[0].icon;
currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);

// current weather stats
var currentTemperature = $("#current-temperature");
currentTemperature.text("Temperature: " + response.current.temp + " \u00B0F");

var currentHumidity = $("#current-humidity");
currentHumidity.text("Humidity: " + response.current.humidity + "%");

var currentWindSpeed = $("#current-wind-speed");
currentWindSpeed.text("Wind Speed: " + response.current.wind_speed + " MPH")
                })
        })
.catch(function(err) {
    
$("#search-input").val("");

alert("We could not find the city you searched for. Try searching for a valid city.");
        });
};

var fiveDayForecastSection = function(cityName) {
fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
.then(function(response) {
return response.json();
        })

.then(function(response) {
    // longitude and latitude
var cityLon = response.coord.lon;
var cityLat = response.coord.lat;

fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
.then(function(response) {
return response.json();
                })
.then(function(response) {
console.log(response);


var futureForecastTitle = $("#future-forecast-title");
futureForecastTitle.text("5-Day Forecast:")

                   
for (var i = 1; i <= 5; i++) {
var futureCard = $(".future-card");
futureCard.addClass("future-card-details");

// future forecast dates
var futureDate = $("#future-date-" + i);
date = moment().add(i, "d").format("M/D/YYYY");
futureDate.text(date);

                
var futureIcon = $("#future-icon-" + i);
futureIcon.addClass("future-icon");
var futureIconCode = response.daily[i].weather[0].icon;
futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);

// add temps to future forecast
var futureTemp = $("#future-temp-" + i);
futureTemp.text("Temp: " + response.daily[i].temp.day + " \u00B0F");

var futureHumidity = $("#future-humidity-" + i);
futureHumidity.text("Humidity: " + response.daily[i].humidity + "%");
                    }
                })
        })
};


$("#search-form").on("submit", function() {
    event.preventDefault();
    

var cityName = $("#search-input").val();
if (cityName === "" || cityName == null) {
       
alert("Enter name of city");
event.preventDefault();
} else {
   
currentWeatherSection(cityName);
fiveDayForecastSection(cityName);
    }
});


$("#search-history-container").on("click", "p", function() {
var previousCityName = $(this).text();
currentWeatherSection(previousCityName);
fiveDayForecastSection(previousCityName);


var previousCityClicked = $(this);
previousCityClicked.remove();
});

loadSearchHistory();

