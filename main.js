// main.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
    
    // 2. Countdown Timer Logic
    const weddingDate = new Date('October 3, 2026 09:00:00').getTime();
    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            document.getElementById('days').innerText = "00";
            document.getElementById('hours').innerText = "00";
            document.getElementById('mins').innerText = "00";
            document.getElementById('secs').innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = days.toString().padStart(2, '0');
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('mins').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('secs').innerText = seconds.toString().padStart(2, '0');
    };
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 3. Add to Calendar Functionality
    const addToCalendarBtn = document.getElementById('add-to-calendar');
    if (addToCalendarBtn) {
        addToCalendarBtn.addEventListener('click', () => {
            // Generate a Google Calendar link
            const title = encodeURIComponent("Gad & Delphine's Wedding");
            const details = encodeURIComponent("Join us to celebrate the wedding of Gad and Delphine!\nGenesis 2:18");
            const location = encodeURIComponent("Kaleb Garden-Rebero, Kigali, Rwanda");
            
            // Format dates as YYYYMMDDTHHMMSSZ (UTC format)
            // Oct 3 2026 09:00 AM Rwanda Time (UTC+2) is 07:00 AM UTC
            // Oct 3 2026 08:00 PM Rwanda Time (UTC+2) is 06:00 PM UTC
            const startDate = "20261003T070000Z";
            const endDate = "20261003T180000Z";
            
            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startDate}/${endDate}`;
            
            window.open(calendarUrl, '_blank');
        });
    }

    // 4. Digital Guestbook Logic using localStorage
    const guestbookForm = document.getElementById('guestbook-form');
    const messagesContainer = document.getElementById('guestbook-messages');
    
    // Load messages from localStorage
    const loadMessages = () => {
        const messages = JSON.parse(localStorage.getItem('wedding_guestbook')) || [
            // Add a default placeholder message
            {
                name: "The Wedding Team",
                text: "We are so excited to celebrate with you! Please leave your well wishes below.",
                date: new Date().toLocaleDateString()
            }
        ];
        
        messagesContainer.innerHTML = '';
        
        // Reverse array so newest is at the top
        messages.slice().reverse().forEach(msg => {
            const card = document.createElement('div');
            card.className = 'message-card';
            card.innerHTML = `
                <h5>${msg.name}</h5>
                <p>"${msg.text}"</p>
                <span class="date-posted">${msg.date}</span>
            `;
            messagesContainer.appendChild(card);
        });
    };

    // Initialize messages
    loadMessages();

    // Handle form submission
    if (guestbookForm) {
        guestbookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('gb-name');
            const messageInput = document.getElementById('gb-message');
            
            const newMessage = {
                name: nameInput.value.trim(),
                text: messageInput.value.trim(),
                date: new Date().toLocaleDateString()
            };
            
            if (newMessage.name && newMessage.text) {
                // Get existing messages
                const messages = JSON.parse(localStorage.getItem('wedding_guestbook')) || [];
                messages.push(newMessage);
                
                // Save to localStorage
                localStorage.setItem('wedding_guestbook', JSON.stringify(messages));
                
                // Reset form and reload list
                guestbookForm.reset();
                loadMessages();
                
                // Show a brief success alert (optional)
                alert("Thank you for your well wishes!");
            }
        });
    }

    // 5. Music Player Logic
    const musicBtn = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    const musicIcon = document.querySelector('.music-icon');
    let isPlaying = false;

    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                musicIcon.classList.remove('playing');
                isPlaying = false;
            } else {
                // Play music and catch any potential errors (like missing file)
                bgMusic.play().then(() => {
                    musicIcon.classList.add('playing');
                    isPlaying = true;
                }).catch(err => {
                    console.log("Audio play failed:", err);
                    alert("Music could not be loaded. Please ensure you are connected to the internet!");
                });
            }
        });
    }

    // 6. Contact Action Modal
    const contactItems = document.querySelectorAll('.contact-list li');
    const modal = document.getElementById('contact-modal');
    const btnCancel = document.getElementById('btn-cancel');
    const btnCall = document.getElementById('btn-call');
    const btnGive = document.getElementById('btn-give');
    const numberDisplay = document.getElementById('modal-number-display');

    if (contactItems.length > 0 && modal) {
        contactItems.forEach(item => {
            item.addEventListener('click', () => {
                const rawNumber = item.innerText.trim();
                numberDisplay.innerText = rawNumber;
                
                // Format for call (remove spaces)
                const callNumber = rawNumber.replace(/\s+/g, '');
                btnCall.href = `tel:${callNumber}`;
                
                // Format for MoMo USSD (e.g., +250 785 124 530 -> *182*1*1*0785124530#)
                // Convert +250 to 0 for local Rwandan numbers
                let momoNumber = callNumber;
                if (momoNumber.startsWith('+250')) {
                    momoNumber = '0' + momoNumber.substring(4);
                }
                
                // Build USSD string: *182*1*1*NUMBER# (URL encoded # is %23)
                const ussdCode = `*182*1*1*${momoNumber}%23`;
                btnGive.href = `tel:${ussdCode}`;
                
                // Show modal
                modal.classList.remove('hidden');
            });
        });

        // Hide modal on cancel
        btnCancel.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Hide modal if clicking outside the content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
        
        // Hide modal after clicking an action
        btnCall.addEventListener('click', () => modal.classList.add('hidden'));
        btnGive.addEventListener('click', () => modal.classList.add('hidden'));
    }

    // 7. Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }
});
