import csv
import math
import statistics
from collections import deque


class RiskAnalyser:
    def __init__(
        self,
        history_size: int = 100,
        position_weight: float = 0.6,
        movement_weight: float = 0.4,
        warning_zscore: float = 1.0,
        critical_zscore: float = 2.0,
    ):
        self.prev_x = 0.0
        self.prev_y = 0.0
        self.current_risk = 0.0
        self.current_zscore = 0.0
        self.risk_history = deque(maxlen=history_size)
        self.position_weight = position_weight
        self.movement_weight = movement_weight
        self.warning_zscore = warning_zscore
        self.critical_zscore = critical_zscore

    def update(self, x: float, y: float) -> float:
        dx = x - self.prev_x
        dy = y - self.prev_y
        pos_risk = math.hypot(x, y)
        move_risk = math.hypot(dx, dy)
        risk = self.position_weight * pos_risk + self.movement_weight * move_risk

        self.current_risk = risk
        self.risk_history.append(risk)
        self.current_zscore = self.calculate_zscore(risk)
        self.prev_x = x
        self.prev_y = y
        return risk

    def calculate_zscore(self, risk: float) -> float:
        if len(self.risk_history) < 10:
            return 0.0

        std = statistics.stdev(self.risk_history)
        if std == 0:
            return 0.0

        mean = statistics.mean(self.risk_history)
        return (risk - mean) / std

    def get_status(self) -> str:
        if self.current_zscore > self.critical_zscore:
            return "Critical"
        if self.current_zscore > self.warning_zscore:
            return "Warning"
        return "Safe"

    def get_risk(self) -> float:
        return self.current_risk

    def get_zscore(self) -> float:
        return self.current_zscore

    def get_history(self) -> list[float]:
        return list(self.risk_history)


class DataLogger:
    def __init__(self, filename: str = "bed_data.csv"):
        self.file = open(filename, "w", newline="")
        self.writer = csv.writer(self.file)
        self.writer.writerow(["time", "xBalance", "yBalance", "risk", "zScore", "status"])

    def log(self, timestamp: float, x: float, y: float, risk: float, z_score: float, status: str) -> None:
        self.writer.writerow([timestamp, x, y, risk, z_score, status])
        self.file.flush()

    def close(self) -> None:
        self.file.close()
