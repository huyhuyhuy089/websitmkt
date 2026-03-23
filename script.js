/**
 * MKT COFFEE - Script.js
 * Chức năng: Quản lý giỏ hàng, UI interactions, LocalStorage
 */

// 1. Dữ liệu mẫu sản phẩm
const products = [
    {
        id: 1,
        name: "Cà phê Arabica",
        price: 150000,
        image: "../img/produce/arabica.jpg",
        desc: "Hương thơm nhẹ nhàng, vị chua thanh thoát."
    },
    {
        id: 2,
        name: "Cà phê Robusta",
        price: 120000,
        image: "../img/produce/robusta.jpg",
        desc: "Vị đắng đậm đà, hàm lượng caffeine cao."
    },
    {
        id: 3,
        name: "Cà phê túi lọc",
        price: 85000,
        image: "../img/produce/cftuiloc.png",
        desc: "Tiện lợi, giữ trọn hương vị pha phin."
    },
    {
        id: 4,
        name: "Cà phê Moka",
        price: 55000,
        image: "../img/produce/cfmoka.jpg",
        desc: "Cà phê ủ lạnh mượt mà, ít acid."
    },
    {
        id: 5,
        name: "Cà phê Culi",
        price: 35000,
        image: "../img/produce/cfculi.webp",
        desc: "Đặc sản đường phố Việt Nam."
    },
    {
        id: 6,
        name: "Combo cà phê",
        price: 450000,
        image: "../img/produce/comboqua.jpg",
        desc: "Bộ quà tặng ý nghĩa cho người yêu cà phê."
    }
];

// 2. State quản lý giỏ hàng và đơn hàng
let cart = JSON.parse(localStorage.getItem('mkt_coffee_cart')) || [];
let orders = JSON.parse(localStorage.getItem('mkt_coffee_orders')) || [];

// 3. DOM Elements
const productList = document.getElementById('product-list');
const cartToggle = document.getElementById('cart-toggle');
const cartSidebar = document.getElementById('cart-sidebar');
const cartClose = document.getElementById('cart-close');
const overlay = document.getElementById('overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.getElementById('cart-count');
const notification = document.getElementById('notification');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const modalClose = document.getElementById('modal-close');
const successModal = document.getElementById('success-modal');
const successModalClose = document.getElementById('success-modal-close');
const successDoneBtn = document.getElementById('success-done-btn');
const checkoutForm = document.getElementById('checkout-form');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const contactMenuLink = document.getElementById('contact-menu-link');
const mobileContactLink = document.getElementById('mobile-contact-link');
const contactSection = document.getElementById('contact');
const contactForm = document.getElementById('contact-form');

// Product Modal Elements
const productModal = document.getElementById('product-modal');
const productModalClose = document.getElementById('product-modal-close');
const modalProductName = document.getElementById('modal-product-name');
const modalProductImage = document.getElementById('modal-product-image');
const modalProductPrice = document.getElementById('modal-product-price');
const modalProductDesc = document.getElementById('modal-product-desc');
const modalAddToCart = document.getElementById('modal-add-to-cart');

// Order Tracking Elements
const trackOrderBtn = document.getElementById('track-order-btn');
const mobileTrackOrderBtn = document.getElementById('mobile-track-order-btn');
const trackModal = document.getElementById('track-modal');
const trackModalClose = document.getElementById('track-modal-close');
const trackForm = document.getElementById('track-form');
const trackResults = document.getElementById('track-results');

// 4. Khởi tạo ứng dụng
function init() {
    renderProducts();
    updateCartUI();
    setupEventListeners();
    initScrollReveal();
    lucide.createIcons(); // Khởi tạo icons
}

// 5. Render danh sách sản phẩm
function renderProducts() {
    if (!productList) return;
    
    productList.innerHTML = products.map(product => `
        <div class="product-card reveal" onclick="showProductDetails(${product.id})">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" referrerPolicy="no-referrer">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${formatPrice(product.price)}</p>
            </div>
        </div>
    `).join('');
}

// 5.1 Hiển thị chi tiết sản phẩm
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    modalProductName.textContent = product.name;
    modalProductImage.src = product.image;
    modalProductImage.alt = product.name;
    modalProductPrice.textContent = formatPrice(product.price);
    modalProductDesc.textContent = product.desc;
    
    // Update Add to Cart button in modal
    modalAddToCart.onclick = () => {
        addToCart(product.id);
        closeProductModal();
    };

    productModal.classList.add('active');
    overlay.classList.add('active');
}

function closeProductModal() {
    productModal.classList.remove('active');
    overlay.classList.remove('active');
}

// 6. Định dạng tiền tệ
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// 7. Thêm vào giỏ hàng
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showNotification();
}

// 8. Cập nhật UI giỏ hàng
function updateCartUI() {
    // Cập nhật số lượng icon
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Render items trong sidebar
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; margin-top:20px;">Giỏ hàng trống</p>';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" referrerPolicy="no-referrer">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <span class="quantity-btn decrease" data-id="${item.id}">-</span>
                            <span class="quantity-num">${item.quantity}</span>
                            <span class="quantity-btn increase" data-id="${item.id}">+</span>
                        </div>
                        <span class="remove-item" data-id="${item.id}">Xóa</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Tính tổng tiền
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = formatPrice(total);
}

// 9. Lưu vào LocalStorage
function saveCart() {
    localStorage.setItem('mkt_coffee_cart', JSON.stringify(cart));
}

function saveOrders() {
    localStorage.setItem('mkt_coffee_orders', JSON.stringify(orders));
}

// 10. Hiển thị thông báo
function showNotification() {
    notification.classList.add('active');
    setTimeout(() => {
        notification.classList.remove('active');
    }, 2000);
}

// 11. Xử lý sự kiện
function setupEventListeners() {
    // Click Thêm vào giỏ
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            addToCart(id);
        }

        // Tăng/Giảm số lượng
        if (e.target.classList.contains('increase')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            updateQuantity(id, 1);
        }
        if (e.target.classList.contains('decrease')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            updateQuantity(id, -1);
        }

        // Xóa item
        if (e.target.classList.contains('remove-item')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            removeFromCart(id);
        }
    });

    // Toggle Cart
    cartToggle.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        overlay.classList.add('active');
    });

    cartClose.addEventListener('click', closeCart);
    productModalClose.addEventListener('click', closeProductModal);
    overlay.addEventListener('click', () => {
        closeCart();
        closeProductModal();
        checkoutModal.classList.remove('active');
        successModal.classList.remove('active');
        mobileMenu.classList.remove('active');
    });

    // Mobile Menu
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
    });

    mobileMenuClose.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Close mobile menu when any link is clicked
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    });

    // Checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống!');
            return;
        }
        renderOrderSummary();
        checkoutModal.classList.add('active');
        overlay.classList.add('active');
        cartSidebar.classList.remove('active');
    });

    // Toggle Contact Section
    const toggleContact = () => {
        contactSection.classList.remove('section-hidden');
        // Đợi một chút để DOM cập nhật hiển thị trước khi cuộn
        setTimeout(() => {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
        }
    };

    contactMenuLink.addEventListener('click', toggleContact);
    mobileContactLink.addEventListener('click', toggleContact);

    modalClose.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
        overlay.classList.remove('active');
    });

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('checkout-name').value;
        const phone = document.getElementById('checkout-phone').value;
        const address = document.getElementById('checkout-address').value;

        // Kiểm tra số điện thoại chỉ chứa số
        if (!/^\d+$/.test(phone)) {
            alert('Số điện thoại chỉ được chứa các chữ số!');
            return;
        }

        // Hiển thị thông tin đơn hàng vào modal thành công
        const successOrderSummary = document.getElementById('success-order-summary');
        const successTotalPrice = document.getElementById('success-total-price');
        const successName = document.getElementById('success-name');
        const successPhone = document.getElementById('success-phone');
        const successAddress = document.getElementById('success-address');

        successOrderSummary.innerHTML = cart.map(item => `
            <div class="order-summary-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        successTotalPrice.textContent = formatPrice(total);
        successName.textContent = name;
        successPhone.textContent = phone;
        successAddress.textContent = address;

        // Lưu đơn hàng vào lịch sử
        const newOrder = {
            id: 'ORD-' + Date.now(),
            date: new Date().toLocaleString('vi-VN'),
            name: name,
            phone: phone,
            address: address,
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        orders.push(newOrder);
        saveOrders();

        // Xóa giỏ hàng
        cart = [];
        saveCart();
        updateCartUI();

        // Chuyển đổi modal
        checkoutModal.classList.remove('active');
        successModal.classList.add('active');
        lucide.createIcons(); // Cập nhật icons trong modal mới
    });

    successModalClose.addEventListener('click', () => {
        successModal.classList.remove('active');
        overlay.classList.remove('active');
    });

    successDoneBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Order Tracking Logic
    const openTrackModal = () => {
        trackModal.classList.add('active');
        overlay.classList.add('active');
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
        }
    };

    trackOrderBtn.addEventListener('click', openTrackModal);
    mobileTrackOrderBtn.addEventListener('click', openTrackModal);
    trackModalClose.addEventListener('click', () => {
        trackModal.classList.remove('active');
        overlay.classList.remove('active');
    });

    trackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchName = document.getElementById('track-name').value.toLowerCase().trim();
        const searchPhone = document.getElementById('track-phone').value.trim();

        const foundOrders = orders.filter(order => 
            order.name.toLowerCase().includes(searchName) && order.phone === searchPhone
        );

        if (foundOrders.length === 0) {
            trackResults.innerHTML = '<p class="no-results">Không tìm thấy đơn hàng nào khớp với thông tin cung cấp.</p>';
        } else {
            trackResults.innerHTML = foundOrders.map(order => `
                <div class="found-order">
                    <div class="found-order-header">
                        <strong>Mã đơn: ${order.id}</strong>
                        <span>Ngày: ${order.date}</span>
                    </div>
                    <div class="found-order-items">
                        ${order.items.map(item => `
                            <div class="found-item">
                                <span>${item.name} x ${item.quantity}</span>
                                <span>${formatPrice(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="found-order-total">
                        <strong>Tổng cộng: ${formatPrice(order.total)}</strong>
                    </div>
                    <div class="found-order-status">Trạng thái: <span class="status-badge">Đang xử lý</span></div>
                </div>
            `).join('');
        }
    });

    // Contact Form Submit
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const contactContainer = document.querySelector('.contact-container');
            const name = document.getElementById('name').value;
            
            contactContainer.innerHTML = `
                <div class="contact-success reveal active">
                    <i data-lucide="check-circle" style="width: 60px; height: 60px; color: var(--secondary); margin-bottom: 20px;"></i>
                    <h3>Cảm ơn bạn đã để lại thông tin tại MKT COFFEE!</h3>
                    <p>Chào <strong>${name}</strong>, chúng tôi đã nhận được lời nhắn của bạn.</p>
                    <p>Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ.</p>
                    <p>Nếu cần hỗ trợ nhanh, bạn có thể liên hệ trực tiếp qua hotline/zalo: <strong>0399469584</strong></p>
                    <p>Rất mong được phục vụ bạn!</p>
                    <button class="btn btn-primary" style="margin-top: 20px;" onclick="location.reload()">Quay lại</button>
                </div>
            `;
            
            lucide.createIcons();
            
            // Cuộn lên đầu phần liên hệ để thấy thông báo
            contactSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Hero Slider
    const sliderWrapper = document.getElementById('hero-slider');
    const dots = document.querySelectorAll('#hero-dots .dot');
    let currentSlide = 0;
    const totalSlides = 5;

    if (sliderWrapper && dots.length > 0) {
        function goToSlide(index) {
            currentSlide = index;
            sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            goToSlide(currentSlide);
        }

        // Auto play
        let sliderInterval = setInterval(nextSlide, 5000);

        // Dot clicks
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(sliderInterval);
                goToSlide(index);
                sliderInterval = setInterval(nextSlide, 5000);
            });
        });
    }
}

function closeCart() {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
}

function updateQuantity(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function renderOrderSummary() {
    const summaryList = document.getElementById('order-summary-list');
    const orderTotal = document.getElementById('order-total-price');
    
    summaryList.innerHTML = cart.map(item => `
        <div class="order-summary-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotal.textContent = formatPrice(total);
}

// 12. Scroll Reveal Animation
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    reveals.forEach(reveal => {
        observer.observe(reveal);
    });
}

// Khởi chạy
document.addEventListener('DOMContentLoaded', init);
