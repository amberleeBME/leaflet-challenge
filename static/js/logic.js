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
var map;
var baseMaps;
var getColor;


{// FUNCTIONS
    function onEachFeature(eq, layer){
            
        var eqGeo = eq.geometry.coordinates;
        var eqCoord = [eqGeo[1],eqGeo[0]];
        var eqPlace = eq.properties.place;
        var eqTime = eq.properties.time;
        var eqMag = eq.properties.mag;
        depths.push(eqGeo[2]);
        // For each earthquake, create a marker, and bind a popup with the earthquake info.
        layer.bindPopup(`<h3>Where: ${eqPlace}</h3><h3>When: ${new Date(eqTime).toLocaleString()}</h3><h3>Magnitude: ${eqMag}</h3><h3>Depth: ${eqGeo[2]}</h3>`);
        // return earthquakesLayer;
    }

    function pointToLayer(eq, coords){
        depths.push(eq.geometry.coordinates[2]);
        latlng.push([eq.geometry.coordinates[1],eq.geometry.coordinates[0]]);
        mags.push(eq.properties.mag);
        places.push(eq.properties.place);
        times.push(new Date(eq.properties.time).toLocaleString());

    }


    function createMap(earthquakesLayer){


        // Create an overlayMaps object to hold the bikeStations layer.
        var overlayMaps = {
            Earthquakes: earthquakesLayer
        };
        
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(map);
    }
    function style(feature){
        return{
            weight: .75,
            opacity: 1,
            color: 'black',
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2])
        };
    }
    
    function createBaseMaps(){
        streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        baseMaps = {
            "Street Map":streetLayer
        };
        map = L.map("map", {
            center: [37.8, -96],
            zoom: 4,
            layers:[streetLayer]
        });
    }

    {// EXECUTE
        // CREATE BASE MAPS
        createBaseMaps();

        // GET PROMISE
        dataPromise = d3.json(API_KEY);

        // FIND DEPTH/COLOR RANGE
        dataPromise.then(function(data){
            L.geoJSON(data,{
                pointToLayer:pointToLayer
            })
            depthRange = d3.extent(depths);
            getColor = d3.scaleThreshold().domain([0,20,40,60,80,90])
                .range(d3.schemeRdPu[6]);
           
            // ADD MARKERS
            for (var i = 0; i<mags.length; i++){
                var mag = mags[i];
                var place = places[i];
                var time = times[i];
                var mag = mags[i];
                var depth = depths[i];
                console.log(place);
                L.circle(latlng[i],{
                    weight: .5,
                    color: 'black',
                    fillColor: getColor(depths[i]),
                    fillOpacity: 1,
                    radius: mags[i]*30000
                }).bindPopup(`<h4>Where: ${place}</h4><h4>When: ${time}</h4><h4>Magnitude: ${mag}</h4><h4>Depth: ${depth} km</h4>`).addTo(map);
            }
            console.log(depthRange);
            console.log("depths:",depths);
            
            
        });
        

        // 
        // dataPromise.then(function(data){
        //     createMarkers(data);});
        
    }

}
