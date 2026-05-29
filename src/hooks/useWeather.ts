import { useState, useEffect } from 'react'

interface WeatherData {
  temp: number
  emoji: string
  condition: string
}

const WEATHER_EMOJIS: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️',
  80: '🌦️', 81: '🌦️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    const cached = localStorage.getItem('fq_weather')
    if (cached) {
      const { data, ts } = JSON.parse(cached) as { data: WeatherData; ts: number }
      if (Date.now() - ts < 30 * 60 * 1000) {
        setWeather(data)
        return
      }
    }

    navigator.geolocation?.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`
          )
          const json = await res.json() as { current_weather: { temperature: number; weathercode: number } }
          const { temperature, weathercode } = json.current_weather
          const data: WeatherData = {
            temp: Math.round(temperature),
            emoji: WEATHER_EMOJIS[weathercode] ?? '🌡️',
            condition: String(weathercode),
          }
          setWeather(data)
          localStorage.setItem('fq_weather', JSON.stringify({ data, ts: Date.now() }))
        } catch {
          // ignore
        }
      },
      () => {
        // no location permission — show nothing
      }
    )
  }, [])

  return weather
}
