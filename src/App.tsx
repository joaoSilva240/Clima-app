import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

export default function App() {

  const [dados, setDados] = useState<{ nomeCidade: string;temperatura:number[];dataDeHoje:string } | null>(null)
  const [bgColor, setBgColor] = useState("#FFe142")
  const [cidade, setCidade] = useState("Brasil")
  const [coordenadas, setCoordenadas] = useState<{ latitude: string; longitude: string } | null>(null)

  useEffect(() => {
    const buscaPelaCidade = async () => {
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
          setCoordenadas({ latitude: lat, longitude: lon })
        }


      } catch (error) {
        console.error('não foi possivel encontrar')
      }
    }
    buscaPelaCidade()
  }
    ,[cidade])

  useEffect(() => {
    if (!coordenadas) return
    
    const buscarClima = async () => {
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: coordenadas?.latitude,
          longitude: coordenadas?.longitude,
          hourly: 'temperature_2m',
          timezone: 'auto',
        }
      })
      if (
        response.data &&
        response.data.hourly &&
        response.data.hourly.temperature_2m
      ) {
        setDados({
          nomeCidade: cidade,
          temperatura: response.data.hourly.temperature_2m.slice(0, 12),
          dataDeHoje:response.data.hourly.time.slice(0,12),
        });
      } else {
        console.error("Dados de temperatura não encontrados na resposta:", response.data);
      }

      console.log(response)
    }
    buscarClima()
  }, [coordenadas, cidade])




  return (
    <div className='p-20 w-screen h-screen flex flex-col items-center justify-center gap-[5vh] ' style={{ backgroundColor: bgColor }}>
      <button className='p-5 bg-black text-white rounded-xl' type="submit">clique aqui</button>
      <input onChange={(e) => setCidade(e.target.value)} className='p-3 rounded-4xl text-xl text-center bg-white' placeholder='cidade/país ' />
      <div className='pl-20 pr-20 bg-black text-white rounded-xl'>{dados?.dataDeHoje[0]} </div>
      <div className='m-auto text-7xl'>{dados?.temperatura[0]} C° </div>
      <div>clima do dia </div>
     
   
    </div>
  )
}
