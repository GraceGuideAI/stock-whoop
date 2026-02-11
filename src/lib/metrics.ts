export type MetricKey =
  | "recovery"
  | "sleepPerformance"
  | "sleepHours"
  | "strain"
  | "hrvRmssd"
  | "rhr"
  | "respiratoryRate"
  | "skinTempC"
  | "caloriesKcal"
  | "steps";

export const metricDefinitions: {
  key: MetricKey;
  label: string;
  unit: string;
  accent: string;
  description: string;
}[] = [
  {
    key: "recovery",
    label: "Recovery",
    unit: "%",
    accent: "bg-limepop-400",
    description: "Readiness for strain."
  },
  {
    key: "sleepPerformance",
    label: "Sleep",
    unit: "%",
    accent: "bg-skybolt-400",
    description: "Sleep performance score."
  },
  {
    key: "sleepHours",
    label: "Sleep Hours",
    unit: "h",
    accent: "bg-sunshine-400",
    description: "Total sleep time."
  },
  {
    key: "strain",
    label: "Strain",
    unit: "",
    accent: "bg-candy-400",
    description: "Daily exertion score."
  },
  {
    key: "hrvRmssd",
    label: "HRV",
    unit: "ms",
    accent: "bg-skybolt-500",
    description: "Heart rate variability."
  },
  {
    key: "rhr",
    label: "RHR",
    unit: "bpm",
    accent: "bg-candy-500",
    description: "Resting heart rate."
  },
  {
    key: "respiratoryRate",
    label: "Respiratory Rate",
    unit: "rpm",
    accent: "bg-limepop-500",
    description: "Breaths per minute."
  },
  {
    key: "skinTempC",
    label: "Skin Temp",
    unit: "°C",
    accent: "bg-sunshine-500",
    description: "Skin temperature."
  },
  {
    key: "caloriesKcal",
    label: "Calories",
    unit: "kcal",
    accent: "bg-candy-300",
    description: "Calories burned."
  },
  {
    key: "steps",
    label: "Steps",
    unit: "",
    accent: "bg-skybolt-300",
    description: "Step count."
  }
];
