var $ = window.jQuery;

// Weather ratio from getWeather function in server js file...
var weatherInt = getWeather();
var lightning = processLightning();
var nextWeatherInt = getNextWeather();
var nextLightning = getNextLightning();

function translateToString(wRatio, LRatio) {
    if (wRatio > 0.5) {
        if ( LRatio > 0) {
            return "Stormy";
        } else {
            return"Rain";
        }
    } else if (wRatio <0.5) {
        // It's not sunny at night...
        if (checkNight()) return "Clear";
        return "Sunny";
    }
    return "N/A";
}

$( '.header-location' ).append(  '<span ' + getColor() + '> ' + "       Now: " +  translateToString(weatherInt, processLightning) + '<//span>' );
$( '.header-location' ).append(  '<span ' + getColor() + '> ' + "       Next: " +  translateToString(nextWeatherInt, getNextLightning) + '<//span>' );

// returns a color for the string based on whether it's night time or day time
function getColor() {
    if (checkNight()) return 'style="color:purple"';
    return 'style="color:yellow"';
}

// Weather calculator
function getNextWeather()
{
    var serverTime = getCurrentServerTime();
    var date = new Date(serverTime);

    var behindHour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()+1);
    var aheadHour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()+2);
    var behindMs = behindHour.getTime();
    var aheadMs = aheadHour.getTime();

    var behindHourWeather = rnd((behindMs/3600000), 0, 1);
    var aheadHourWeather = rnd((aheadMs/3600000), 0, 1);

    var weatherDifference = aheadHourWeather-behindHourWeather;

    var hourProgression = (serverTime-behindHour)/3600000;

    var interpolationDelta = weatherDifference*hourProgression;


    return behindHourWeather+interpolationDelta;
}

function getNextLightning()
{
    var weather = getNextWeather();
    var serverTime = getCurrentServerTime();

    var lightningOdds = ((0.1+(weather-0.9))/1.5);

    serverTime=Math.round(serverTime/(1000*1));

    var random = rnd(serverTime, 0, 1);
    if (random<=lightningOdds)
    {
        var lightLevel = rnd(getCurrentServerTime(), -1.5, 0.8);
        if (lightLevel<0) lightLevel = 0;
        return lightLevel;
    }
    return 0;
}

function checkNight() {
    var randConstant = 318.47133757961783439490445859873;
    var serverTime = getCurrentServerTime() / (randConstant*60*60*1.5);
    var amount = Math.abs(Math.sin(serverTime)) * 3.0 - 1.56;

    return amount > 1;
}
