"use strict";
// import {scaleLinear} from "https://cdn.skypack.dev/d3-scale@4";

// GLOBAL VARIABLES
var dataPromise;
var depths = [];
var latlng = [];
var mags = [];
var places = [];
var times =[];
var earthquakesLayer;
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

    function createBaseMaps(){
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
        map = L.map("map", {
            center: [37.8, -96],
            zoom: 4,
            layers:[streetLayer]
        });
    }

    {// EXECUTE
        // CREATE BASE MAPS
        thresholds = [10,30,50,70,90];
        createBaseMaps();

        // GET PROMISE
        dataPromise = d3.json(API_KEY);

        // ADD MARKERS
        dataPromise.then(function(data){
            L.geoJSON(data,{
                pointToLayer:pointToLayer
            })
            depthRange = d3.extent(depths);
            getColor = d3.scaleThreshold().domain(thresholds)
                .range(d3.schemeRdPu[7]);
           
            // ADD MARKERS
            for (var i = 0; i<mags.length; i++){
                var mag = mags[i];
                var place = places[i];
                var time = times[i];
                var depth = depths[i];
                
                if (mag<=0){
                    continue;
                }else{
                    var magScale = mag*30000;
                    L.circle(latlng[i],{
                        color: 'black',
                        weight: .5,
                        fillColor: getColor(depth),
                        fillOpacity: .75,
                        radius: magScale
                    }).bindPopup(`<h4>Where: ${place}</h4><h4>When: ${time}</h4><h4>Magnitude: ${mag}</h4><h4>Depth: ${depth} km</h4>`).addTo(map);
                }
                
                
            }
            console.log(depthRange);
            console.log("depths:",depths);
            console.log("magnitudes:",mags);
            // ADD LEGEND
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
        });
        
        
        }


        // 
        // dataPromise.then(function(data){
        //     createMarkers(data);});
        
    

}
