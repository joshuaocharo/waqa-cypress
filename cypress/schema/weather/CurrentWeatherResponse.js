import { object, number, string, array } from 'yup';

const dailyItem = object({
  date: string().required(),
  temp_max: number().required(),
  temp_min: number().required(),
  precipitation: number().required(),
  weathercode: number().required(),
}).strict(true);

const hourlyItem = object({
  time: string().required(),
  temp: number().required(),
  precipitation: number().required(),
  weathercode: number().required(),
}).strict(true);

const currentBlock = object({
  time: string().required(),
  interval: number().required(),
  temperature: number().required(),
  windspeed: number().required(),
  winddirection: number().required(),
  is_day: number().required(),
  weathercode: number().required(),
}).strict(true);

module.exports.currentWeatherSchema = object({
  lat: number().required(),
  lon: number().required(),
  units: string().required(),
  days: number().required().positive(),
  current: currentBlock.required(),
  daily: array().of(dailyItem).required(),
  hourly: array().of(hourlyItem).required(),
  ai_summary: string().nullable(),
}).strict(true);