
$(function(){


// *** APIs ***
// clima, previsão 12 horas e previsão 5 dias: https://developer.accuweather.com/apis
// pegar coordenadas geográficas pelo nome da cidade: https://docs.mapbox.com/api/
// pegar coordenadas do IP: http://www.geoplugin.net
// gerar gráficos em JS: https://www.highcharts.com/demo





var accuweatherApiKey = "sxyZODGfy3bACQaLi7ACX6wHFuwFchVb";
var mapBoxToken = "pk.eyJ1IjoibWFyY2Vsb3BybmkiLCJhIjoiY2wxMHF3YzVuMDFiajNianNxZXlzdmRmbyJ9.isQx8EwJczUnT08auRubKQ";

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

/* pegar horas*/
function pegarPrevisaoHora(localCode) {
    //"http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/36311?apikey=sxyZODGfy3bACQaLi7ACX6wHFuwFchVb&language=pt-br&metric=true"
    $.ajax({
        url: "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/" + localCode + "?apikey=" + accuweatherApiKey + "&language=pt-br&metric=true",
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("Hourly Forecast:", data);

            var horarios = [];
            var temperaturas = [];

            for (var a = 0; a < data.length; a++) {
                var hora = new Date(data).getHours();
                horarios.push(String(hora) + "h");

                temperaturas.push(data[a].Temperature.Value);

                gerarGrafico(horarios, temperaturas);
                $('.refresh-loader').fadeOut();
            }
        },
        error: function() {
            console.log("Erro");
            gerarErro("Erro ao obter a previsão hora a hora");
        }
    })
}


/* grafico */

function gerarGrafico(horas, temperaturas) {
    Highcharts.chart('hourly_chart', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Temperatura Hora a Hora'
        },
        subtitle: {
            text: 'Source: WorldClimate.com'
        },
        xAxis: {
            categories: horas
        },
        yAxis: {
            title: {
                text: 'Temperatura (°C)'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: false
                },
                enableMouseTracking: false
            }
        },
        series: [{
            showInLegend: false,
            data: temperaturas
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
            gerarErro("Erro na previção de 5 dias");
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
            gerarErro("Erro ao obter clima atual");
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
            pegarPrevisaoHora(localCode);

        },
        error: function() {
            console.log("Erro");
            gerarErro("Erro no codigo do local");
        }
    })

}

//pegarLocalUsuario(-23.53119,-46.73076)

/* FUNCÇÃO MATBOX */

function pegarCoordenadasDaPesquisa(input) {
    
    input = encodeURI(input);

    $.ajax({
        url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + input + ".json?access_token=" + mapBoxToken,
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log("mapbox:", data);

            try{
            var long = data.features[0].geometry.coordinates[0];
            var lat = data.features[0].geometry.coordinates[1];
            pegarLocalUsuario(lat, long) 
            } catch {
                gerarErro("Erro na pesquisa de local");
            }
            
        },
        error: function() {
            console.log("Erro");
            gerarErro("Erro na pesquisa de local");
        }
    })

}



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
pegarCoordenadasDoIP();


/* GERAR ERRO */

function gerarErro(mensagem) {

    if(!mensagem) {
        mensagem = "Erro na solicitação";
    }

    $('.refresh-loader').hide();
    $("#aviso-erro").text(mensagem);
    $("#aviso-erro").slideDown();
    window.setTimeout(function(){
        $("#aviso-erro").slideUp();
    }, 3000);
 
}


/* BOTÃO PESQUISA */
$("#search-button").click(function(){
    $('.refresh-loader').show();
    var local = $("input#local").val();
    console.log(local);
    if(local){
        pegarCoordenadasDaPesquisa(local);
    } else {
        alert('Local Inválido');
    }
});

$("input#local").on('keypress',function(e){
    
    if(e.which == 13) {
        $('.refresh-loader').show();
        var local = $("input#local").val();
        if(local){
            pegarCoordenadasDaPesquisa(local);
        } else {
            alert('Local Inválido');
        }

    }
});


/* ULTIMA LINHA DA FUNCTION */ 
});