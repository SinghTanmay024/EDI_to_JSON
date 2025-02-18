# EDI to JSON Converter

This project provides a web-based application that converts EDI (Electronic Data Interchange) files into JSON format. The backend is built using Flask, and the frontend is developed using React.

## Features
- Upload EDI files
- Parse and convert EDI data to JSON
- Display converted JSON in the frontend
- Download JSON output

## Tech Stack
### Backend (Flask)
- Python
- Flask
- Flask-CORS
- edi-parser

### Frontend (React)
- React.js
- Axios
- Bootstrap (optional for UI styling)

---

## Installation

### Backend (Flask)
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/edi-to-json.git
   cd edi-to-json/backend
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask server:**
   ```bash
   python app.py
   ```

The Flask backend should now be running at `http://127.0.0.1:5000`

---

### Frontend (React)
1. **Navigate to the frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

The frontend should now be running at `http://localhost:3000`

---

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST   | `/upload` | Uploads an EDI file and returns the JSON output |

## Contributing
Feel free to submit issues and pull requests!

## License
This project is licensed under the MIT License.


