import { DisplayContainer } from '../shared';
import { AnimationProvider, itemVariants } from '../shared/animation-provider';
import { motion } from 'framer-motion';
import type { WeatherForecast } from '@/api';
import bgImage from '@/assets/backgrounds/05.jpeg';
import { format } from 'date-fns';

interface WeatherDisplayProps {
  weatherForecast: WeatherForecast;
}

export function WeatherDisplay({ weatherForecast }: WeatherDisplayProps) {
  const { current, forecast } = weatherForecast;

  const getWeatherIcon = (iconCode: string, size: '2x' | '4x' = '4x') => {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  };

  const formatDescription = (description: string) => {
    return description
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDayName = (date: Date) => {
    return format(date, 'EEE');
  };

  return (
    <DisplayContainer backgroundImage={bgImage}>
      <AnimationProvider>
        <div className='flex flex-col items-center justify-center w-full max-w-7xl mx-auto'>
          <motion.div variants={itemVariants} className='text-white text-center mb-4'>
            <h3 className='text-2xl md:text-3xl font-bold drop-shadow-lg'>{current.cityName}</h3>
          </motion.div>

          {/* Today's Weather - Prominent Display */}
          <motion.div variants={itemVariants} className='flex flex-col items-center mb-8 w-full'>
            <div className='text-lg md:text-xl text-white mb-2 font-bold drop-shadow-lg'>Today</div>
            <div className='flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12'>
              <img
                src={getWeatherIcon(current.icon)}
                alt={current.description}
                className='w-28 h-28 md:w-36 md:h-36 drop-shadow-2xl'
              />
              <div className='text-center'>
                <div className='text-5xl md:text-6xl font-bold text-white mb-1 drop-shadow-lg'>
                  {current.temperature}°C
                </div>
                <div className='text-lg md:text-xl text-white font-semibold drop-shadow-md'>
                  Feels like {current.feelsLike}°C
                </div>
                <div className='text-xl md:text-2xl text-white mt-2 font-semibold drop-shadow-md'>
                  {formatDescription(current.description)}
                </div>
              </div>
              <div className='flex flex-row md:flex-col gap-4 text-white mt-4 md:mt-0'>
                <div className='flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg'>
                  <span className='text-2xl drop-shadow-md'>💧</span>
                  <div>
                    <div className='text-sm text-white font-medium'>Humidity</div>
                    <div className='text-lg font-bold text-white'>{current.humidity}%</div>
                  </div>
                </div>
                <div className='flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg'>
                  <span className='text-2xl drop-shadow-md'>💨</span>
                  <div>
                    <div className='text-sm text-white font-medium'>Wind</div>
                    <div className='text-lg font-bold text-white'>{current.windSpeed} km/h</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 7-Day Forecast */}
          <motion.div variants={itemVariants} className='w-full flex flex-col items-center'>
            <div className='text-center text-xl md:text-2xl text-white mb-4 font-bold drop-shadow-lg'>
              Next {forecast.length} Days
            </div>
            <div className='w-full flex justify-center'>
              <div className='flex gap-3 md:gap-4'>
                {forecast.map((day, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className='flex flex-col items-center justify-between bg-black/40 backdrop-blur-md rounded-2xl p-3 md:p-4 w-[110px] md:w-[130px] h-[180px] md:h-[200px] hover:bg-black/50 transition-colors shadow-lg'
                  >
                    <div className='text-white font-bold text-sm md:text-base drop-shadow-md'>
                      {getDayName(day.date)}
                    </div>
                    <img
                      src={getWeatherIcon(day.icon, '2x')}
                      alt={day.description}
                      className='w-14 h-14 md:w-16 md:h-16 drop-shadow-lg'
                    />
                    <div className='flex flex-col items-center'>
                      <div className='text-white font-bold text-base md:text-lg drop-shadow-md'>
                        {day.tempMax}°
                      </div>
                      <div className='text-white/90 text-sm drop-shadow-md'>{day.tempMin}°</div>
                    </div>
                    <div className='text-white text-xs text-center font-medium drop-shadow-sm h-8 flex items-center'>
                      {formatDescription(day.description).split(' ').slice(0, 2).join(' ')}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </AnimationProvider>
    </DisplayContainer>
  );
}
