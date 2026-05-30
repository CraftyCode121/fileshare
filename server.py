import os
import socket
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import FileResponse
import aiofiles

# setup
HOME_DIR = Path.home()
UPLOAD_DIR = HOME_DIR / "Downloads"
app = FastAPI()

# static and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# get server ip automatically
def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    ip = s.getsockname()[0]
    s.close()
    return ip

# routes
@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse(
    request=request,
    name="index.html",
    context={
        "username": os.getlogin(),
        "server_ip": get_local_ip()
    }
)

@app.get("/files")
async def list_files(path: str = ""):
    target = HOME_DIR / path

    if not str(target.resolve()).startswith(str(HOME_DIR)):
        return {"error": "Access denied"}

    items = []
    for item in target.iterdir():
        if item.name.startswith('.'):
            continue
        items.append({
            "name": item.name,
            "is_folder": item.is_dir(),
            "size_mb": round(item.stat().st_size / (1024*1024), 2) if item.is_file() else None,
            "path": str(item.relative_to(HOME_DIR))
        })

    return sorted(items, key=lambda x: (not x["is_folder"], x["name"]))

@app.get("/download")
async def download_file(path: str):
    target = HOME_DIR / path

    if not str(target.resolve()).startswith(str(HOME_DIR)):
        return {"error": "Access denied"}

    return FileResponse(
        path=target,
        filename=target.name,
        media_type='application/octet-stream'
    )

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    print(f"Receiving file: {file.filename}")
    print(f"Content type: {file.content_type}")
    
    dest = UPLOAD_DIR / file.filename

    async with aiofiles.open(dest, 'wb') as f:
        while chunk := await file.read(1024 * 1024):
            await f.write(chunk)

    print(f"Saved to: {dest}")
    return {"message": f"Uploaded {file.filename} successfully"}