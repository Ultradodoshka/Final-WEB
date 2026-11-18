class DishItem {
    constructor({ id, category, name, description, price, image, isApi = false }) {
        this.id = /^\d+$/.test(String(id)) ? Number(id) : id;
        this.category = category;
        this.name = name;
        this.description = description;
        this.price = Number(price);
        this.image = image || '';
        this.isApi = isApi;
    }

    getFormattedPrice() {
        return `${this.price} GEL`;
    }

    matchesQuery(query) {
        const q = query.toLowerCase().trim();
        return this.name.toLowerCase().includes(q) ||
               this.category.toLowerCase().includes(q) ||
               this.description.toLowerCase().includes(q);
    }
}

class CartManager {
    constructor(storageKey = 'supra_tbilisi_cart') {
        this.storageKey = storageKey;
        this.items = StorageManager.get(this.storageKey, []);
    }

    addItem(dish) {
        if (!dish) return;
        const existing = this.items.find(item => String(item.id) === String(dish.id));
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({
                id: dish.id,
                name: dish.name,
                price: dish.price,
                quantity: 1
            });
        }
        this.save();
    }

    updateQuantity(id, delta) {
        const index = this.items.findIndex(item => String(item.id) === String(id));
        if (index === -1) return;

        this.items[index].quantity += delta;
        if (this.items[index].quantity <= 0) {
            this.items.splice(index, 1);
        }
        this.save();
    }

    removeItem(id) {
        this.items = this.items.filter(item => String(item.id) !== String(id));
        this.save();
    }

    clear() {
        this.items = [];
        StorageManager.clear(this.storageKey);
        this.syncLegacyCartArray();
        this.renderUI();
    }

    getTotalCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    syncLegacyCartArray() {
        if (typeof cart !== 'undefined' && Array.isArray(cart)) {
            cart.length = 0;
            this.items.forEach(item => {
                for (let i = 0; i < item.quantity; i++) {
                    cart.push({ id: item.id, name: item.name, price: item.price });
                }
            });
        }
    }

    save() {
        StorageManager.set(this.storageKey, this.items);
        this.syncLegacyCartArray();
        this.renderUI();
    }

    ensureDrawerExists() {
        if ($('#cart-details-panel').length) return;

        const $cartBtn = $('#cartBtn');
        if (!$cartBtn.length) return;

        const panelHtml = `
            <div id="cart-details-panel" class="card shadow-sm mt-3 text-start" style="display: none;">
                <div class="card-header d-flex justify-content-between align-items-center py-2">
                    <span class="fw-bold">Your Order (Saved)</span>
                    <button type="button" id="js-clear-cart" class="btn btn-sm btn-outline-danger">Clear Cart</button>
                </div>
                <div class="card-body py-2" id="cart-details-body"></div>
            </div>
        `;

        $cartBtn.closest('.row').after(panelHtml);
    }

    renderUI() {
        const $count = $('#cartCount');
        const $total = $('#cartTotal');

        if ($count.length) $count.text(this.getTotalCount());
        if ($total.length) $total.text(this.getTotalPrice());

        this.ensureDrawerExists();
        const $body = $('#cart-details-body');
        if (!$body.length) return;

        if (this.items.length === 0) {
            $body.html('<p class="text-muted small mb-0 py-2">Your cart is empty. Click "+ Add" on any dish above.</p>');
            return;
        }

        const rowsHtml = this.items.map(item => `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                    <span class="fw-semibold">${item.name}</span>
                    <small class="text-muted ms-2">${item.price} GEL &times; ${item.quantity} = <strong>${item.price * item.quantity} GEL</strong></small>
                </div>
                <div class="btn-group btn-group-sm">
                    <button type="button" class="btn btn-outline-secondary js-cart-dec" data-id="${item.id}">-</button>
                    <button type="button" class="btn btn-outline-secondary js-cart-inc" data-id="${item.id}">+</button>
                    <button type="button" class="btn btn-outline-danger js-cart-remove" data-id="${item.id}">&times;</button>
                </div>
            </div>
        `).join('');

        $body.html(rowsHtml);
    }
}

// Convert existing menuItems from menu.js into DishItem OOP instances
const dishObjects = (typeof menuItems !== 'undefined' ? menuItems : []).map(item => new DishItem(item));

// Initialize persistent CartManager
const supraCart = new CartManager();
window.dishObjects = dishObjects;
window.supraCart = supraCart;

// Override global addToCart from menu.js so existing + Add buttons use OOP + localStorage
window.addToCart = function (id) {
    const dish = dishObjects.find(d => d.id === Number(id));
    if (dish) {
        supraCart.addItem(dish);
    }
};

$(document).ready(function () {
    supraCart.syncLegacyCartArray();
    supraCart.renderUI();

    // Toggle the cart breakdown panel when clicking existing #cartBtn
    $(document).off('click', '#cartBtn').on('click', '#cartBtn', function () {
        $('#cart-details-panel').slideToggle(200);
    });

    $(document).off('click', '.js-cart-inc').on('click', '.js-cart-inc', function () {
        supraCart.updateQuantity($(this).data('id'), 1);
    });

    $(document).off('click', '.js-cart-dec').on('click', '.js-cart-dec', function () {
        supraCart.updateQuantity($(this).data('id'), -1);
    });

    $(document).off('click', '.js-cart-remove').on('click', '.js-cart-remove', function () {
        supraCart.removeItem($(this).data('id'));
    });

    $(document).off('click', '#js-clear-cart').on('click', '#js-clear-cart', function () {
        supraCart.clear();
    });
}); 