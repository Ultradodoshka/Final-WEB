$(document).ready(async function () {
    const apiService = new ChefSpecialsAPI();

    // Safely read favorites
    let favorites = [];
    if (typeof StorageManager !== 'undefined') {
        favorites = StorageManager.get('supra_favorites', []);
    } else {
        try {
            favorites = JSON.parse(localStorage.getItem('supra_favorites')) || [];
        } catch (e) {
            favorites = [];
        }
    }

    const rawBaseDishes = [
        {
            id: 'khachapuri-1',
            name: 'Adjarian Khachapuri',
            category: 'Pastry',
            price: 12.50,
            image: 'images/khachapurimid.jpg',
            description: 'Traditional boat-shaped bread filled with Sulguni cheese, butter, and egg yolk.'
        },
        {
            id: 'khinkali-2',
            name: 'Kalakuri Khinkali (5 pcs)',
            category: 'Main Course',
            price: 14.00,
            image: 'images/khinkalimid.jpg',
            description: 'Juicy dumplings stuffed with beef, pork, fresh cilantro, and rich broth.'
        },
        {
            id: 'kubdari-3',
            name: 'Svanetian Kubdari',
            category: 'Pastry',
            price: 13.50,
            image: 'images/kudbarimid.webp',
            description: 'Spiced meat-filled pie seasoned with traditional Svanetian salt.'
        },
        {
            id: 'mtsvadi-4',
            name: 'Grapevine Mtsvadi',
            category: 'Grill',
            price: 18.00,
            image: 'images/mtsvadimid.png',
            description: 'Charcoal-grilled pork skewers served with red onions and pomegranate seeds.'
        },
        {
            id: 'qvevri-5',
            name: 'Qvevri Saperavi (Glass)',
            category: 'Drinks',
            price: 8.50,
            image: 'images/qvevrimid.jpg',
            description: 'Dry red wine aged using ancient Kakhetian clay-vessel winemaking methods.'
        }
    ];

    // Use DishItem instances if constructor accepts an object, otherwise keep normalized objects
    const baseDishes = (typeof INITIAL_MENU_DISHES !== 'undefined' && Array.isArray(INITIAL_MENU_DISHES))
        ? INITIAL_MENU_DISHES
        : rawBaseDishes.map(item => {
            if (typeof DishItem !== 'undefined') {
                const instance = new DishItem(item);
                if (instance.name) return instance;
            }
            return item;
        });

    let allDishes = [...baseDishes];

    function renderCatalog() {
        const $catalog = $('#interactive-menu-grid');
        if (!$catalog.length) return;

        const searchQuery = ($('#menu-search-input').val() || '').toLowerCase().trim();
        const selectedCategory = $('#menu-category-select').val() || 'all';
        const sortBy = $('#menu-sort-select').val() || 'default';
        const onlyFavorites = $('#menu-favorites-only').is(':checked');

        // Filter dishes
        let filtered = allDishes.filter(dish => {
            const name = (dish.name || '').toLowerCase();
            const desc = (dish.description || '').toLowerCase();
            const matchesSearch = name.includes(searchQuery) || desc.includes(searchQuery);
            const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
            const matchesFav = !onlyFavorites || favorites.includes(String(dish.id));
            return matchesSearch && matchesCategory && matchesFav;
        });

        // Sort dishes
        if (sortBy === 'price-asc') {
            filtered.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === 'price-desc') {
            filtered.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sortBy === 'name-asc') {
            filtered.sort((a, b) => String(a.name).localeCompare(String(b.name)));
        }

        if (filtered.length === 0) {
            $catalog.html('<div class="col-12"><div class="alert alert-info">No dishes match your selected filters.</div></div>');
            return;
        }

        const html = filtered.map(dish => {
            const id = String(dish.id);
            const isFav = favorites.includes(id);
            const formattedPrice = typeof dish.getFormattedPrice === 'function'
                ? dish.getFormattedPrice()
                : `$${Number(dish.price).toFixed(2)}`;

            return `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${dish.image}" class="card-img-top" alt="${dish.name}" style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-secondary">${dish.category}</span>
                                <button class="btn btn-sm ${isFav ? 'btn-danger' : 'btn-outline-danger'} js-toggle-fav" data-id="${id}">
                                    ${isFav ? '♥ Favorited' : '♡ Favorite'}
                                </button>
                            </div>
                            <h5 class="card-title">${dish.name}</h5>
                            <p class="card-text text-muted small flex-grow-1">${dish.description || ''}</p>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <span class="fw-bold fs-5">${formattedPrice}</span>
                                <button class="btn btn-sm btn-dark js-add-dish" data-id="${id}">
                                    Add to Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $catalog.html(html);
    }

    // 1. Render base dishes immediately
    renderCatalog();

    // 2. Register jQuery event listeners immediately
    $('#menu-search-input').on('input', renderCatalog);
    $('#menu-category-select, #menu-sort-select, #menu-favorites-only').on('change', renderCatalog);

    $(document).on('click', '.js-toggle-fav', function () {
        const id = String($(this).data('id'));
        if (favorites.includes(id)) {
            favorites = favorites.filter(favId => favId !== id);
        } else {
            favorites.push(id);
        }

        if (typeof StorageManager !== 'undefined') {
            StorageManager.set('supra_favorites', favorites);
        } else {
            localStorage.setItem('supra_favorites', JSON.stringify(favorites));
        }
        renderCatalog();
    });

    $(document).on('click', '.js-add-dish', function () {
        const id = String($(this).data('id'));
        const dishObj = allDishes.find(d => String(d.id) === id);
        if (dishObj && window.supraCart) {
            window.supraCart.addItem(dishObj);
        }
    });

    $(document).on('click', '#js-retry-api', async function () {
        const reloaded = await apiService.fetchSpecials('Beef');
        allDishes = [...baseDishes, ...reloaded];
        renderCatalog();
    });

    // 3. Fetch external API specials and re-render catalog with merged dishes
    const apiDishes = await apiService.fetchSpecials('Beef');
    if (apiDishes && apiDishes.length > 0) {
        allDishes = [...baseDishes, ...apiDishes];
        renderCatalog();
    }
});