function renderApartments() {
    const container = document.getElementById('apartments-container');
    container.innerHTML = '';
    for (let apartment of apartments.features) {
        // Render apartment card here
        const cardHtml = `<div class="card mb-3">
            <div class="row">
                <div class="col-md-4">
                    ${apartment.images.length ? `<img crossorigin="anonymous" class="img-fluid" src="${apartment.images[0].url}" alt="">` : `<img crossorigin="anonymous" class="img-fluid" src="https://res.cloudinary.com/dl3fvcqet/image/upload/v1708393690/Rate%20My%20Apartment/no_image.jpg" alt="No image">`}
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${apartment.title}</h5>
                        <p class="card-text">${apartment.description}</p>
                        <span>⭐${apartment.averageRating.toFixed(1)} (${apartment.numReviews})</span>
                        <p class="card-text">
                            <small class="text-muted">${apartment.location}</small>
                        </p>
                        <a href="/apartments/${apartment._id}" class="btn btn-primary">View</a>
                    </div>
                </div>
            </div>
        </div>`;
        container.innerHTML += cardHtml;
    }
}