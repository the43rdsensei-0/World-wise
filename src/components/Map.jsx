import { useEffect, useState } from 'react';
import {useGeolocation} from '../hooks/useGeolocation'
import { useNavigate} from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useURLPosition } from '../hooks/useURLPosition';

import styles from './Map.module.css'
import { useCities } from '../contexts/CitiesContext';
import Button from './Button';

function Map() {
  const {cities} = useCities();
  const [mapPosition, setMapPosition] = useState([40, 0])
  const {isLoading: isLoadingPosition, position: geoPosition, getPosition} = useGeolocation()
  const [mapLat, mapLng] = useURLPosition();
  
  

  useEffect(function() {
    if(mapLat && mapLng) setMapPosition([mapLat, mapLng])
  }, [mapLat, mapLng]);

  useEffect(function() {
    if(geoPosition) setMapPosition([geoPosition.lat, geoPosition.lng])
  }, [geoPosition])

  return (
    <div className={styles.mapContainer}>
      {!geoPosition && <Button type='position' onClick={getPosition}>{isLoadingPosition ? 'Loading...' : 'Use your position '}</Button>}
      <MapContainer center={mapPosition} zoom={13} scrollWheelZoom={true} className={styles.map}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
    />
    {cities.map((city) => <Marker position={[city.position.lat, city.position.lng]} key={city.id}>
      <Popup>
        <span>{city.emoji}</span>
        <span>{city.cityName}</span>
      </Popup>
    </Marker>)}
    <ChangeCenter position={mapPosition}/>
    <DetectClick />
  </MapContainer>
    </div>
  )
}

// eslint-disable-next-line react/prop-types
function ChangeCenter({position}) {
  const map = useMap();
  map.setView(position)

  return null;
}

function DetectClick() {
  const navigate = useNavigate()

  useMapEvents({
    click: e => {
      const {lat, lng} = e.latlng;
      navigate(`form?lat=${lat}&lng=${lng}`)
    }
  })
}

export default Map;