
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

/* grafico */

function gerarGrafico() {
    Highcharts.chart('hourly_chart', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Monthly Average Temperature'
        },
        subtitle: {
            text: 'Source: WorldClimate.com'
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: 'Tokyo',
            data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
            name: 'London',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
    });
}

gerarGrafico();

/* PEGAR PREVIÇÃO DE CINCO DIAS JOGAR NO RODA PÉ*/ 
function preencherPrevisao5Dias(previsoes) {

    $("#info_5dias").html("");
    var diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];


    for (var a = 0; a < previsoes.length; a++) {

        var dataHoje = new Date(previsoes[a].Date);
        var dia_semana = diasSemana[ dataHoje.getDay() ];

        var iconNumber = previsoes[a].Day.Icon <= 9 ? "0" + String(previsoes[a].Day.Icon) : String(previsoes[a].Day.Icon);
        icone_clima = "https://developer.accuweather.com/sites/default/files/" + iconNumber + "-s.png";
        maxima = String(previsoes[a].Temperature.Maximum.Value);
        minimo = String(previsoes[a].Temperature.Minimum.Value);

        elementoHTMLDia =   '<div class="day col">';
        elementoHTMLDia +=  '<div class="day_inner">';
        elementoHTMLDia +=  '<div class="dayname">';
        elementoHTMLDia +=   dia_semana;
        elementoHTMLDia +=   '</div>';
        elementoHTMLDia +=  '<div style="background-image: url(\'' + icone_clima + '\')" class="daily_weather_icon"></div>';   
        elementoHTMLDia +=  '<div class="max_min_temp">';
        elementoHTMLDia +=   minimo + '&deg /' + maxima  + '&deg;';
        elementoHTMLDia +=   '</div>';
        elementoHTMLDia +=  '</div>';
        elementoHTMLDia +=   '</div>';
            
        $("#info_5dias").append(elementoHTMLDia);  
        elementoHTMLDia = ""; 
    }
}


/* PEGAR PREVIÇÃO DE CINCO DIAS*/
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

/* DESABILITAR PARA PEGAR REQUISIÇÃO */
//pegarCoordenadasDoIP();


/* ULTIMA LINHA DA FUNCTION */ 
});