class ChefSpecialsAPI {
    constructor() {
        this.baseUrl = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
    }

    async fetchSpecials(query = 'Beef') {
        const $status = $('#api-status-box');
        const $grid = $('#api-specials-grid');

        if (!$grid.length) return [];

        $grid.empty();
        $status.html(`
            <div class="text-center py-4">
                <div class="spinner-border text-danger" role="status"></div>
                <p class="mt-2 text-muted">Loading seasonal chef specials...</p>
            </div>
        `);

        try {
            const response = await fetch(`${this.baseUrl}${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.meals || data.meals.length === 0) {
                $status.html(`
                    <div class="alert alert-warning text-center">
                        No chef specials found for "${query}". Try another search term.
                    </div>
                `);
                return [];
            }

            $status.empty();
            const specials = data.meals.slice(0, 6).map((meal, idx) => new DishItem({
                id: `api-${meal.idMeal}`,
                name: meal.strMeal,
                category: meal.strCategory || 'Chef Special',
                price: 15 + idx * 1.5,
                image: meal.strMealThumb,
                description: `${meal.strArea || 'Signature'} cuisine • Seasonal special`,
                isApi: true
            }));

            this.renderSpecials(specials, $grid);
            return specials;

        } catch (error) {
            console.error('TheMealDB API Error:', error);
            $status.html(`
                <div class="alert alert-danger d-flex justify-content-between align-items-center">
                    <span>Failed to load chef specials. Please check your internet connection.</span>
                    <button id="js-retry-api" class="btn btn-sm btn-outline-danger">Retry</button>
                </div>
            `);
            return [];
        }
    }

    renderSpecials(dishes, $container) {
        const html = dishes.map(dish => `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${dish.image}" class="card-img-top" alt="${dish.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-warning text-dark align-self-start mb-2">${dish.category}</span>
                        <h5 class="card-title">${dish.name}</h5>
                        <p class="card-text text-muted small flex-grow-1">${dish.description}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="fw-bold fs-5">${dish.getFormattedPrice()}</span>
                            <button class="btn btn-sm btn-danger js-add-dish" data-id="${dish.id}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        $container.hide().html(html).fadeIn(300);
    }
}