import json
import os
from datetime import datetime

DB_FILE = "data.json"

def save_result(data):
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump([], f)

    with open(DB_FILE, "r") as f:
        records = json.load(f)

    data["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    records.append(data)

    with open(DB_FILE, "w") as f:
        json.dump(records, f, indent=4)