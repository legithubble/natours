/* eslint-disable */


export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidGltdGhlbWFwbWFuIiwiYSI6ImNsMjRqMTV2aTIwYmQzY2xwdnkwdjhlenoifQ.jFPcjZlZ-Q0Z3CKwi5eDwQ';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/timthemapman/cl24kor1300fc14mqhjnt40cs', // style URL
    scrollZoom: false,
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 9, // starting zoom
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create market
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    // Extends map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
