"use client"
import 'leaflet/dist/leaflet.css';
// import './map-styles.css';

// import L from 'leaflet';
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'; // Re-uses images from ~leaflet package
// import L, { latLngBounds }  from 'leaflet';
// import 'leaflet-defaulticon-compatibility';
import { icon } from "leaflet";


// Map marker icon credit: https://www.flaticon.com/free-icon/maps-and-flags_447031?term=map+marker&page=1&position=1&origin=tag&related_id=447031

// Container for map, and component serving tiles fromm 
// map provider respectively
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import { useState, useCallback, useEffect } from 'react';

/*
    N.B. this won't work in Next.js ('Window is not defined' error arises because)
    'window' JS object not available in server-side rendering. 
    Add dynamic immports to resolve in index.js:
        import dynamic from 'next/dynamic';
        const Map = dynamic(() => import('./dev_code/TrackingPage/Map), {
            ssr: false
        });

        export default Map;


    And call this Map component from indnex.js, instead of MMap from dev_code/TrackingPage/
*/


// Credit: code adapted from https://stackoverflow.com/q/65878831
// const ChangeView = ({ markers }) => {
//     const map = useMap();
//     // Using 14 as default zoom
//     // map.setView({lng: 0, lat: 0}, 1);
//     let markerBounds = latLngBounds([]);
//     markers.forEach(marker => {
//         if (marker.location?.lat && marker.location?.lon) {
//             markerBounds.extend([marker.location.lat, marker.location.lon])
//         }
//     });
//     console.log('Marker bounds:', markerBounds);
//     console.log('Maker bounds valid:', markerBounds.isValid())
//     markerBounds.isValid() && map.fitBounds(markerBounds);
//     return null;
    
// }

// let DefaultIcon = L.icon({
//     iconUrl: icon,
//     shadowUrl: iconShadow,
//     iconSize: [25,41], 
//     iconAnchor: [12,41]
// });

// L.Marker.prototype.options.icon = DefaultIcon;


const ICON = icon({
    iconUrl: "/public/icons/map-marker.png",
    iconSize: [32, 32],
  })
console.log('Is ICON displaying? ', ICON);

const LeafletMap = ({ activities }) => {
    // activities && console.log('Activity data passed to map: ', activities)

    const [locationNames, setLocationNames] = useState([]);

    /*
        Helper to get name of a location given its latitutde/longitude
        using the Nominatim reverse geocoding API
    */
    const getLocationName = async (location) => {
        if (location && location.lat && location.lon) {
            try {
                const nameJson = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lon}&format=json`);
                const nameData = await nameJson.json();
                const name = [
                    nameData?.address?.city,
                    nameData?.address?.state,
                    nameData?.address?.country
                ].filter(v => v).join(', ');
                console.log('return value is:', name || nameData?.display_name);
                // setLocationNames()
                return name || nameData?.display_name
            }
            catch (error) {
                console.log(error);
            }
        }
    }


    // const getName = useCallback(async (location) => {
    //     console.log('Potential new location name:', location?.name || await getLocationName(location));
    //     setLocationName(location?.name || await getLocationName(location));
    // }, [])
    useEffect(() => {
        (async () => {
            // console.log('Potential new location name:', location?.name || await getLocationName(location));
            // setLocationNames(activities.reduce(async (acc, curr, index) => 
            //     ({...acc, index: index, name: curr.location?.name || await getLocationName(curr.location)}), {})
            //     // { index: location?.name || await getLocationName(location)
            // );
            setLocationNames(activities.map(async(curr, index) => 
                locationNames.push(curr.location?.name || await getLocationName(curr.location))));
        })();
    }, []);
    useEffect(() => console.log('Location names:', locationNames), [locationNames]);
    

    // Check if all activity locations are [0, 0] 
    // (the blockchain default value for an empty location)
    const isLocationsEmpty = (activities) => 
        activities.every(e => e.location?.lat == 0 && e.location?.lon == 0);

    return (
        <div style={{height: '300px', width: '100%', border: 2, borderColor: 'purple'}}>
            <MapContainer style={{height: '100%', width: '100%'}} center={[51.505, -0.09]} zoom={2} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <>
                    {/* {activities && !isLocationsEmpty(activities) && <ChangeView markers={activities}/>} */}
                    {activities?.map((activity, i) => (
                        <Marker 
                            icon={ICON}
                            position={[activity.location?.lat || 0, activity.location?.lon || 0]}
                            // icon={DefaultIcon}
                            key={i}
                        >
                            {console.log('Activity ' + i + ' passed to map:', activity)}
                            {/* {console.log('Activity location: ', activity.location?.name || await getLocationName(activity.location))} */}
                            {console.log('Activity amounts:', `${activity.indicatorAmount} ${activity.indicator}`)}
                            <Tooltip 
                                // key={`index-${locationNames}`}
                            >
                                {activity.indicatorAmount} {activity.indicator} <br />
                                {/* Location: {activity.location?.name || getLocationName(activity.location)} */}
                                {/* Location: {locationNames[i]} */}
                                Location: {activity.location?.name}
                            </Tooltip>
                        </Marker>
                    ))}
                </>
                <Marker position={[51.505, -0.09]}>
                    <Tooltip>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Tooltip>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default LeafletMap;