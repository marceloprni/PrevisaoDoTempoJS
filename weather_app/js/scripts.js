
$(function(){


// *** APIs ***
// clima, previsão 12 horas e previsão 5 dias: https://developer.accuweather.com/apis
// pegar coordenadas geográficas pelo nome da cidade: https://docs.mapbox.com/api/
// pegar coordenadas do IP: http://www.geoplugin.net
// gerar gráficos em JS: https://www.highcharts.com/demo





var accuweatherApiKey = "sxyZODGfy3bACQaLi7ACX6wHFuwFchVb";

var weatherObject = {
    cidade: "",
    estado: "",
    pais: "",
    temperatura: "",
    texto_clima: "",
    icone_clima: ""
};


function preencherClimaAgora(cidade, estado, pais, temperatura, texto_clima, icone_clima) {
    var texto_local = cidade + "," + estado + "."+ pais;
    $("#texto_local").text(texto_local);
    $("#texto_clima").text(texto_clima);
    $("#texto_temperatura").html( String(temperatura) + "&deg;");
    $("#icone_clima").css("background-image", "url('" + weatherObject.icone_clima + "')" );

}


/******************* FUNÇÃO DE REQUIZIÇÃO AJAX **********************/

/* PEGAR PREVIÇÃO DE CINCO DIAS
http://dataservice.accuweather.com/forecasts/v1/daily/5day/36311?apikey=sxyZODGfy3bACQaLi7ACX6wHFuwFchVb&language=pt-br&metric=true
*/
function pegarPrevisao5Dias(localCode) {

    $.ajax({
        url: "http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + localCode + "?apikey=" + accuweatherApiKey + "&language=pt-br&metric=true",
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("5 days for forecast: ", data);
            $("#texto_max_min").html( String(data.DailyForecasts[0].Temperature.Minimum.Value) + "&deg; /" + String(data.DailyForecasts[0].Temperature.Maximum.Value) + "&deg;");

            preencherPrevisao5Dias(data.DailyForecasts);
        },
        error: function() {
            console.log("Erro");
        }
    })
}


/* FAZ A PRIMEIRA REQUIZIÇÃO ATRAVES DO CODIGO DO LOCAL*/
function pegarTempoAtual(localCode) {
    $.ajax({
        url: "http://dataservice.accuweather.com/currentconditions/v1/" + localCode + "?apikey=" + accuweatherApiKey + "&language=pt-br",
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("current_conditions: ", data);
            weatherObject.temperatura = data[0].Temperature.Metric.Value;
            weatherObject.texto_clima = data[0].WeatherText;

            var iconNumber = data[0].WeatherIcon <= 9 ? "0" + String(data[0].WeatherIcon) : String(data[0].WeatherIcon);
            weatherObject.icone_clima = "https://developer.accuweather.com/sites/default/files/" + iconNumber + "-s.png";

            preencherClimaAgora(weatherObject.cidade, weatherObject.estado, weatherObject.pais, weatherObject.temperatura, weatherObject.texto_clima, weatherObject.icone_clima);
        },
        error: function() {
            console.log("Erro");
        }
    })
}

/* FAZ A SEGUNDA REQUIZAÇÃO ATRAVES DA LATITUDADE E LONGITUDE*/
function pegarLocalUsuario(lat, long) {
    /* URL ENCONDING FUNCTION - , = %2C*/
    $.ajax({
        url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + accuweatherApiKey + "&q=" + lat + "%2C" + long + "&language=pt-br",
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("geposition:", data);

            try {
                weatherObject.cidade = data.ParentCity.LocalizedName;
                
            } catch {
                weatherObject.cidade = data.LocalizedName;
            }

            weatherObject.estado = data.AdministrativeArea.LocalizedName;
            weatherObject.pais = data.Country.LocalizedName;


            var localCode = data.Key;
            console.log(localCode);
            pegarTempoAtual(localCode);
            pegarPrevisao5Dias(localCode);

        },
        error: function() {
            console.log("Erro");
        }
    })

}

pegarLocalUsuario(-23.53119,-46.73076)

/* FAZ A TERCEIRA REQUIZIÇÃO ATRAVES DA LOCALIZAÇÃO INDICADA */
function pegarCoordenadasDoIP() {

    var lat_padrao = -23.53119;
    var long_padrao = -46.73076;

    $.ajax({
        url: "http://www.geoplugin.net/json.gp",
        type: "GET",
        dataType: "json",
        success: function(data) {

            
            if (data.geoplugin_latitude && data.geoplugin_longitude) {
                pegarLocalUsuario(data.geoplugin_latitude, data.geoplugin_longitude);
            } else {
                pegarLocalUsuario(lat_padrao, long_padrao);
            }
            
        },
        error: function() {
            console.log("Erro");
            pegarLocalUsuario(lat_padrao, long_padrao);
        }
    })

}

pegarCoordenadasDoIP();


/* ULTIMA LINHA DA FUNCTION */ 
});