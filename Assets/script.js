// API Key
var apiKey = "84b79da5e5d7c92085660485702f4ce8";
// global variables
// var apiKey = "1b18ce13c84e21faafb19c931bb29331";
var savedSearches = [];

//previously searched cities
var searchHistoryList = function(cityName) {
    $('.past-search:contains("' + cityName + '")').remove();

    // create entry with city name
    var searchHistoryEntry = $("<p>");
    searchHistoryEntry.addClass("past-search");
    searchHistoryEntry.text(cityName);

    // create container for entry
    var searchEntryContainer = $("<div>");
    searchEntryContainer.addClass("past-search-container");

    // append entry to container
    searchEntryContainer.append(searchHistoryEntry);

    // append entry container to search history container
    var searchHistoryContainerEl = $("#search-history-container");
    searchHistoryContainerEl.append(searchEntryContainer);

    if (savedSearches.length > 0){
        // update savedSearches array with previously saved searches
        var previousSavedSearches = localStorage.getItem("savedSearches");
        savedSearches = JSON.parse(previousSavedSearches);
    }

    // add city name to array of saved searches
    savedSearches.push(cityName);
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

    // reset search input
    $("#search-input").val("");

};

// load saved search history entries into search history container
var loadSearchHistory = function() {
    // get saved search history
    var savedSearchHistory = localStorage.getItem("savedSearches");

    // return false if there is no previous saved searches
    if (!savedSearchHistory) {
        return false;
    }

    // turn saved search history string into array
    savedSearchHistory = JSON.parse(savedSearchHistory);

    // go through savedSearchHistory array and make entry for each item in the list
    for (var i = 0; i < savedSearchHistory.length; i++) {
        searchHistoryList(savedSearchHistory[i]);
    }
};

var currentWeatherSection = function(cityName) {
    // get and use data from open weather current weather api end point
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        // get response and turn it into objects
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            // get city's longitude and latitude
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                // get response from one call api and turn it into objects
                .then(function(response) {
                    return response.json();
                })
                // get data from response and apply them to the current weather section
                .then(function(response){
                    searchHistoryList(cityName);

                    // add current weather container with border to page
                    var currentWeatherContainer = $("#current-weather-container");
                    currentWeatherContainer.addClass("current-weather-container");

                    // add city name, date, and weather icon to current weather section title
                    var currentTitle = $("#current-title");
                    var currentDay = moment().format("M/D/YYYY");
                    currentTitle.text(`${cityName} (${currentDay})`);
                    var currentIcon = $("#current-weather-icon");
                    currentIcon.addClass("current-weather-icon");
                    var currentIconCode = response.current.weather[0].icon;
                    currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);

                    // add current temperature to page
                    var currentTemperature = $("#current-temperature");
                    currentTemperature.text("Temperature: " + response.current.temp + " \u00B0F");

                    // add current humidity to page
                    var currentHumidity = $("#current-humidity");
                    currentHumidity.text("Humidity: " + response.current.humidity + "%");

                    // add current wind speed to page
                    var currentWindSpeed = $("#current-wind-speed");
                    currentWindSpeed.text("Wind Speed: " + response.current.wind_speed + " MPH");

                    // add uv index to page
                    var currentUvIndex = $("#current-uv-index");
                    currentUvIndex.text("UV Index: ");
                    var currentNumber = $("#current-number");
                    currentNumber.text(response.current.uvi);

                    // add appropriate background color to current uv index number
                    if (response.current.uvi <= 2) {
                        currentNumber.addClass("favorable");
                    } else if (response.current.uvi >= 3 && response.current.uvi <= 7) {
                        currentNumber.addClass("moderate");
                    } else {
                        currentNumber.addClass("severe");
                    }
                })
        })
        .catch(function(err) {
            // reset search input
            $("#search-input").val("");

            // alert user that there was an error
            alert("We could not find the city you searched for. Try searching for a valid city.");
        });
};

var fiveDayForecastSection = function(cityName) {
    // get and use data from open weather current weather api end point
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        // get response and turn it into objects
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            // get city's longitude and latitude
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                // get response from one call api and turn it into objects
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    console.log(response);

                    // add 5 day forecast title
                    var futureForecastTitle = $("#future-forecast-title");
                    futureForecastTitle.text("5-Day Forecast:")

                    // using data from response, set up each day of 5 day forecast
                    for (var i = 1; i <= 5; i++) {
                        // add class to future cards to create card containers
                        var futureCard = $(".future-card");
                        futureCard.addClass("future-card-details");

                        // add date to 5 day forecast
                        var futureDate = $("#future-date-" + i);
                        date = moment().add(i, "d").format("M/D/YYYY");
                        futureDate.text(date);

                        // add icon to 5 day forecast
                        var futureIcon = $("#future-icon-" + i);
                        futureIcon.addClass("future-icon");
                        var futureIconCode = response.daily[i].weather[0].icon;
                        futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);

                        // add temp to 5 day forecast
                        var futureTemp = $("#future-temp-" + i);
                        futureTemp.text("Temp: " + response.daily[i].temp.day + " \u00B0F");

                        // add humidity to 5 day forecast
                        var futureHumidity = $("#future-humidity-" + i);
                        futureHumidity.text("Humidity: " + response.daily[i].humidity + "%");
                    }
                })
        })
};

// called when the search form is submitted
$("#search-form").on("submit", function() {
    event.preventDefault();
    
    // get name of city searched
    var cityName = $("#search-input").val();

    if (cityName === "" || cityName == null) {
        //send alert if search input is empty when submitted
        alert("Please enter name of city.");
        event.preventDefault();
    } else {
        // if cityName is valid, add it to search history list and display its weather conditions
        currentWeatherSection(cityName);
        fiveDayForecastSection(cityName);
    }
});

// called when a search history entry is clicked
$("#search-history-container").on("click", "p", function() {
    // get text (city name) of entry and pass it as a parameter to display weather conditions
    var previousCityName = $(this).text();
    currentWeatherSection(previousCityName);
    fiveDayForecastSection(previousCityName);

    //
    var previousCityClicked = $(this);
    previousCityClicked.remove();
});

loadSearchHistory();

// // DOM Elements
// var inputEl = document.querySelector('.input');
// var searchBtnEl = document.querySelector('.search-button');
// var citiesListEl = document.querySelector(".cities-list");

// // Sets the cityName in localStorage
// var cityName = localStorage.getItem('cityNameStore');

// // URL for current day parameters (city name + weather units of measurements)
// var URLWeather = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + '&units=imperial' + apiKey;

// // URL for 5-days forecast parameters (city name + weather units of measurements)
// var URLForecast = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + '&units=imperial' + apiKey;

// // Sets the input value in localStorage
// function recordCityData() {
//     localStorage.setItem('cityNameStore', inputEl.value);
// }

// // Append the search input from localStorage to the cities list
// for (var i = 0; i < localStorage.length; i++) {
//     $(".cities-list").append("<p>" + localStorage.getItem(localStorage.key(i)) + "</p>");
// }
// // Current Day Forecast function
// $.ajax ({
//     url: URLWeather,
//     method: "GET"
// })
//     .then(function(response) {

//         // Add weather info to page
//         $('.city').html("<h2>" + response.name + "</h2>");
//         $('.weather-icon').html("<img src='https://openweathermap.org/img/w/" + response.weather[0].icon + ".png' >");
//         $('.wind').text("Wind Speed: " + response.wind.speed + " MPH");
//         $('.humidity').text("Humidity: " + response.main.humidity + "%");
//         $(".temperature").text("Temperature: " + response.main.temp + " F");

//         // URL for UV Index
//         var lat = response.coord.lat;
//         var lon = response.coord.lon;
//         var queryURLUv = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + apiKey;

//          // Uv Index function
//          $.ajax ({
//             url: queryURLUv,
//             method: "GET"
//         })
//             .then(function(response) {
//                 var uvValue = response.value

//                 // Add uv Index info to page
//                 $('.uv').text("UV Index: " + response.value);
//                 $('.uv').css("background-color", uvColor(uvValue));
//             });

//     });

// // Index color function
// function uvColor(uvValue, colorbgd) {
//     var colorbgd = "";
//     if (uvValue <= 2) {
//         colorbgd = "#66ff00";
//     }
//     else if (uvValue <= 5 && uvValue > 2) {
//         colorbgd = "#ffbb00";
//     }
//     else if (uvValue >= 6 && uvValue > 5) {
//         colorbgd = "#FF0000";
//     }
//     return colorbgd;
// }
// // Displays the date
// var currentDay = moment().format("dddd, MMMM Do");

// function functionDay() {
//     $(".current-date").text(currentDay);
// };
// functionDay();

// // 5 Days Forecast function
// $.ajax ({
//     url: URLForecast,
//     method: "GET"
// })

//     .then(function (response) {

//         var dayOne = moment(response.list[0].dt_txt).format("ddd, MMM D");

//         // Adds day 1 data to page
//         $(".day-one-temperature").text("Temp: " + response.list[0].main.temp + " F");
//         $(".day-one-date").html("<h6>" + dayOne + "</h6>");
//         $(".day-one-icon").html("<img src='https://openweathermap.org/img/w/" + response.list[0].weather[0].icon + ".png' alt='Icon depicting current weather.'>");
//         $(".day-one-humidity").text("Humidity: " + response.list[0].main.humidity + "%");

//         var dayTwo = moment(response.list[8].dt_txt).format("ddd, MMM D");
//         // Adds day 2 data to page
//         $(".day-two-temperature").text("Temp: " + response.list[8].main.temp + " F");
//         $(".day-two-date").html("<h6>" + dayTwo + "</h6>");
//         $(".day-two-icon").html("<img src='https://openweathermap.org/img/w/" + response.list[8].weather[0].icon + ".png' alt='Icon depicting current weather.'>");
//         $(".day-two-humidity").text("Humidity: " + response.list[8].main.humidity + "%");

//         var dayThree = moment(response.list[16].dt_txt).format("ddd, MMM D");
//         // Adds day 3 data to page
//         $(".day-three-temperature").text("Temp: " + response.list[16].main.temp + " F");
//         $(".day-three-date").html("<h6>" + dayThree + "</h6>");
//         $(".day-three-icon").html("<img src='https://openweathermap.org/img/w/" + response.list[16].weather[0].icon + ".png' alt='Icon depicting current weather.'>");
//         $(".day-three-humidity").text("Humidity: " + response.list[16].main.humidity + "%");

//         var dayFour = moment(response.list[24].dt_txt).format("ddd, MMM D");

//         // Adds day 4 data to page
//         $(".day-four-temperature").text("Temp: " + response.list[24].main.temp + " F");
//         $(".day-four-date").html("<h6>" + dayFour + "</h6>");
//         $(".day-four-icon").html("<img src='https://openweathermap.org/img/w/" + response.list[24].weather[0].icon + ".png' alt='Icon depicting current weather.'>");
//         $(".day-four-humidity").text("Humidity: " + response.list[24].main.humidity + "%");

//         var dayFive = moment(response.list[32].dt_txt).format("ddd, MMM D");

//         // Adds day 5 data to page
//         $(".day-five-temperature").text("Temp: " + response.list[32].main.temp + " F");
//         $(".day-five-date").html("<h6>" + dayFive + "</h6>");
//         $(".day-five-icon").html("<img src='https://openweathermap.org/img/w/" + response.list[32].weather[0].icon + ".png' alt='Icon depicting current weather.'>");
//         $(".day-five-humidity").text("Humidity: " + response.list[32].main.humidity + "%");

//     });

// // Event Listener for search button
// searchBtnEl.addEventListener('click', recordCityData);