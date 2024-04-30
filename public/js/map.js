// Here.com map api

const platform = new H.service.Platform({
  apikey: "fyqio2X0BmV56EV3PVY9KEzHjFowKZIuCrsFYXlX99E",
});


// configure an OMV service to use the `core` enpoint
var omvService = platform.getOMVService({ path: "v2/vectortiles/core/mc" });
var baseUrl = "https://js.api.here.com/v3/3.1/styles/omv/oslo/japan/";

// create a Japan specific style
var style = new H.map.Style(`${baseUrl}normal.day.yaml`, baseUrl);

// instantiate provider and layer for the basemap
var omvProvider = new H.service.omv.Provider(omvService, style);
var omvlayer = new H.map.layer.TileLayer(omvProvider, { max: 22 });

// instantiate (and display) a map:
var map = new H.Map(document.getElementById("mapContainer"), omvlayer, {
  zoom: 17,
  center: { lat: 28.7041, lng:  77.1025 },
});


let origin;
let destination;

let onError = (error) => {
  alert(error.message);
}

// create an instance of the routing service and make a request
let router = platform.getRoutingService(null, 8);

// Define a callback function to process the routing response:
let onResult = function(result) {
  // ensure that at least one route was found
  if (result.routes.length) {
    result.routes[0].sections.forEach((section) => {
         // Create a linestring to use as a point source for the route line
        let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

        // Create a polyline to display the route:
        let routeLine = new H.map.Polyline(linestring, {
          style: { strokeColor: 'blue', lineWidth: 3 }
        });

        // Create a marker for the start point:
        let startMarker = new H.map.Marker(section.departure.place.location);

        // Create a marker for the end point:
        let endMarker = new H.map.Marker(section.arrival.place.location);

        // Add the route polyline and the two markers to the map:
        map.addObjects([routeLine, startMarker, endMarker]);

        // Set the map's viewport to make the whole route visible:
        map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
    });
  }
};

let routingParameters = {
  'transportMode': 'car',
  // Include the route shape in the response
  'return': 'polyline'
};

// Define a callback that calculates the route
let calculateRoute = () => {
  // Make sure that both destination and origin are present
  if (!origin || !destination) return;

  // Add origin and destination to the routing parameters
  routingParameters.origin = origin;
  routingParameters.destination = destination;

  router.calculateRoute(routingParameters, onResult, onError);
}

// get the instance of the Search service
var service = platform.getSearchService();

// geocode origin point
service.geocode({
  q: '東京都中央区佃１‐１１‐８'
}, (result) => {
  origin = result.items[0].position.lat + ',' + result.items[0].position.lng;
  calculateRoute();
}, onError);

// geocode a destination point
service.geocode({
  q: '東京都千代田区丸の内１‐９'
}, (result) => {
  destination = result.items[0].position.lat + ',' + result.items[0].position.lng;
  calculateRoute();
}, onError)

// const ui = H.ui.UI.createDefault(map, defaultLayers, `es-US`);
// const control = ui.getControl('controlName'); // Replace 'controlName' with the name of the control you want to manage, for example, 'mapsettings.'
// const mapSettingsControl = ui.getControl('mapsettings');
// mapSettingsControl.setAlignment('top-left');
// const zoomControl = ui.getControl('zoom');
// zoomControl.setVisibility(true);
