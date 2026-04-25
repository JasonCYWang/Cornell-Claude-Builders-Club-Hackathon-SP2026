class HabitTracker:
    def __init__(self):
        self.trackers = {}
        self.tracker_id_counter = 0

    def new_tracker(self, name, description="", progress=0):
        global tracker_id_counter
        tracker = {
            "id": tracker_id_counter,
            "name": name,
            "description": description,
            "progress": progress,
        }
        self.tracker[tracker_id_counter] = tracker
        tracker_id_counter += 1

    def update_progress(self, id, progress):
        pass
