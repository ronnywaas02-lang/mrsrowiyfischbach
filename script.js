// Cek akses forum
function accessForum(event) {
    event.preventDefault();
    const isSigned = localStorage.getItem('rowiy_guestbook_signed');
    
    if (!isSigned) {
        alert('Mohon maaf, Anda wajib mengisi Buku Tamu terlebih dahulu sebelum dapat mengakses Forum Penggemar.');
        window.location.href = 'guestbook.html';
    } else {
        window.location.href = 'forum.html';
    }
}

// Kirim buku tamu & simpan WhatsApp
function submitGuestBook(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const country = document.getElementById('country').value;
    const message = document.getElementById('message').value;
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    let guestList = JSON.parse(localStorage.getItem('rowiy_guest_list')) || [];
    guestList.unshift({ name, whatsapp, country, message, date });
    
    localStorage.setItem('rowiy_guest_list', JSON.stringify(guestList));
    localStorage.setItem('rowiy_guestbook_signed', 'true');
    
    alert('Terima kasih! Buku tamu berhasil dikirim. Anda sekarang memiliki akses penuh ke Forum Penggemar.');
    window.location.href = 'forum.html';
}

// Muat daftar buku tamu
function loadGuestBookEntries() {
    const container = document.getElementById('guestEntriesContainer');
    if (!container) return;

    let guestList = JSON.parse(localStorage.getItem('rowiy_guest_list')) || [];
    
    if (guestList.length === 0) {
        container.innerHTML = '<p style="font-size: 0.85rem; color: #777; text-align: center;">Belum ada buku tamu yang terisi.</p>';
        return;
    }

    let html = '<h4 style="font-family: \'Playfair Display\', serif; margin-bottom: 12px; color: #AA8C2C; font-size: 1rem;">Daftar Tamu Terbaru</h4>';
    html += '<div style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">';

    guestList.forEach(entry => {
        html += `
            <div style="background: #FFFDF5; border: 1px solid #F4E8B1; padding: 12px; border-radius: 8px; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 0.9rem; color: #1A1A1A;">${entry.name}</strong>
                    <span style="font-size: 0.75rem; color: #888;">${entry.country} (${entry.date})</span>
                </div>
                <p style="font-size: 0.85rem; color: #555; margin: 0;">"${entry.message}"</p>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Muat komentar forum
function loadForumComments() {
    const container = document.getElementById('forumCommentsContainer');
    if (!container) return;

    let comments = JSON.parse(localStorage.getItem('rowiy_forum_comments')) || [];
    
    if (comments.length === 0) {
        container.innerHTML = '<p style="font-size: 0.85rem; color: #777; text-align: center; padding: 15px;">Belum ada diskusi di forum ini. Jadilah yang pertama memberikan komentar!</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">';

    comments.forEach(item => {
        html += `
            <div style="background: #FFFDF5; border: 1px solid #F4E8B1; padding: 14px; border-radius: 8px; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="font-size: 0.9rem; color: #AA8C2C;">${item.name}</strong>
                    <span style="font-size: 0.75rem; color: #888;">${item.date}</span>
                </div>
                <p style="font-size: 0.9rem; color: #333; margin: 0; word-break: break-word;">${item.comment}</p>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Kirim komentar forum
function postComment(event) {
    event.preventDefault();
    
    const commentInput = document.getElementById('commentText');
    const commentText = commentInput.value.trim();

    if (!commentText) return;

    let guestList = JSON.parse(localStorage.getItem('rowiy_guest_list')) || [];
    let authorName = guestList.length > 0 ? guestList[0].name : 'Pendukung Setia';

    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    let comments = JSON.parse(localStorage.getItem('rowiy_forum_comments')) || [];
    comments.unshift({ name: authorName, comment: commentText, date: date });

    localStorage.setItem('rowiy_forum_comments', JSON.stringify(comments));

    commentInput.value = '';
    loadForumComments();
}

// Fungsi untuk mengganti bahasa halaman secara dinamis lewat tombol bendera
function setLanguage(lang) {
    localStorage.setItem('site_lang', lang);
    
    const elements = document.querySelectorAll('[data-id]');
    
    elements.forEach(el => {
        if (lang === 'en') {
            el.innerText = el.getAttribute('data-en');
        } else {
            el.innerText = el.getAttribute('data-id');
        }
    });
}