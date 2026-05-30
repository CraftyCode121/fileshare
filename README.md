# FileShare

A fast, local file transfer system between your laptop and any device on the same WiFi — no apps, no cables, no cloud. Just open a browser.

## Features

* **Complete Access:** Browse your entire home directory from any device on the network.
* **Seamless Downloads:** Download any file directly to your phone or tablet.
* **Instant Uploads:** Upload files from your phone to your laptop — automatically lands in `~/Downloads`.
* **Sleek Interface:** Clean dark funcky UI featuring file type icons, responsive breadcrumb navigation, and smooth animations.
* **Zero Dependencies:** Pure client-side operation — works in any modern mobile or desktop browser without setup.
* **High Performance:** Built on raw async I/O with chunked transfers to ensure zero RAM overload, even with multi-gigabyte files.

---

## Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | FastAPI + Uvicorn |
| **Async File I/O** | `aiofiles` |
| **Templating** | Jinja2 |
| **Frontend** | Vanilla JS + Modern CSS |

---

## Project Structure

share/
├── server.py           # FastAPI app — all endpoints
├── templates/
│   └── index.html      # Jinja2 HTML template
├── static/
│   ├── css/
│   │   └── style.css   # UI styles
│   └── js/
│       └── app.js      # Frontend logic
└── requirements.txt

---

## Getting Started

### 1. Clone the repo
git clone https://github.com/CraftyCode121/fileshare.git
cd fileshare

### 2. Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

### 3. Install dependencies
pip install -r requirements.txt

### 4. Run the server
uvicorn server:app --host 0.0.0.0 --port 8080 --reload

### 5. Find your local IP
macOS/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

Windows (PowerShell):
ipconfig | Select-String "IPv4 Address"

### 6. Open on your phone
Navigate to the following URL in your phone's browser:
http://<your-laptop-ip>:8080

Note: Ensure both your laptop and your mobile device are connected to the exact same WiFi network network.

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Serves the main web UI |
| `GET` | `/files?path=` | Lists files and directories inside a given path |
| `GET` | `/download?path=` | Streams a specific file for download |
| `POST` | `/upload` | Uploads a file multipart-stream from the client |

---

## Security

* **Scope:** This tool is strictly intended for local, trusted network use. Do not expose this port to the public internet.

---

## Requirements

The following dependencies are specified in `requirements.txt`:
* fastapi
* uvicorn[standard]
* python-multipart
* aiofiles
* jinja2

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.