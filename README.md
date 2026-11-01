# AlgoArcher MVP

## Run
```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
python -m app.seed
uvicorn app.main:app --reload
cd frontend; npm install; npm run dev
```
Open http://localhost:5173. Demo: `admin@college.edu / Admin@123`, `alice@college.edu / S001`.

This zero-setup demo uses SQLite. Set `DB_PATH` to choose another local database. Judge0 is optional.
