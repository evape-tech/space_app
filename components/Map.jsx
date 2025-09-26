import React, { useState, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { Wrapper } from "@googlemaps/react-wrapper";
import styles from "@/styles/maps.module.scss";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import MapCenterIcon from "@/image/icons/map-center.svg";
import { userPosState, currStationInfoState } from "@/atom/atomState";
import { getStations } from "@/client-api/station";
import { getKms } from '@/utils/mapTool'

const Map = ({ latitude, longitude, centerOfMap }) => {
  const ref = useRef(null);
  const [map, setMap] = useState(null);
  const [centerMarker, setCenterMarker] = useState(null);
  const [currStationInfo, setCurrStationInfo] =
    useRecoilState(currStationInfoState);
  const [userPos, setUserPos] = useRecoilState(userPosState);
  var InforObj = [];
  let locations;

  const fetchData = async () => {
    return new Promise((resolve, reject) => {
      getStations()
        .then(async (rsp) => {
          // setLocations(rsp)
          // (userPos, destinations, isOrder)
          const locations = await getKms(userPos, rsp)
          // const locations = rsp
          resolve(locations);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  };

  async function addMarker(map) {
    locations = await fetchData();

    const markers = [];
    for (var i = 0; i < locations.length; i++) {
      var contentString = JSON.stringify(locations[i]);

      const marker = new google.maps.Marker({
        position: {
          lat: locations[i].latLng.lat,
          lng: locations[i].latLng.lng,
        },
        map: map,
        icon: {
          url: "/images/map-cp-icon.png",
        },
      });

      const infowindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 200,
      });

      marker.addListener("click", async function (e) {
        // const pos = marker.getPosition();
        const stationInfo = JSON.parse(infowindow.content);
        // stationInfo.km = await getKm(pos);
        // console.log("stationInfo", stationInfo)
        setCurrStationInfo(stationInfo);
        console.log(stationInfo);
      });

      markers.push(marker);
    }

    // use default algorithm and renderer
    const markerCluster = new MarkerClusterer({ map, markers });
  }

  function closeOtherInfo() {
    if (InforObj.length > 0) {
      InforObj[0].set("marker", null);
      /* and close it */
      InforObj[0].close();
      /* blank the array */
      InforObj.length = 0;
    }
  }

  useEffect(() => {
    if (ref.current && !map) {
      const map = new google.maps.Map(ref.current, {
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        center: {
          lat: latitude,
          lng: longitude,
        },
        zoom: 11,
      });

      var userMarker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        label: {
          color: "#fff",
          fontWeight: "bold",
          fontSize: "14px",
          text: "我的位置",
          className: styles["map-label"],
        },
      });

      setCenterMarker(userMarker);

      const cityCircle = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 0,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        map: map,
        center: { lat: latitude, lng: longitude },
        radius: 100,
      });

      var listenerHandle = google.maps.event.addListener(map, "click", () => {
        setCurrStationInfo(null);
      });

      addMarker(map);

      setMap(map);
    }
  }, [, ref, map, latitude, longitude]);

  return (
    <>
      <div ref={ref} style={{ height: "100%", width: "100%" }} />
      <div className="absolute bottom-[130px] right-0">
        <button onClick={() => centerOfMap(map, centerMarker)}>
          <MapCenterIcon />
        </button>
      </div>
    </>
  );
};

const SMap = () => {
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [userPos, setUserPos] = useRecoilState(userPosState);

  const centerOfMap = (map, marker) => {
    const zoom = map.getZoom();
    if (zoom > 11) map.setZoom(11);
    map.panTo(marker.getPosition());
  };

  useEffect(() => {
    // 調試：檢查 API 密鑰是否正確設置
    console.log('Google Maps API Key:', process.env.NEXT_PUBLIC_GMAPS_API_KEY);
    
    // get the users current location on intial login
    if (navigator.geolocation) {
      // navigator.geolocation.getCurrentPosition(
      navigator.geolocation.watchPosition(
        ({ coords: { latitude, longitude } }) => {
          console.log({ latitude, longitude });
          setLat(latitude);
          setLng(longitude);
          setUserPos({ lat: latitude, lng: longitude });
        }
      );
    } else {
      alert("Sorry, 你的裝置不支援地理位置功能。");
    }
  }, []);

  return (
    <Wrapper apiKey={process.env.NEXT_PUBLIC_GMAPS_API_KEY}>
      {(userPos?.lat || userPos?.lng) && (
        <Map
          latitude={userPos?.lat}
          longitude={userPos?.lng}
          centerOfMap={centerOfMap}
        />
      )}
    </Wrapper>
  );
};

export default SMap;
