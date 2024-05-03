// maplibre.org map api with NO APIKEY

const COORDINATES = DBlist.location.geometry.coordinates ; //[77.22445, 28.63576]; // [Longitude, Latitude], 
const TITLE = DBlist.title;

const map = (window.map = new maplibregl.Map({
  container: "map",
  zoom: 8,
  center: COORDINATES,
  pitch: 30,
  hash: true,
  // style(control view) without apikey
  style: {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "&copy; Wonderlust by Shresth",
        maxzoom: 19,
      },
      // Use a different source for terrain and hillshade layers, to improve render quality
      terrainSource: {
        type: "raster-dem",
        url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
        tileSize: 256,
      },
      hillshadeSource: {
        type: "raster-dem",
        url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
        tileSize: 256,
      },
    },

    layers: [
      {
        id: "osm",
        type: "raster",
        source: "osm",
      },
      {
        id: "hills",
        type: "hillshade",
        source: "hillshadeSource",
        layout: { visibility: "visible" },
        paint: { "hillshade-shadow-color": "#473B24" },
      },
    ],

    terrain: {
      source: "terrainSource",
      exaggeration: 1,
    },
  },
  maxZoom: 18,
  maxPitch: 85,
}));

map.addControl(
  new maplibregl.NavigationControl({
    visualizePitch: true,
    showZoom: true,
    showCompass: true,
  })
);

map.addControl(
  new maplibregl.TerrainControl({
    source: "terrainSource",
    exaggeration: 1,
  })
);

map.on("load", async () => {
  // Add a GeoJSON source for the marker
  map.addSource("marker", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            description: `<h5>${TITLE}</h5> <p>Extact Location provided after booking!</p>`,
          },
          geometry: {
            type: "Point",
            coordinates: COORDINATES,
          },
        },
      ],
    },
  });

  // Add a layer for the marker
  map.addLayer({
    id: "marker",
    type: "circle",
    source: "marker",
    paint: {
      "circle-radius": 10,
      "circle-color": "#ff00009a",
    },
  });

  // create and add the marker
  const marker = new maplibregl.Marker({
    color: "red",
  })
    .setLngLat(COORDINATES)
    .addTo(map);

  // Create a popup, but don't add it to the map yet
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  // Show the popup when the user hovers over the marker layer
  map.on("mouseenter", "marker", (e) => {
    // Change the cursor style as a UI indicator

    // Get the coordinates and description from the feature
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.description;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found
    popup.setLngLat(coordinates).setHTML(description).addTo(map);
  });

  // Hide the popup when the user leaves the marker layer
  map.on("mouseleave", "marker", () => {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });

  // map.getCanvas().style.cursor = "pointer";
  map.setLayoutProperty("label_country", "text-field", ["get", "name:en"]);
});

// SIMPLE
// // create the popup
// const popup = new maplibregl.Popup({
//     closeButton: false,
//     closeOnClick: false
// }).setText('Construction on the Washington Monument began in 1848.');

// // create and add the marker
// const marker = new maplibregl.Marker({
//     color: 'red'
// })
//     .setLngLat([0.11, 51.49])
//     .setPopup(popup)
//     .addTo(map);
