import { Snowflake, Sun, Thermometer } from 'lucide-react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

export default function App() {

  const [dados, setDados] = useState<{
    nomeCidade: string;
    temperatura: number;
    dataDeHoje: string;
    horaAtual: string;
    umidade: number;
    vento: number;
  } | null>(null)
  const [cidade, setCidade] = useState("")
  const [horaAtual, setHoraAtual] = useState("")
  const [temperaturaAtual, setTemperaturaAtual] = useState<number | null>(null)
  const [climaAtual, setClimaAtual] = useState({ Icon: "Snowflake", Clima: "Agradável", bgColor: "#FFe142" })



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
    if (!latitude || !longitude) {
      console.error("Latitude ou longitude inválidas.");
      return;
    }
  
    const pegarHoraAtual = new Date();
    setHoraAtual(pegarHoraAtual.toLocaleTimeString('pt-BR'));
  
    try {
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude,
          longitude,
          current_weather: true,
          hourly: 'relative_humidity_2m',
          timezone: 'auto',
        },
      });
  
      if (
        response.data &&
        response.data.current_weather &&
        response.data.hourly &&
        response.data.hourly.time
      ) {
        const tempAtual = response.data.current_weather.temperature;
        const vento = response.data.current_weather.windspeed;
  
        const currentHourISO = new Date().toISOString().slice(0, 13); // exemplo: "2025-05-05T14"
        const horaIndex = response.data.hourly.time.findIndex((time: string) =>
          time.startsWith(currentHourISO)
        );
  
        const umidade =
          horaIndex !== -1
            ? response.data.hourly.relative_humidity_2m[horaIndex]
            : 0;
  
        setTemperaturaAtual(tempAtual);
  
        setDados({
          nomeCidade: cidade,
          temperatura: tempAtual,
          dataDeHoje: new Date().toLocaleDateString('pt-BR'),
          horaAtual: pegarHoraAtual.toLocaleTimeString('pt-BR'),
          vento,
          umidade,
        });
      } else {
        console.error("Dados incompletos da API.");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do clima:", error);
    }
  }
  



  useEffect(() => {
    if (temperaturaAtual === null) return;

    if (temperaturaAtual < 20) {
      setClimaAtual({ Icon: "Snowflake", Clima: "Frio", bgColor: "#42C6FF" });
    } else if (temperaturaAtual >= 20 && temperaturaAtual <= 30) {
      setClimaAtual({ Icon: "Snowflake", Clima: "Agradável", bgColor: "#FFe142" });
    } else if (temperaturaAtual > 30) {
      setClimaAtual({ Icon: "Snowflake", Clima: "Quente", bgColor: "#FF64d4" });
    }

  }, [temperaturaAtual]);

  const getIconeClima = () => {
    switch (climaAtual.Clima) {
      case "Frio":
        return <Snowflake />;
      case "Agradável":
        return <Sun />;
      case "Quente":
        return <Thermometer />;
      default:
        return <Sun />;
    }
  }

  return (
    <div className='p-20 w-screen h-screen flex flex-col items-center justify-center gap-[5vh] ' style={{ backgroundColor: climaAtual.bgColor }}>
      <input onChange={(e) => setCidade(e.target.value)} className='p-3 rounded-4xl text-xl text-center bg-white' placeholder='cidade/país ' />
      <div className='pl-20 pr-20 bg-black text-white rounded-xl'>{dados?.dataDeHoje || "Carregando..."} </div>
      <div className='flex gap-2'>
        {getIconeClima()}
        {climaAtual.Clima}
      </div>
      <div className='m-auto text-8xl'>{dados?.temperatura}C° </div>
      <div>{horaAtual}</div>
      <div className='flex gap-10 text-2xl'>
        <div className='border rounded-md p-5'>{dados?.umidade}</div>
        <div className='border rounded-md p-5'>{dados?.vento}</div>
      </div>
      <button onClick={() => handleNewWeather()} className='p-3 bg-black rounded-4xl' style={{ color: climaAtual.bgColor }} type="submit">clique aqui</button>


    </div>
  )
}


