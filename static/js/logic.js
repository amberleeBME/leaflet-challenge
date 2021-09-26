d3.json(API_KEY).then(function(response){
    createMarkers(response.features);
    
});//.then(createMarkers);

function createMarkers(eqData){

    function pointToLayer(eq, coords){
        return L.circle(coords, {
            color: "black",
            weight: .5,
            fillColor: "blue",
            fillOpacity:1,
            radius: eq.properties.mag*10000});
    }
    function getColor(eq){

    }

    function onEachFeature(eq, layer){
        
        var eqGeo = eq.geometry.coordinates;
        var eqCoord = [eqGeo[1],eqGeo[0]];
        var eqPlace = eq.properties.place;
        var eqTime = eq.properties.time;
        var eqMag = eq.properties.mag;

        // For each earthquake, create a marker, and bind a popup with the earthquake info.
        layer.bindPopup(`<h3>Where: ${eqPlace}</h3><h3>When: ${new Date(eqTime).toLocaleString()}</h3><h3>Magnitude: ${eqMag}</h3><h3>Depth: ${eqGeo[2]}</h3>`);
    }

    var earthquakes = L.geoJSON(eqData,{
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
    });
    createMap(earthquakes);
}

function createMap(earthquakes){
    // Create the tile layer that will be the background of our map.
    var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    // Create a baseMaps object to hold the streetmap layer.
    var baseMaps = {
        "Street Map": streetmap
    };

    // Create an overlayMaps object to hold the bikeStations layer.
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create the map object with options.
    var map = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(map);
}



