mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/light-v10', // style URL
center: apartment.geometry.coordinates, // starting position [lng, lat]
zoom: 10, // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
.setLngLat(apartment.geometry.coordinates)
.setPopup(
	new mapboxgl.Popup({offset: 25})
		.setHTML(
			`<h3>${apartment.title}</h3><p>${apartment.location}</p>`
		)
)
.addTo(map);

console.error(apartment.title)