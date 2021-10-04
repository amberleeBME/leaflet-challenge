"use strict";

// GLOBAL VARIABLES
var eqDataPromise;
var tpDataPromise;
var depths = [];
var latlng = [];
var mags = [];
var places = [];
var times =[];
var earthquakeMarkers = [];
var tpLines = [];
var earthquakeLayer;
var tetonicLayer;
var getColrs;
var depthRange;
var streetLayer;
var topoLayer;
var map;
var baseMaps;
var getColor;
var thresholds;
var legend;

{// FUNCTIONS

    function pointToLayer(eq, coords){
        depths.push(eq.geometry.coordinates[2]);
        latlng.push([eq.geometry.coordinates[1],eq.geometry.coordinates[0]]);
        mags.push(eq.properties.mag);
        places.push(eq.properties.place);
        times.push(new Date(eq.properties.time).toLocaleString());

    }
    function onEachFeature(tp, layer){
        var coords = tp.geometry.coordinates;
        // console.log(coords);
        layer.setStyle({
            'color': 'red'
        });
    }
    function createMaps(group1, group2){
        streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        baseMaps = {
            "Street Map":streetLayer,
            "Topographic Map": topoLayer
        };
        var overlayMaps ={
            Earthquakes: group1,
            "Tetonic Plates": group2
        };
        map = L.map("map", {
            center: [37.8, -96],
            zoom: 4,
            layers:[streetLayer, group1, group1]
        });
        L.control.layers(baseMaps, overlayMaps,{ collapsed: false}).addTo(map);

        // CREATE LEGEND
        legend = L.control({position: 'bottomright'});
        legend.onAdd = function(map){
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [10, 10,30,50,70,90],
                labels = [],
                from, to;
            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i+1];

                if (i<1){
                    labels.push('<p><i style="background:' + getColor(from-1) + '; width: 25px;"></i> ' + ' &lt; '+
                    from);
                }else{
                    labels.push('<p><i style="background:' + getColor(from) + '; width: 25px;"></i> ' +
                    from + (to ? ' &ndash; ' + to : '+'));
            }}
            div.innerHTML = labels.join('</p>');
            
            return div;
            
        };
        legend.addTo(map);
    }

    {// EXECUTE
        // CREATE BASE MAPS
        // GET PROMISE
        eqDataPromise = d3.json(API_KEY);
        tpDataPromise = d3.json(API_KEY2);
        // GET DATA
        thresholds = [10,30,50,70,90];
        eqDataPromise.then(function(data){
            L.geoJSON(data,{
                pointToLayer:pointToLayer
            })
            depthRange = d3.extent(depths);
            getColor = d3.scaleThreshold().domain(thresholds)
                .range(d3.schemeRdPu[7]);
            // CREATE MARKERS
            for (var i = 0; i<mags.length; i++){
                var mag = mags[i];
                var place = places[i];
                var time = times[i];
                var depth = depths[i];
                if (mag<=0){
                    continue;
                }else{
                    var magScale = mag*30000;
                    earthquakeMarkers.push(L.circle(latlng[i],{
                        color: 'black',
                        weight: .5,
                        fillColor: getColor(depth),
                        fillOpacity: .75,
                        radius: magScale
                    }).bindPopup(`<h4>Where: ${place}</h4><h4>When: ${time}</h4><h4>Magnitude: ${mag}</h4><h4>Depth: ${depth} km</h4>`));
                }     
            }
            // DRAW TETONIC PLATES
            tpDataPromise.then(function(response){
                tpLines = L.geoJSON(response,{
                    
                    onEachFeature: onEachFeature
                })
                tetonicLayer = L.layerGroup(tpLines);
                
            }).then(function(){
                
            });
            earthquakeLayer = L.layerGroup(earthquakeMarkers);
            tetonicLayer = L.layerGroup(tpLines);
        }).then(function(){
            
            createMaps(earthquakeLayer, tetonicLayer);
        });
        }
}
