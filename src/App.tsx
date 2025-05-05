import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

export default function App() {

  const [dados, setDados] = useState<{ nomeCidade: string; temperatura: number; dataDeHoje: string; horaAtual: string } | null>(null)
  const [cidade, setCidade] = useState("")
  const [horaAtual, setHoraAtual] = useState("")
  const [temperaturaAtual, setTemperaturaAtual] = useState<number | null>(null)


  const [climaAtual, setClimaAtual] = useState({ Clima: "Ensolarado", bgColor: "#FFe142" })

  async function handleNewWeather() {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: cidade,
          format: 'json',
          limit: 1,
        }
      }
      )
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        buscarClima(lat, lon)
      }
    } catch (error) {
      console.error('não foi possivel encontrar')
    }
  }



  async function buscarClima(latitude?: string, longitude?: string) {
    const now = new Date()
    const currentHourISO = now.toISOString().slice(0, 13)
    const pegarHoraAtual = new Date();
    setHoraAtual(pegarHoraAtual.toLocaleTimeString('pt-BR'));

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: latitude,
        longitude: longitude,
        hourly: 'temperature_2m',
        timezone: 'auto',
      }
    })
    if (
      response.data &&
      response.data.hourly &&
      response.data.hourly.temperature_2m
    ) {

      const timeArray: string[] = response.data.hourly.time
      const temperatureArray: number[] = response.data.hourly.temperature_2m


      const horaIndex = timeArray.findIndex(time => time.startsWith(currentHourISO))
      const tempAtual = horaIndex !== -1 ? temperatureArray[horaIndex] : null

      setTemperaturaAtual(tempAtual)

      setDados({
        nomeCidade: cidade,
        temperatura: tempAtual ?? 0,
        dataDeHoje: new Date(timeArray[0]).toLocaleDateString('pt-BR'),
        horaAtual: horaAtual,
      })
    }
  }

  return (
    <div className='p-20 w-screen h-screen flex flex-col items-center justify-center gap-[5vh] ' style={{ backgroundColor: climaAtual.bgColor }}>
      <input onChange={(e) => setCidade(e.target.value)} className='p-3 rounded-4xl text-xl text-center bg-white' placeholder='cidade/país ' />
      <div className='pl-20 pr-20 bg-black text-white rounded-xl'>{dados?.dataDeHoje} </div>
      <div>{climaAtual.Clima}</div>
      <div className='m-auto text-8xl'>{dados?.temperatura}C° </div>
      <div>{horaAtual}</div>
      <button onClick={() => handleNewWeather()} className='p-3 bg-black rounded-4xl' style={{ color: climaAtual.bgColor }} type="submit">clique aqui</button>


    </div>
  )
}


