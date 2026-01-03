## Setup & Run (Windows PowerShell)

### 1- Backend (FastAPI)
From the project root:
Open a new powershell and type in these commands : 

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
Backend will be available at: http://127.0.0.1:8000
Swagger docs: http://127.0.0.1:8000/docs


### To start the backend : 
```
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
 --host 0.0.0.0 allows phones on the same Wi-Fi to reach the QR endpoint


### 2- Frontend (Vue) : 

In a second terminal, type one time these 2 commands:

```
cd frontend
npm install
```

Then each time you want to start your frontend, type this command also in your frontend folder :

```
npm run dev
```

the frontend will then be available at http://localhost:5173

