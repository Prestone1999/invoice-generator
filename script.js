// Invoice Generator JavaScript

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    
    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
    
    // Generate default invoice number
    generateInvoiceNumber();
    
    // Add event listeners for real-time calculations
    addEventListeners();
    
    // Add keyboard event listener for ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeHelpDialog();
        }
    });
    
    // Initialize signature canvas
    initSignatureCanvas();
    
    // Update footer year
    updateFooterYear();
});

// Update footer year dynamically
function updateFooterYear() {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
}

// Logo functionality
let companyLogoData = null;

function previewLogo(event) {
    const file = event.target.files[0];
    if (file) {
        // Check file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            alert('Logo file size must be less than 2MB');
            event.target.value = '';
            return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            companyLogoData = e.target.result;
            displayLogoPreview(companyLogoData);
        };
        reader.readAsDataURL(file);
    }
}

function displayLogoPreview(imageSrc) {
    const logoPreview = document.getElementById('logoPreview');
    const logoContainer = document.querySelector('.logo-upload-container');
    const clearBtn = document.getElementById('clearLogoBtn');
    
    logoPreview.innerHTML = `<img src="${imageSrc}" alt="Company Logo">`;
    logoContainer.classList.add('has-logo');
    clearBtn.style.display = 'inline-flex';
}

function clearLogo() {
    companyLogoData = null;
    const logoInput = document.getElementById('companyLogo');
    const logoPreview = document.getElementById('logoPreview');
    const logoContainer = document.querySelector('.logo-upload-container');
    const clearBtn = document.getElementById('clearLogoBtn');
    
    logoInput.value = '';
    logoPreview.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <span>Click to upload logo</span>
        <small>PNG, JPG, GIF (Max 2MB)</small>
    `;
    logoContainer.classList.remove('has-logo');
    clearBtn.style.display = 'none';
}

function getLogoData() {
    return companyLogoData;
}

// Signature functionality
let isDrawing = false;
let signatureCanvas;
let signatureCtx;
let signatureHistory = [];

function initSignatureCanvas() {
    signatureCanvas = document.getElementById('signatureCanvas');
    signatureCtx = signatureCanvas.getContext('2d');
    
    // Set canvas size
    const rect = signatureCanvas.getBoundingClientRect();
    signatureCanvas.width = rect.width;
    signatureCanvas.height = rect.height;
    
    // Set drawing styles
    signatureCtx.strokeStyle = '#2c3e50';
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
    signatureCtx.lineJoin = 'round';
    
    // Mouse events
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    signatureCanvas.addEventListener('touchstart', handleTouch);
    signatureCanvas.addEventListener('touchmove', handleTouch);
    signatureCanvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    signatureCtx.beginPath();
    signatureCtx.moveTo(x, y);
    
    // Hide placeholder
    document.querySelector('.signature-canvas-wrapper').classList.add('signing');
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();
}

function stopDrawing() {
    if (!isDrawing) return;
    
    isDrawing = false;
    saveSignatureState();
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = signatureCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (e.type === 'touchstart') {
        isDrawing = true;
        signatureCtx.beginPath();
        signatureCtx.moveTo(x, y);
        document.querySelector('.signature-canvas-wrapper').classList.add('signing');
    } else if (e.type === 'touchmove' && isDrawing) {
        signatureCtx.lineTo(x, y);
        signatureCtx.stroke();
    }
}

function clearSignature() {
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    signatureHistory = [];
    document.querySelector('.signature-canvas-wrapper').classList.remove('signing');
}

function saveSignatureState() {
    const imageData = signatureCtx.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height);
    signatureHistory.push(imageData);
    
    // Keep only last 10 states for memory
    if (signatureHistory.length > 10) {
        signatureHistory.shift();
    }
}

function undoSignature() {
    if (signatureHistory.length === 0) return;
    
    signatureHistory.pop(); // Remove current state
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    
    // Restore previous state
    if (signatureHistory.length > 0) {
        const previousState = signatureHistory[signatureHistory.length - 1];
        signatureCtx.putImageData(previousState, 0, 0);
    }
    
    // Show placeholder if canvas is empty
    if (signatureHistory.length === 0) {
        document.querySelector('.signature-canvas-wrapper').classList.remove('signing');
    }
}

function getSignatureData() {
    return signatureCanvas.toDataURL('image/png');
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.querySelector('.nav-toggle');
    
    navMenu.classList.toggle('mobile-open');
    navToggle.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('mobile-open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Navigation functions
function showSection(section) {
    // Close mobile menu if open
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.querySelector('.nav-toggle');
    if (navMenu.classList.contains('mobile-open')) {
        navMenu.classList.remove('mobile-open');
        navToggle.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (section === 'form') {
        document.querySelector('.nav-item[onclick*="form"]').classList.add('active');
        document.getElementById('invoicePreview').classList.add('hidden');
        document.getElementById('receiptSection').classList.add('hidden');
        document.getElementById('trackingSection').classList.add('hidden');
        document.querySelector('.invoice-form').classList.remove('hidden');
    } else if (section === 'preview') {
        document.querySelector('.nav-item[onclick*="preview"]').classList.add('active');
        // Only show preview if invoice has been generated
        const invoiceContent = document.getElementById('invoiceContent').innerHTML;
        if (invoiceContent.trim() === '<!-- Invoice content will be generated here -->') {
            showPreviewDialog();
            document.querySelector('.nav-item[onclick*="form"]').classList.add('active');
            return;
        }
        document.querySelector('.invoice-form').classList.add('hidden');
        document.getElementById('receiptSection').classList.add('hidden');
        document.getElementById('trackingSection').classList.add('hidden');
        document.getElementById('invoicePreview').classList.remove('hidden');
    } else if (section === 'receipt') {
        document.querySelector('.nav-item[onclick*="receipt"]').classList.add('active');
        document.querySelector('.invoice-form').classList.add('hidden');
        document.getElementById('invoicePreview').classList.add('hidden');
        document.getElementById('trackingSection').classList.add('hidden');
        document.getElementById('receiptSection').classList.remove('hidden');
    } else if (section === 'tracking') {
        document.querySelector('.nav-item[onclick*="tracking"]').classList.add('active');
        document.querySelector('.invoice-form').classList.add('hidden');
        document.getElementById('invoicePreview').classList.add('hidden');
        document.getElementById('receiptSection').classList.add('hidden');
        document.getElementById('trackingSection').classList.remove('hidden');
        loadTrackingData();
    }
}

function loadTrackingData() {
    const invoices = getInvoicesFromStorage();
    updateTrackingStats(invoices);
    displayTrackingTable(invoices);
}

// Invoice Tracking Data Management
function getInvoicesFromStorage() {
    const stored = localStorage.getItem('invoiceTrackingData');
    return stored ? JSON.parse(stored) : [];
}

function saveInvoiceToStorage(invoiceData) {
    const invoices = getInvoicesFromStorage();
    const existingIndex = invoices.findIndex(inv => inv.invoiceNumber === invoiceData.invoiceNumber);
    
    if (existingIndex >= 0) {
        invoices[existingIndex] = { ...invoices[existingIndex], ...invoiceData };
    } else {
        invoices.push({
            ...invoiceData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'draft'
        });
    }
    
    localStorage.setItem('invoiceTrackingData', JSON.stringify(invoices));
    return invoices;
}

function updateInvoiceStatus(invoiceNumber, status) {
    const invoices = getInvoicesFromStorage();
    const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);
    
    if (invoice) {
        invoice.status = status;
        if (status === 'paid') {
            invoice.paidDate = new Date().toISOString();
        }
        localStorage.setItem('invoiceTrackingData', JSON.stringify(invoices));
        loadTrackingData();
    }
}

function updateTrackingStats(invoices) {
    const stats = {
        total: invoices.length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        pending: invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length,
        overdue: invoices.filter(inv => {
            const dueDate = new Date(inv.dueDate);
            const today = new Date();
            return inv.status !== 'paid' && dueDate < today;
        }).length
    };
    
    document.getElementById('totalInvoices').textContent = stats.total;
    document.getElementById('paidInvoices').textContent = stats.paid;
    document.getElementById('pendingInvoices').textContent = stats.pending;
    document.getElementById('overdueInvoices').textContent = stats.overdue;
}

function displayTrackingTable(invoices) {
    const tbody = document.getElementById('trackingTableBody');
    const noDataDiv = document.getElementById('noTrackingData');
    
    if (invoices.length === 0) {
        tbody.innerHTML = '';
        noDataDiv.style.display = 'block';
        return;
    }
    
    noDataDiv.style.display = 'none';
    tbody.innerHTML = invoices.map(invoice => {
        const total = invoice.items.reduce((sum, item) => sum + item.total, 0);
        const statusClass = getStatusClass(invoice.status);
        const statusText = getStatusText(invoice.status, invoice.dueDate);
        
        return `
            <tr>
                <td><strong>${invoice.invoiceNumber}</strong></td>
                <td>${invoice.clientName}</td>
                <td>${formatDate(invoice.invoiceDate)}</td>
                <td>${formatDate(invoice.dueDate)}</td>
                <td>ZMW ${total.toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${getPaymentMethodDisplay(invoice.paymentMethod)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="viewInvoice('${invoice.invoiceNumber}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${invoice.status !== 'paid' ? `
                            <button class="btn btn-sm btn-success" onclick="markAsPaid('${invoice.invoiceNumber}')" title="Mark as Paid">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-danger" onclick="deleteInvoice('${invoice.invoiceNumber}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getStatusClass(status) {
    const today = new Date();
    switch(status) {
        case 'paid': return 'paid';
        case 'sent': return 'sent';
        case 'draft': return 'draft';
        default: 
            // Check if overdue
            return 'overdue';
    }
}

function getStatusText(status, dueDate) {
    if (status === 'paid') return 'Paid';
    if (status === 'sent') return 'Sent';
    if (status === 'draft') return 'Draft';
    
    // Check if overdue
    const due = new Date(dueDate);
    const today = new Date();
    if (due < today) return 'Overdue';
    return 'Pending';
}

function getPaymentMethodDisplay(method) {
    const methods = {
        'cash': 'Cash',
        'bank': 'Bank Transfer',
        'mtn': 'MTN Mobile Money',
        'airtel': 'Airtel Money',
        'zamtel': 'Zamtel Mobile Money'
    };
    return methods[method] || 'Not specified';
}

// Tracking Actions
function filterInvoices() {
    const statusFilter = document.getElementById('statusFilter').value;
    const clientFilter = document.getElementById('clientFilter').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;
    
    let invoices = getInvoicesFromStorage();
    
    // Filter by status
    if (statusFilter !== 'all') {
        invoices = invoices.filter(inv => inv.status === statusFilter);
    }
    
    // Filter by client
    if (clientFilter) {
        invoices = invoices.filter(inv => 
            inv.clientName.toLowerCase().includes(clientFilter)
        );
    }
    
    // Filter by date range
    if (dateFilter !== 'all') {
        const today = new Date();
        const filterDate = getDateFilter(today, dateFilter);
        invoices = invoices.filter(inv => {
            const invDate = new Date(inv.invoiceDate);
            return invDate >= filterDate;
        });
    }
    
    displayTrackingTable(invoices);
}

function getDateFilter(today, filter) {
    switch(filter) {
        case 'today':
            return new Date(today.getFullYear(), today.getMonth(), today.getDate());
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return weekAgo;
        case 'month':
            return new Date(today.getFullYear(), today.getMonth(), 1);
        case 'year':
            return new Date(today.getFullYear(), 0, 1);
        default:
            return new Date(0);
    }
}

function markAsPaid(invoiceNumber) {
    if (confirm(`Mark invoice ${invoiceNumber} as paid?`)) {
        updateInvoiceStatus(invoiceNumber, 'paid');
    }
}

function viewInvoice(invoiceNumber) {
    const invoices = getInvoicesFromStorage();
    const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);
    
    if (invoice) {
        // Load invoice data into form
        document.getElementById('companyName').value = invoice.companyName || '';
        document.getElementById('companyAddress').value = invoice.companyAddress || '';
        document.getElementById('companyEmail').value = invoice.companyEmail || '';
        document.getElementById('companyPhone').value = invoice.companyPhone || '';
        document.getElementById('clientName').value = invoice.clientName || '';
        document.getElementById('clientAddress').value = invoice.clientAddress || '';
        document.getElementById('clientEmail').value = invoice.clientEmail || '';
        document.getElementById('invoiceNumber').value = invoice.invoiceNumber || '';
        document.getElementById('invoiceDate').value = invoice.invoiceDate || '';
        document.getElementById('dueDate').value = invoice.dueDate || '';
        document.getElementById('paymentMethod').value = invoice.paymentMethod || '';
        document.getElementById('notes').value = invoice.notes || '';
        
        // Load items
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = '';
        invoice.items.forEach(item => {
            const itemRow = document.createElement('div');
            itemRow.className = 'item-row';
            itemRow.innerHTML = `
                <input type="text" class="item-description" value="${item.description}">
                <input type="number" class="item-quantity" value="${item.quantity}" min="1">
                <input type="number" class="item-price" value="${item.price}" min="0" step="0.01">
                <div class="item-total">ZMW ${item.total.toFixed(2)}</div>
                <button class="btn-remove" onclick="removeItem(this)"><i class="fas fa-times"></i></button>
            `;
            itemsList.appendChild(itemRow);
        });
        
        // Generate and show invoice
        generateInvoice();
    }
}

function deleteInvoice(invoiceNumber) {
    if (confirm(`Delete invoice ${invoiceNumber}? This action cannot be undone.`)) {
        const invoices = getInvoicesFromStorage();
        const filteredInvoices = invoices.filter(inv => inv.invoiceNumber !== invoiceNumber);
        localStorage.setItem('invoiceTrackingData', JSON.stringify(filteredInvoices));
        loadTrackingData();
    }
}

function exportTrackingData() {
    const invoices = getInvoicesFromStorage();
    
    if (invoices.length === 0) {
        alert('No data to export.');
        return;
    }
    
    // Create CSV content
    const headers = ['Invoice Number', 'Client', 'Date', 'Due Date', 'Amount', 'Status', 'Payment Method'];
    const rows = invoices.map(inv => [
        inv.invoiceNumber,
        inv.clientName,
        inv.invoiceDate,
        inv.dueDate,
        inv.items.reduce((sum, item) => sum + item.total, 0).toFixed(2),
        getStatusText(inv.status, inv.dueDate),
        getPaymentMethodDisplay(inv.paymentMethod)
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-tracking-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function clearAllTracking() {
    if (confirm('Clear all tracking data? This action cannot be undone.')) {
        localStorage.removeItem('invoiceTrackingData');
        loadTrackingData();
    }
}

function showHelp() {
    document.getElementById('helpDialog').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeHelpDialog() {
    document.getElementById('helpDialog').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Preview dialog functions
function showPreviewDialog() {
    document.getElementById('previewDialog').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePreviewDialog() {
    document.getElementById('previewDialog').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Receipt dialog functions
function showReceiptDialog() {
    document.getElementById('receiptDialog').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeReceiptDialog() {
    document.getElementById('receiptDialog').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function goToForm() {
    closePreviewDialog();
    closeReceiptDialog();
    showSection('form');
}

// Generate unique invoice number
function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    document.getElementById('invoiceNumber').value = `INV-${year}${month}-${random}`;
}

// Add event listeners for form inputs
function addEventListeners() {
    // Add event listeners to quantity and price inputs for real-time calculation
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('item-quantity') || e.target.classList.contains('item-price')) {
            updateItemTotal(e.target.closest('.item-row'));
            updateInvoiceTotal();
        }
    });
}

function addItem() {
    const itemsList = document.getElementById('itemsList');
    const newItemRow = document.createElement('div');
    newItemRow.className = 'item-row';
    newItemRow.innerHTML = `
        <input type="text" class="item-description" placeholder="Item description">
        <input type="number" class="item-quantity" placeholder="1" min="1">
        <input type="number" class="item-price" placeholder="0.00" min="0" step="0.01">
        <div class="item-total">ZMW 0.00</div>
        <button class="btn-remove" onclick="removeItem(this)">×</button>
    `;
    itemsList.appendChild(newItemRow);
}

function removeItem(button) {
    const itemRow = button.closest('.item-row');
    const itemsList = document.getElementById('itemsList');
    
    // Keep at least one item row
    if (itemsList.children.length > 1) {
        itemRow.remove();
        updateInvoiceTotal();
    } else {
        alert('You must have at least one item in the invoice.');
    }
}

// Update individual item total
function updateItemTotal(itemRow) {
    const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(itemRow.querySelector('.item-price').value) || 0;
    const total = quantity * price;
    
    itemRow.querySelector('.item-total').textContent = `ZMW ${total.toFixed(2)}`;
}

// Update invoice total
function updateInvoiceTotal() {
    const itemRows = document.querySelectorAll('.item-row');
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const totalText = row.querySelector('.item-total').textContent;
        const total = parseFloat(totalText.replace('ZMW', '').trim()) || 0;
        subtotal += total;
    });
    
    // You can add tax calculation here if needed
    const tax = subtotal * 0; // 0% tax by default
    const total = subtotal + tax;
    
    // Update summary display (if it exists)
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `ZMW ${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `ZMW ${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `ZMW ${total.toFixed(2)}`;
}

// Generate invoice
function generateInvoice() {
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Get form data
    const formData = getFormData();
    
    // Save to tracking system
    saveInvoiceToStorage(formData);
    
    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(formData);
    
    // Display invoice
    document.getElementById('invoiceContent').innerHTML = invoiceHTML;
    
    // Show invoice preview, hide form
    document.querySelector('.invoice-form').classList.add('hidden');
    document.getElementById('invoicePreview').classList.remove('hidden');
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('.nav-item[onclick*="preview"]').classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Validate form
function validateForm() {
    const requiredFields = [
        'companyName', 'companyAddress', 'companyEmail',
        'clientName', 'clientAddress', 'invoiceNumber'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.focus();
            field.style.borderColor = '#dc3545';
            setTimeout(() => {
                field.style.borderColor = '#e9ecef';
            }, 3000);
            alert(`Please fill in the ${field.previousElementSibling.textContent} field.`);
            return false;
        }
    }
    
    // Validate email format
    const emailFields = ['companyEmail', 'clientEmail'];
    for (const fieldId of emailFields) {
        const field = document.getElementById(fieldId);
        const email = field.value.trim();
        if (email && !isValidEmail(email)) {
            field.focus();
            field.style.borderColor = '#dc3545';
            setTimeout(() => {
                field.style.borderColor = '#e9ecef';
            }, 3000);
            alert(`Please enter a valid email address for ${field.previousElementSibling.textContent}.`);
            return false;
        }
    }
    
    // Validate that at least one item has a description and price
    const itemRows = document.querySelectorAll('.item-row');
    let hasValidItem = false;
    
    for (const row of itemRows) {
        const description = row.querySelector('.item-description').value.trim();
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        
        if (description && price > 0) {
            hasValidItem = true;
            break;
        }
    }
    
    if (!hasValidItem) {
        alert('Please add at least one item with a description and price.');
        return false;
    }
    
    return true;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Get form data
function getFormData() {
    const items = [];
    const itemRows = document.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const description = row.querySelector('.item-description').value.trim();
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const total = quantity * price;
        
        if (description && price > 0) {
            items.push({
                description,
                quantity,
                price,
                total
            });
        }
    });
    
    return {
        companyName: document.getElementById('companyName').value.trim(),
        companyAddress: document.getElementById('companyAddress').value.trim(),
        companyEmail: document.getElementById('companyEmail').value.trim(),
        companyPhone: document.getElementById('companyPhone').value.trim(),
        companyLogo: getLogoData(),
        clientName: document.getElementById('clientName').value.trim(),
        clientAddress: document.getElementById('clientAddress').value.trim(),
        clientEmail: document.getElementById('clientEmail').value.trim(),
        invoiceNumber: document.getElementById('invoiceNumber').value.trim(),
        invoiceDate: document.getElementById('invoiceDate').value,
        dueDate: document.getElementById('dueDate').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        notes: document.getElementById('notes').value.trim(),
        signature: getSignatureData(),
        items
    };
}

// Generate invoice HTML
function generateInvoiceHTML(data) {
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0; // 0% tax by default
    const total = subtotal + tax;
    
    return `
        <div class="invoice-container">
            <!-- Invoice Header -->
            <div class="invoice-header">
                <div class="invoice-title">
                    <h1>INVOICE</h1>
                </div>
                <div class="invoice-meta">
                    <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
                    <p><strong>Date:</strong> ${formatDate(data.invoiceDate)}</p>
                    <p><strong>Due Date:</strong> ${formatDate(data.dueDate)}</p>
                </div>
            </div>
            
            <!-- Company and Client Information -->
            <div class="invoice-parties">
                <div class="company-section">
                    ${data.companyLogo ? `
                        <div class="company-logo">
                            <img src="${data.companyLogo}" alt="${data.companyName}" class="company-logo-img">
                        </div>
                    ` : ''}
                    <div class="company-details">
                        <h2>${data.companyName}</h2>
                        <p>${data.companyAddress}</p>
                        <p>${data.companyEmail}</p>
                        ${data.companyPhone ? `<p>${data.companyPhone}</p>` : ''}
                    </div>
                </div>
                
                <div class="client-section">
                    <h3>Bill To:</h3>
                    <p><strong>${data.clientName}</strong></p>
                    <p>${data.clientAddress}</p>
                    ${data.clientEmail ? `<p>${data.clientEmail}</p>` : ''}
                </div>
            </div>
            
            <!-- Invoice Items Table -->
            <div class="invoice-items">
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="text-center">Quantity</th>
                            <th class="text-right">Unit Price</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td>${item.description}</td>
                                <td class="text-center">${item.quantity}</td>
                                <td class="text-right">ZMW ${item.price.toFixed(2)}</td>
                                <td class="text-right">ZMW ${item.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Summary and Notes -->
            <div class="invoice-footer">
                <div class="invoice-notes-section">
                    ${data.notes ? `
                        <div class="invoice-notes">
                            <h3>Notes</h3>
                            <p>${data.notes}</p>
                        </div>
                    ` : ''}
                    
                    ${data.signature ? `
                        <div class="invoice-signature">
                            <h4>Authorized Signature</h4>
                            <img src="${data.signature}" alt="Signature" class="signature-display">
                        </div>
                    ` : ''}
                </div>
                
                <div class="invoice-summary">
                    <table class="summary-table">
                        <tr>
                            <td><strong>Subtotal:</strong></td>
                            <td class="text-right">ZMW ${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Tax:</strong></td>
                            <td class="text-right">ZMW ${tax.toFixed(2)}</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>Total:</strong></td>
                            <td class="text-right"><strong>ZMW ${total.toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Receipt functionality
function generateReceipt() {
    // Check if invoice has been generated
    const invoiceContent = document.getElementById('invoiceContent').innerHTML;
    if (invoiceContent.trim() === '<!-- Invoice content will be generated here -->') {
        showReceiptDialog();
        return;
    }
    
    // Get form data
    const formData = getFormData();
    
    // Generate receipt HTML
    const receiptHTML = generateReceiptHTML(formData);
    
    // Display receipt
    document.getElementById('receiptContent').innerHTML = receiptHTML;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function generateReceiptHTML(data) {
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0; // 0% tax by default
    const total = subtotal + tax;
    
    // Generate receipt number
    const receiptNumber = `RCP-${data.invoiceNumber.replace('INV-', '')}`;
    const receiptDate = new Date().toISOString().split('T')[0];
    
    // Get payment method display name
    const getPaymentMethodDisplay = (method) => {
        const methods = {
            'cash': 'Cash',
            'bank': 'Bank Transfer',
            'mtn': 'MTN Mobile Money',
            'airtel': 'Airtel Money',
            'zamtel': 'Zamtel Mobile Money'
        };
        return methods[method] || 'Cash/Credit Card/Bank Transfer';
    };
    
    return `
        <div class="receipt-container">
            <!-- Receipt Header -->
            <div class="receipt-header">
                <div class="receipt-title">
                    <h1>PAYMENT RECEIPT</h1>
                </div>
                <div class="receipt-meta">
                    <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
                    <p><strong>Receipt Date:</strong> ${formatDate(receiptDate)}</p>
                    <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
                </div>
            </div>
            
            <!-- Company and Client Information -->
            <div class="receipt-parties">
                <div class="company-section">
                    ${data.companyLogo ? `
                        <div class="company-logo">
                            <img src="${data.companyLogo}" alt="${data.companyName}" class="company-logo-img">
                        </div>
                    ` : ''}
                    <div class="company-details">
                        <h2>${data.companyName}</h2>
                        <p>${data.companyAddress}</p>
                        <p>${data.companyEmail}</p>
                        ${data.companyPhone ? `<p>${data.companyPhone}</p>` : ''}
                    </div>
                </div>
                
                <div class="client-payment-section">
                    <div class="client-info">
                        <h3>Received From:</h3>
                        <p><strong>${data.clientName}</strong></p>
                        <p>${data.clientAddress}</p>
                        ${data.clientEmail ? `<p>${data.clientEmail}</p>` : ''}
                    </div>
                    
                    <div class="payment-info">
                        <h3>Payment Details:</h3>
                        <p><strong>Payment Method:</strong> ${getPaymentMethodDisplay(data.paymentMethod)}</p>
                        <p><strong>Payment Date:</strong> ${formatDate(receiptDate)}</p>
                        <p><strong>Status:</strong> <span class="paid-status">PAID</span></p>
                    </div>
                </div>
            </div>
            
            <!-- Receipt Items Table -->
            <div class="receipt-items">
                <table class="receipt-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="text-center">Quantity</th>
                            <th class="text-right">Unit Price</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td>${item.description}</td>
                                <td class="text-center">${item.quantity}</td>
                                <td class="text-right">ZMW ${item.price.toFixed(2)}</td>
                                <td class="text-right">ZMW ${item.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Summary Section -->
            <div class="receipt-summary-section">
                <div class="receipt-notes">
                    <div class="receipt-notes">
                        <h3>Payment Confirmation</h3>
                        <p>This receipt confirms that the above payment has been received in full via ${getPaymentMethodDisplay(data.paymentMethod)}.</p>
                        <p>Thank you for your business!</p>
                    </div>
                </div>
                
                <div class="receipt-summary">
                    <table class="summary-table">
                        <tr>
                            <td><strong>Subtotal:</strong></td>
                            <td class="text-right">ZMW ${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Tax:</strong></td>
                            <td class="text-right">ZMW ${tax.toFixed(2)}</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>Total Paid:</strong></td>
                            <td class="text-right"><strong>ZMW ${total.toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>
            </div>
            
            ${data.signature ? `
                <div class="receipt-signature">
                    <h4>Authorized Signature</h4>
                    <img src="${data.signature}" alt="Signature" class="signature-display">
                </div>
            ` : ''}
        </div>
    `;
}

function printReceipt() {
    const receiptContent = document.getElementById('receiptContent').innerHTML;
    if (receiptContent.includes('receipt-placeholder')) {
        showReceiptDialog();
        return;
    }
    window.print();
}

async function downloadReceipt() {
    const receiptContent = document.getElementById('receiptContent').innerHTML;
    if (receiptContent.includes('receipt-placeholder')) {
        showReceiptDialog();
        return;
    }
    
    try {
        // Show loading message
        const downloadBtn = event.target;
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Generating PDF...';
        downloadBtn.disabled = true;
        
        // Get the receipt content element
        const element = document.getElementById('receiptContent');
        
        // Create canvas from the receipt content
        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
        });
        
        // Get canvas dimensions
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        let position = 0;
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add new pages if content exceeds one page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Get receipt number for filename
        const receiptNumber = `RCP-${document.getElementById('invoiceNumber').value.replace('INV-', '')}`;
        
        // Save the PDF
        pdf.save(`${receiptNumber}.pdf`);
        
        // Restore button
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
        
    } catch (error) {
        console.error('Error generating receipt PDF:', error);
        alert('Error generating PDF. Please try again or use the print function.');
        
        // Restore button
        const downloadBtn = event.target;
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
    }
}

// Clear form
function clearForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
        document.getElementById('companyName').value = '';
        document.getElementById('companyAddress').value = '';
        document.getElementById('companyEmail').value = '';
        document.getElementById('companyPhone').value = '';
        document.getElementById('clientName').value = '';
        document.getElementById('clientAddress').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('paymentMethod').value = '';
        document.getElementById('notes').value = '';
        
        // Clear logo
        clearLogo();
        
        // Clear signature
        clearSignature();
        
        // Reset items
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = `
            <div class="item-row">
                <input type="text" class="item-description" placeholder="Item description">
                <input type="number" class="item-quantity" placeholder="1" min="1">
                <input type="number" class="item-price" placeholder="0.00" min="0" step="0.01">
                <div class="item-total">ZMW 0.00</div>
                <button class="btn-remove" onclick="removeItem(this)">×</button>
            </div>
        `;
        
        // Reset dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoiceDate').value = today;
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
        
        // Generate new invoice number
        generateInvoiceNumber();
        
        // Re-add event listeners
        addEventListeners();
    }
}

// Edit invoice
function editInvoice() {
    document.getElementById('invoicePreview').classList.add('hidden');
    document.querySelector('.invoice-form').classList.remove('hidden');
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('.nav-item[onclick*="form"]').classList.add('active');
    
    window.scrollTo(0, 0);
}

// Print invoice
function printInvoice() {
    window.print();
}

// Download invoice as PDF
async function downloadInvoice() {
    try {
        // Show loading message
        const downloadBtn = event.target;
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Generating PDF...';
        downloadBtn.disabled = true;
        
        // Get the invoice content element
        const element = document.getElementById('invoiceContent');
        
        // Create canvas from the invoice content
        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
        });
        
        // Get canvas dimensions
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        let position = 0;
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add new pages if content exceeds one page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Get invoice number for filename
        const invoiceNumber = document.getElementById('invoiceNumber').value || 'invoice';
        
        // Save the PDF
        pdf.save(`${invoiceNumber}.pdf`);
        
        // Restore button
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again or use the print function.');
        
        // Restore button
        const downloadBtn = event.target;
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
    }
}
