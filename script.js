// Konfigurasi API Google Sheets (Menggunakan 1 URL Utama yang sama)
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/jthrcdiakzpyq';

// Cek akses forum (apakah sudah mengisi buku tamu)
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

// Kirim buku tamu langsung ke Google Sheets
function submitGuestBook(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const whatsapp = document.getElementById('whatsapp') ? document.getElementById('whatsapp').value.trim() : '';
    const country = document.getElementById('country') ? document.getElementById('country').value.trim() : '';
    const message = document.getElementById('message').value.trim();
    const submitBtn = document.getElementById('submitBtn');
    
    if (!name || !message) return;

    if (submitBtn) {
        submitBtn.innerText = 'Mengirim...';
        submitBtn.disabled = true;
    }

    const tanggal = new Date().toLocaleString('id-ID');

    const newData = {
        data: [
            {
                nama: name,
                pesan: message,
                tanggal: tanggal,
                whatsapp: whatsapp,
                country: country
            }
        ]
    };

    fetch(SHEETDB_API_URL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('rowiy_guestbook_signed', 'true');
        alert('Terima kasih! Buku tamu berhasil dikirim ke Google Sheets.');
        window.location.href = 'forum.html';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Gagal mengirim pesan. Silakan coba lagi.');
        if (submitBtn) {
            submitBtn.innerText = 'Kirim Buku Tamu';
            submitBtn.disabled = false;
        }
    });
}

// Muat daftar buku tamu dari Google Sheets
function loadGuestBookEntries() {
    const container = document.getElementById('guestEntriesContainer');
    if (!container) return;

    fetch(SHEETDB_API_URL)
        .then(response => response.json())
        .then(guestList => {
            if (!guestList || !Array.isArray(guestList)) {
                container.innerHTML = '<p style="font-size: 0.85rem; color: #777; text-align: center;">Belum ada buku tamu yang terisi.</p>';
                return;
            }

            // Filter hanya data buku tamu (yang memiliki kolom nama/pesan)
            let validGuests = guestList.filter(item => item.nama || item.pesan);

            if (validGuests.length === 0) {
                container.innerHTML = '<p style="font-size: 0.85rem; color: #777; text-align: center;">Belum ada buku tamu yang terisi.</p>';
                return;
            }

            let html = '<h4 style="font-family: \'Playfair Display\', serif; margin-bottom: 12px; color: #AA8C2C; font-size: 1rem;">Daftar Tamu Terbaru</h4>';
            html += '<div style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">';

            validGuests.reverse().forEach(entry => {
                let namaTamu = entry.nama || 'Tanpa Nama';
                let pesanTamu = entry.pesan || '-';
                let tanggalTamu = entry.tanggal || '';
                let negaraTamu = entry.country ? `(${entry.country})` : '';

                html += `
                    <div style="background: #FFFDF5; border: 1px solid #F4E8B1; padding: 12px; border-radius: 8px; text-align: left;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <strong style="font-size: 0.9rem; color: #1A1A1A;">${namaTamu}</strong>
                            <span style="font-size: 0.75rem; color: #888;">${negaraTamu} ${tanggalTamu}</span>
                        </div>
                        <p style="font-size: 0.85rem; color: #555; margin: 0;">"${pesanTamu}"</p>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Gagal memuat data buku tamu:', error);
            container.innerHTML = '<p style="font-size: 0.85rem; color: red; text-align: center;">Gagal memuat data dari server.</p>';
        });
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
    if (!commentInput) return;
    const commentText = commentInput.value.trim();

    if (!commentText) return;

    let authorName = 'Pendukung Setia';
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    let comments = JSON.parse(localStorage.getItem('rowiy_forum_comments')) || [];
    comments.unshift({ name: authorName, comment: commentText, date: date });

    localStorage.setItem('rowiy_forum_comments', JSON.stringify(comments));

    commentInput.value = '';
    loadForumComments();
}

// Fungsi ganti bahasa
function setLanguage(lang) {
    localStorage.setItem('site_lang', lang);
    const elements = document.querySelectorAll('[data-id]');
    elements.forEach(el => {
        if (lang === 'en') {
            if (el.getAttribute('data-en')) el.innerText = el.getAttribute('data-en');
        } else {
            if (el.getAttribute('data-id')) el.innerText = el.getAttribute('data-id');
        }
    });
}

// --- FUNGSI GALERI ONLINE (MENGGUNAKAN SATU URL UTAMA) ---

window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('like-count-gallery3')) {
        loadGalleryData();
    }
});

function loadGalleryData() {
    fetch(SHEETDB_API_URL)
        .then(response => response.json())
        .then(rows => {
            if (!Array.isArray(rows)) return;

            // Reset hitungan awal
            ['gallery3', 'gallery4', 'gallery5'].forEach(id => {
                let likeCountEl = document.getElementById('like-count-' + id);
                if (likeCountEl) likeCountEl.innerText = '0';
                let commentsContainer = document.getElementById('comments-' + id);
                if (commentsContainer) commentsContainer.innerHTML = '';
            });

            rows.forEach(row => {
                // Mendukung format data galeri jika ada kolom foto_id / tipe
                let fotoId = row.foto_id;
                let tipe = row.tipe;
                let pesan = row.pesan;

                if (fotoId && ['gallery3', 'gallery4', 'gallery5'].includes(fotoId)) {
                    if (tipe === 'like') {
                        let likeCountEl = document.getElementById('like-count-' + fotoId);
                        if (likeCountEl) {
                            let current = parseInt(likeCountEl.innerText) || 0;
                            likeCountEl.innerText = current + 1;
                        }
                    } else if (tipe === 'komentar') {
                        let commentsContainer = document.getElementById('comments-' + fotoId);
                        if (commentsContainer) {
                            let newComment = document.createElement('div');
                            newComment.style.fontSize = '0.75rem';
                            newComment.style.color = '#333';
                            newComment.innerHTML = '<strong>Pengunjung:</strong> ' + pesan;
                            commentsContainer.appendChild(newComment);
                        }
                    }
                }
            });
        })
        .catch(err => console.error('Gagal memuat data galeri:', err));
}

function toggleLike(photoId) {
    const tanggal = new Date().toLocaleString('id-ID');
    const newData = {
        data: [
            {
                foto_id: photoId,
                tipe: 'like',
                pesan: 'Suka',
                tanggal: tanggal
            }
        ]
    };

    fetch(SHEETDB_API_URL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
    })
    .then(response => response.json())
    .then(data => {
        loadGalleryData();
    })
    .catch(err => console.error('Gagal mengirim like:', err));
}

function postPhotoComment(photoId) {
    let inputEl = document.getElementById('input-' + photoId);
    if (!inputEl) return;
    let commentText = inputEl.value.trim();
    if(commentText === '') return;

    const tanggal = new Date().toLocaleString('id-ID');
    const newData = {
        data: [
            {
                foto_id: photoId,
                tipe: 'komentar',
                pesan: commentText,
                tanggal: tanggal
            }
        ]
    };

    fetch(SHEETDB_API_URL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
    })
    .then(response => response.json())
    .then(data => {
        inputEl.value = '';
        loadGalleryData();
    })
    .catch(err => console.error('Gagal mengirim komentar:', err));
}
