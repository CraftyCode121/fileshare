let currentPath = '';
let selectedFile = null;

// ── FILE TYPE MAP ──
function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
        image:   ['jpg','jpeg','png','gif','webp','svg','bmp','ico'],
        video:   ['mp4','mkv','avi','mov','wmv','flv','webm'],
        audio:   ['mp3','wav','flac','aac','ogg','m4a'],
        code:    ['py','js','ts','html','css','json','sh','c','cpp','java','go','rs','php','rb','md'],
        archive: ['zip','rar','tar','gz','7z','bz2'],
        doc:     ['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','csv'],
    };
    for (const [type, exts] of Object.entries(map)) {
        if (exts.includes(ext)) return type;
    }
    return 'other';
}

function getFileEmoji(type) {
    const icons = {
        folder:  '📁',
        image:   '🖼',
        video:   '🎬',
        audio:   '🎵',
        code:    '</>',
        archive: '📦',
        doc:     '📄',
        other:   '📄',
    };
    return icons[type] || '📄';
}

// ── LOAD FILES ──
async function loadFiles(path = '') {
    currentPath = path;
    updateBreadcrumb(path);

    const list = document.getElementById('file-list');
    list.innerHTML = '<div class="loading">Loading</div>';

    try {
        const res = await fetch(`/files?path=${encodeURIComponent(path)}`);
        const files = await res.json();

        if (!files.length) {
            list.innerHTML = '<div class="empty-state">[ empty directory ]</div>';
            return;
        }

        list.innerHTML = '';
        files.forEach((file, i) => {
            const el = renderFileItem(file);
            el.style.animationDelay = `${i * 25}ms`;
            list.appendChild(el);
        });

    } catch (err) {
        list.innerHTML = '<div class="empty-state">[ failed to load ]</div>';
    }
}

// ── RENDER FILE ITEM ──
function renderFileItem(file) {
    const div = document.createElement('div');
    div.className = `file-item${file.is_folder ? ' is-folder' : ''}`;

    const type = file.is_folder ? 'folder' : getFileType(file.name);
    const icon = getFileEmoji(type);
    const meta = file.is_folder ? 'folder' : `${file.size_mb} MB`;

    div.innerHTML = `
        <div class="file-left">
            <div class="file-icon ${type}">${icon}</div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-meta">${meta}</div>
            </div>
        </div>
        <div class="file-right">
            ${!file.is_folder
                ? `<button class="download-btn" onclick="event.stopPropagation(); downloadFile('${file.path}')">↓ get</button>`
                : `<span class="chevron">›</span>`
            }
        </div>
    `;

    if (file.is_folder) {
        div.onclick = () => loadFiles(file.path);
    }

    return div;
}

// ── BREADCRUMB ──
function updateBreadcrumb(path) {
    const crumb = document.getElementById('breadcrumb');
    let html = `<span class="crumb" onclick="loadFiles('')">~</span>`;

    if (path) {
        const parts = path.split('/');
        let built = '';
        parts.forEach((part, i) => {
            built += (i === 0 ? '' : '/') + part;
            const p = built;
            html += `<span class="separator"> / </span><span class="crumb" onclick="loadFiles('${p}')">${part}</span>`;
        });
    }

    crumb.innerHTML = html;
}

// ── DOWNLOAD ──
function downloadFile(path) {
    window.location.href = `/download?path=${encodeURIComponent(path)}`;
}

// ── UPLOAD ──
function fileSelected() {
    const input = document.getElementById('file-input');
    selectedFile = input.files[0];
    const label = document.getElementById('upload-label');

    if (selectedFile) {
        label.textContent = `${selectedFile.name}`;
        label.classList.add('has-file');
    } else {
        label.textContent = '↑ tap to select file';
        label.classList.remove('has-file');
    }
}

async function uploadFile() {
    if (!selectedFile) {
        alert('select a file first');
        return;
    }

    const progress = document.getElementById('progress-bar');
    progress.style.display = 'block';
    progress.textContent = `↑ uploading ${selectedFile.name}...`;

    const form = new FormData();
    form.append('file', selectedFile);

    try {
        const res = await fetch('/upload', { method: 'POST', body: form });
        const result = await res.json();

        progress.textContent = `✓ ${result.message}`;
        progress.style.color = 'var(--success)';

        selectedFile = null;
        document.getElementById('file-input').value = '';
        const label = document.getElementById('upload-label');
        label.textContent = '↑ tap to select file';
        label.classList.remove('has-file');

        loadFiles(currentPath);

    } catch (err) {
        progress.textContent = '✗ upload failed';
        progress.style.color = 'var(--danger)';
    }

    setTimeout(() => {
        progress.style.display = 'none';
        progress.style.color = 'var(--accent)';
    }, 3000);
}

// ── INIT ──
loadFiles();