import { useState, useEffect } from 'react'

interface WeatherData {
  temp: number
  tempF: number
  emoji: string
  description: string
}

// Miami, FL — default location
const MIAMI_LAT =  25.7617
const MIAMI_LON = -80.1918

const WEATHER_EMOJIS: Record<number, string> = {
  0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️',
  45:'🌫️', 48:'🌫️',
  51:'🌦️', 53:'🌦️', 55:'🌦️',
  61:'🌧️', 63:'🌧️', 65:'🌧️',
  71:'❄️', 73:'❄️', 75:'❄️',
  80:'🌦️', 81:'🌦️', 82:'⛈️',
  95:'⛈️', 96:'⛈️', 99:'⛈️',
}

const WEATHER_DESC: Record<number, string> = {
  0:'SUNNY', 1:'MOSTLY SUNNY', 2:'PARTLY CLOUDY', 3:'CLOUDY',
  45:'FOGGY', 48:'FOGGY',
  51:'DRIZZLE', 53:'DRIZZLE', 55:'DRIZZLE',
  61:'RAINY', 63:'RAINY', 65:'HEAVY RAIN',
  71:'SNOW', 73:'SNOW', 75:'HEAVY SNOW',
  80:'SHOWERS', 81:'SHOWERS', 82:'STORMS',
  95:'THUNDERSTORMS', 96:'THUNDERSTORMS', 99:'THUNDERSTORMS',
}

function cToF(c: number) { return Math.round(c * 9 / 5 + 32) }

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    // Check cache (30 min TTL)
    try {
      const cached = localStorage.getItem('fq_weather_v2')
      if (cached) {
        const { data, ts } = JSON.parse(cached) as { data: WeatherData; ts: number }
        if (Date.now() - ts < 30 * 60 * 1000) {
          setWeather(data)
          return
        }
      }
    } catch {}

    async function fetchWeather(lat: number, lon: number) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
        )
        const json = await res.json() as {
          current_weather: { temperature: number; weathercode: number }
        }
        const { temperature, weathercode } = json.current_weather
        const data: WeatherData = {
          temp: Math.round(temperature),
          tempF: cToF(temperature),
          emoji: WEATHER_EMOJIS[weathercode] ?? '🌡️',
          description: WEATHER_DESC[weathercode] ?? 'WEATHER',
        }
        setWeather(data)
        localStorage.setItem('fq_weather_v2', JSON.stringify({ data, ts: Date.now() }))
      } catch {
        // silently fail — use Miami defaults
        const fallback: WeatherData = { temp: 29, tempF: 84, emoji: '☀️', description: 'SUNNY' }
        setWeather(fallback)
      }
    }

    // Try geolocation first, fall back to Miami
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchWeather(coords.latitude, coords.longitude),
        ()           => fetchWeather(MIAMI_LAT, MIAMI_LON),
        { timeout: 5000 }
      )
    } else {
      fetchWeather(MIAMI_LAT, MIAMI_LON)
    }
  }, [])

  return weather
}
