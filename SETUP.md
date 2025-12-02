# Setup Guide

## Environment Setup Complete ✓

### What was done:

1. **Created Virtual Environment** (Python 3.12)
   - Location: `venv/`
   - Python 3.12 was used instead of 3.13 because PyTorch doesn't support 3.13 yet

2. **Installed Dependencies**
   - FastAPI & Uvicorn (API framework)
   - SQLAlchemy & Alembic (Database ORM & migrations)
   - AsyncPG & psycopg2-binary (PostgreSQL drivers)
   - Pandas & NumPy (Data processing)
   - PyTorch 2.9.1 (Machine learning)
   - tqdm (Progress bars)
   - python-dotenv, pydantic (Configuration & validation)

3. **Created Configuration Files**
   - `requirements.txt` - All Python dependencies
   - `.gitignore` - Comprehensive ignore patterns for:
     - Virtual environment (`venv/`)
     - Python cache files (`__pycache__/`, `*.pyc`)
     - Data files (`data/movielens_raw/`, `data/movielens_processed/`)
     - Model checkpoints
     - Environment files (`.env`)
     - IDE files

4. **Verified Installation**
   - All imports working correctly
   - PyTorch version: 2.9.1
   - Preprocess module loads successfully

### How to use:

#### Activate virtual environment:
```bash
source venv/bin/activate
```

#### Run the preprocessing script:
```bash
python -m backend.ml.preprocess
```

#### Deactivate when done:
```bash
deactivate
```

### Git Status:
- ✓ `.gitignore` added to staging
- ✓ `requirements.txt` added to staging
- ✓ `venv/` properly ignored
- ✓ Data directories will be ignored

### Next Steps:
1. Download MovieLens dataset to `data/movielens_raw/ratings.csv`
2. Run the preprocessing script
3. Train your recommendation model

### Notes:
- Using Python 3.12 (not 3.13) for PyTorch compatibility
- Virtual environment is in `venv/` and properly git-ignored
- All dependencies installed successfully
