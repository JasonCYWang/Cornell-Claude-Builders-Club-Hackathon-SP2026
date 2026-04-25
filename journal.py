from datetime import datetime

class JournalEntry:
    def __init__(self, text):
        self.text = text
        self.timestamp = datetime.now()

    def formatted_time(self):
        return self.timestamp.strftime("%Y-%m-%d %H:%M:%S")

    def to_dict(self):
        return {
            "text": self.text,
            "timestamp": self.formatted_time()
        }


class Journal:
    def __init__(self):
        self.entries = []

    def add_entry(self, text):
        entry = JournalEntry(text)
        self.entries.insert(0, entry)  # newest at front
        return entry

    def get_entries(self):
        return [entry.to_dict() for entry in self.entries]