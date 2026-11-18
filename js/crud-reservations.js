class ReservationCRUD {
    constructor(storageKey = 'supra_reservations') {
        this.storageKey = storageKey;
        this.records = StorageManager.get(this.storageKey, []);
        this.editingId = null;
    }

    createOrUpdate(data) {
        if (this.editingId) {
            const index = this.records.findIndex(r => r.id === this.editingId);
            if (index !== -1) {
                this.records[index] = {
                    ...this.records[index],
                    ...data,
                    updatedAt: new Date().toLocaleString()
                };
            }
            this.editingId = null;
        } else {
            this.records.unshift({
                id: Date.now().toString(),
                guestName: data.guestName,
                guestsCount: Number(data.guestsCount),
                date: data.date,
                hall: data.hall,
                comment: data.comment
            });
        }
        this.saveAndRender();
    }

    startEdit(id) {
        const record = this.records.find(r => r.id === String(id));
        if (!record) return;

        this.editingId = record.id;
        $('#res-guest-name').val(record.guestName);
        $('#res-guests-count').val(record.guestsCount);
        $('#res-date').val(record.date);
        $('#res-hall').val(record.hall);
        $('#res-comment').val(record.comment);
        $('#res-submit-btn').text('Save Changes').removeClass('btn-dark').addClass('btn-warning');
        $('#res-cancel-edit').removeClass('d-none');
    }

    cancelEdit() {
        this.editingId = null;
        $('#crud-reservation-form')[0].reset();
        $('#res-submit-btn').text('Book Table').removeClass('btn-warning').addClass('btn-dark');
        $('#res-cancel-edit').addClass('d-none');
    }

    delete(id) {
        this.records = this.records.filter(r => r.id !== String(id));
        if (this.editingId === String(id)) {
            this.cancelEdit();
        }
        this.saveAndRender();
    }

    saveAndRender() {
        StorageManager.set(this.storageKey, this.records);
        this.render();
    }

    render() {
        const $list = $('#reservations-crud-list');
        if (!$list.length) return;

        if (this.records.length === 0) {
            $list.html('<p class="text-muted">You have no active reservations yet. Book your first table above.</p>');
            return;
        }

        const html = this.records.map(rec => `
            <div class="card mb-2 shadow-sm">
                <div class="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                    <div>
                        <h6 class="mb-1 fw-bold">${rec.guestName} • <span class="badge bg-info text-dark">${rec.hall}</span></h6>
                        <div class="small text-muted">Date: <strong>${rec.date}</strong> | Guests: <strong>${rec.guestsCount}</strong></div>
                        ${rec.comment ? `<div class="small mt-1 fst-italic">"${rec.comment}"</div>` : ''}
                    </div>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary js-edit-res" data-id="${rec.id}">Edit</button>
                        <button class="btn btn-outline-danger js-delete-res" data-id="${rec.id}">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');

        $list.html(html);
    }
}

$(document).ready(function () {
    const crud = new ReservationCRUD();
    crud.render();

    $('#crud-reservation-form').on('submit', function (e) {
        e.preventDefault();

        const guestName = $('#res-guest-name').val().trim();
        const guestsCount = $('#res-guests-count').val();
        const date = $('#res-date').val();
        const hall = $('#res-hall').val();
        const comment = $('#res-comment').val().trim();

        if (!guestName || !date || guestsCount < 1) {
            alert('Please enter a valid name, date, and number of guests.');
            return;
        }

        crud.createOrUpdate({ guestName, guestsCount, date, hall, comment });
        crud.cancelEdit();
    });

    $(document).on('click', '.js-edit-res', function () {
        crud.startEdit($(this).data('id'));
    });

    $(document).on('click', '.js-delete-res', function () {
        crud.delete($(this).data('id'));
    });

    $('#res-cancel-edit').on('click', function () {
        crud.cancelEdit();
    });
});