// Manages the state and UI of the Cart for custom menu selection

export class Cart {
    constructor(cartContainerId, onUpdateCallback) {
        this.items = [];
        this.containerId = cartContainerId;
        this.onUpdate = onUpdateCallback;
    }

    addItem(item) {
        // Check if item already exists
        if (!this.items.find(i => i.id === item.id)) {
            this.items.push(item);
            this.render();
            if (this.onUpdate) this.onUpdate();
        }
    }

    removeItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);
        this.render();
        if (this.onUpdate) this.onUpdate();
    }

    clear() {
        this.items = [];
        this.render();
        if (this.onUpdate) this.onUpdate();
    }

    getItems() {
        return this.items;
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;text-align:center;padding:1rem 0;">No items selected yet. Browse the menu and add items to your custom package.</p>`;
            return;
        }

        container.innerHTML = `<ul style="list-style:none;padding:0;margin:0;">` +
            this.items.map(item => `
        <li style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid var(--border);">
          <div>
            <div style="font-weight:600;font-size:0.95rem;">${item.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${item.category}</div>
          </div>
          <button type="button" class="btn btn-sm btn-outline" style="color:var(--danger);border-color:var(--warning-bg);padding:0.3rem 0.6rem;" onclick="window.customCart.removeItem('${item.id}')">&times; Remove</button>
        </li>
      `).join('') + `</ul>`;
    }
}
