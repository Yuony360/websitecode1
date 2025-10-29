const prices = {
    wash: { nonMember: 100, member: 90, maxKg: 9 },
    dry9: { nonMember: 35, member: 30, maxKg: 9 },
    dry14: { nonMember: 60, member: 55, maxKg: 14 },
    press: { nonMember: 150, member: 140, perKg: true },
    wetclean: { nonMember: 400, member: 350 },
    shoeclean: { nonMember: 400, member: 350 },
    superwash: { nonMember: 40, member: 35 },
    dropoff: { nonMember: 60, member: 55 },
    pickup: { nonMember: 70, member: 65 },
    items: {
        'Surf Detergent (64ML)': { nonMember: 18, member: 15 },
        'Ariel Detergent (64ML)': { nonMember: 23, member: 20 },
        'Surf Fabric Conditioner (40ML)': { nonMember: 15, member: 12 },
        'Downy Fabric Conditioner (40ML)': { nonMember: 15, member: 12 },
        'Breeze (64ML)': { nonMember: 23, member: 20 },
        'Zonrox (30ML)': { nonMember: 12, member: 10 }
    }
};

let currentService = '';
let isMember = false;
let order = [];
let itemQuantities = {};

function showMembershipSelection() {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById('membershipSelection').classList.remove('hidden');
}

function selectMembership(member) {
    isMember = member;
    updateMembershipBadges();
    document.getElementById('membershipSelection').classList.add('hidden');
    document.getElementById('serviceSelection').classList.remove('hidden');
}

function goBack(page) {
    document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
    document.getElementById(page).classList.remove('hidden');
    updateMembershipBadges();
}

function selectService(service) {
    currentService = service;
    if (service === 'items') {
        showItemsPage();
    } else {
        showWeightInput(service);
    }
}

function showWeightInput(service) {
    document.getElementById('serviceSelection').classList.add('hidden');
    document.getElementById('weightInput').classList.remove('hidden');
    updateMembershipBadges();

    const titles = {
        wash: 'Wash Service (9KG max)',
        dry: 'Dry Service',
        press: 'Press (Iron) Service',
        wetclean: 'Wet Clean Service',
        shoeclean: 'Shoe Clean Service'
    };
    
    document.getElementById('serviceTitle').textContent = titles[service];
    document.getElementById('dryOptions').classList.toggle('hidden', service !== 'dry');
    document.getElementById('weightKg').value = '';
}

/* addService() calculation and logicc */
function addService() {
    const weight = parseFloat(document.getElementById('weightKg').value);
    if (!weight || weight <= 0) {
        alert('Please enter a valid weight');
        return;
    }

    let serviceData = { service: currentService, weight, isMember };

    if (currentService === 'dry') {
        const dryTime = parseInt(document.getElementById('dryTime').value) || 10;

        let drySize = '9';
        let loads = 1;

        if (weight <= 9) drySize = '9';
        else if (weight <= 14) drySize = '14';
        else {
            drySize = '14';
            loads = Math.ceil(weight / 14);
        }

        serviceData.drySize = drySize;
        serviceData.dryTime = dryTime;
        serviceData.loads = loads;
    }

    order.push(serviceData);
    enableCalculateButton();
    showAdditionalServices();
}

function showItemsPage() {
    document.getElementById('serviceSelection').classList.add('hidden');
    document.getElementById('itemsPage').classList.remove('hidden');
    updateMembershipBadges();
    itemQuantities = {};
    renderItemsList();
}

function renderItemsList() {
    const container = document.getElementById('itemsList');
    container.innerHTML = '';
    Object.keys(prices.items).forEach(item => {
        const price = isMember ? prices.items[item].member : prices.items[item].nonMember;
        const qty = itemQuantities[item] || 0;
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item}</div>
                <div class="item-price">₱${price} ${isMember ? '(Member)' : '(Non-Member)'}</div>
            </div>
            <div class="quantity-control">
                <button class="qty-btn" onclick="changeQty('${item}', -1)">-</button>
                <div class="qty-display">${qty}</div>
                <button class="qty-btn" onclick="changeQty('${item}', 1)">+</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function changeQty(item, delta) {
    itemQuantities[item] = Math.max(0, (itemQuantities[item] || 0) + delta);
    renderItemsList();
}

function addItemsToOrder() {
    const hasItems = Object.values(itemQuantities).some(q => q > 0);
    if (!hasItems) {
        alert('Please select at least one item');
        return;
    }

    Object.keys(itemQuantities).forEach(item => {
        if (itemQuantities[item] > 0) {
            order.push({ service: 'item', item, quantity: itemQuantities[item], isMember });
        }
    });

    enableCalculateButton();
    showPostItemOptions();
}

/* Additional services handling */
function showAdditionalServices() {
    document.getElementById('weightInput').classList.add('hidden');
    document.getElementById('itemsPage').classList.add('hidden');
    document.getElementById('additionalServices').classList.remove('hidden');
    updateMembershipBadges();

    const superwashContainer = document.querySelector('#superwash').closest('.checkbox-group');

    if (currentService === 'wash') {
        superwashContainer.style.display = 'flex';
    } else {
        superwashContainer.style.display = 'none';
        document.getElementById('superwash').checked = false;
    }

    document.getElementById('dropoff').checked = false;
    document.getElementById('pickup').checked = false;
    enableCalculateButton();
}

function showPostItemOptions() {
    document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
    document.getElementById('postItemOptions').classList.remove('hidden');
    updateMembershipBadges();
}

function askAnotherService() {
    document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
    document.getElementById('serviceSelection').classList.remove('hidden');
    updateMembershipBadges();
}

/* calculateTotal() */
function calculateTotal() {
    const finishBtn = document.querySelectorAll('.btn[onclick="calculateTotal()"]');
    if (order.length === 0) {
        alert('Please add at least one service or item before calculating.');
        return;
    }

    const additionalPage = document.getElementById('additionalServices');
    if (!additionalPage.classList.contains('hidden')) {
        const superwash = document.getElementById('superwash').checked;
        const dropoff = document.getElementById('dropoff').checked;
        const pickup = document.getElementById('pickup').checked;

        if (superwash) order.push({ service: 'superwash', isMember });
        if (dropoff) order.push({ service: 'dropoff', isMember });
        if (pickup) order.push({ service: 'pickup', isMember });
    }

    let total = 0;
    let summary = '';

    order.forEach(item => {
        let cost = 0, description = '';

        if (item.service === 'wash') {
            const p = item.isMember ? prices.wash.member : prices.wash.nonMember;
            const loads = Math.ceil(item.weight / prices.wash.maxKg);
            cost = p * loads;
            description = `Wash - ${item.weight}kg (${loads} load${loads > 1 ? 's' : ''})`;
        } 
        else if (item.service === 'dry') {
            const dry = item.drySize === '9' ? prices.dry9 : prices.dry14;
            const p = item.isMember ? dry.member : dry.nonMember;
            const intervals = item.dryTime / 10;
            cost = p * intervals * item.loads;
            description = `Dry (${item.drySize}kg) - ${item.weight}kg (${item.loads} load${item.loads > 1 ? 's' : ''}), ${item.dryTime}min`;
        } 
        else if (item.service === 'press') {
            const p = item.isMember ? prices.press.member : prices.press.nonMember;
            cost = p * item.weight;
            description = `Press (Iron) - ${item.weight}kg`;
        } 
        else if (item.service === 'wetclean') {
            cost = item.isMember ? prices.wetclean.member : prices.wetclean.nonMember;
            description = 'Wet Clean';
        } 
        else if (item.service === 'shoeclean') {
            cost = item.isMember ? prices.shoeclean.member : prices.shoeclean.nonMember;
            description = 'Shoe Clean';
        } 
        else if (item.service === 'superwash') {
            cost = item.isMember ? prices.superwash.member : prices.superwash.nonMember;
            description = 'Superwash';
        } 
        else if (item.service === 'dropoff') {
            cost = item.isMember ? prices.dropoff.member : prices.dropoff.nonMember;
            description = 'Drop-off (fold, pack)';
        } 
        else if (item.service === 'pickup') {
            cost = item.isMember ? prices.pickup.member : prices.pickup.nonMember;
            description = 'Pick-up & Delivery';
        } 
        else if (item.service === 'item') {
            const p = item.isMember ? prices.items[item.item].member : prices.items[item.item].nonMember;
            cost = p * item.quantity;
            description = `${item.item} x${item.quantity}`;
        }

        total += cost;
        summary += `<div class="total-item"><span>${description}</span><span>₱${cost.toFixed(2)}</span></div>`;
    });

    summary += `<div class="total-final"><span>TOTAL</span><span>₱${total.toFixed(2)}</span></div>`;
    document.getElementById('orderSummary').innerHTML = summary;

    document.querySelectorAll('.container').forEach(el => el.classList.add('hidden'));
    document.getElementById('totalPage').classList.remove('hidden');
    updateMembershipBadges();
}

/* disable/enable Finish button based on order */
function enableCalculateButton() {
    const buttons = document.querySelectorAll('.btn[onclick="calculateTotal()"]');
    buttons.forEach(btn => btn.disabled = order.length === 0);
}

function startNewOrder() {
    order = [];
    itemQuantities = {};
    isMember = false;
    goBack('homepage');
    enableCalculateButton();
}

function updateMembershipBadges() {
    const text = isMember ? 'Member Pricing Active' : 'Non-Member Pricing Active';
    document.querySelectorAll('.member-badge').forEach(b => b.textContent = text);
}
