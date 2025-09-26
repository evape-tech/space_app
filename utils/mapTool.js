function success(position, features) {
    return new Promise((resolve, reject) => {
        // 檢查 Google Maps API 是否完全加載
        if (!google || !google.maps || !google.maps.DistanceMatrixService) {
            reject(new Error('Google Maps API 未完全加載'));
            return;
        }

        // 將所在地設成比較的點
        let originPosition = new google.maps.LatLng(position.lat, position.lng);

        // 把要計算的點存成陣列
        let destinations = [];
        features = features.filter(f => f.latLng?.lat > 0 && f.latLng?.lng);
        
        if (features.length === 0) {
            reject(new Error('沒有有效的充電站位置數據'));
            return;
        }

        Array.prototype.forEach.call(features, (f) => {
            destinations.push(
                new google.maps.LatLng(
                    f.latLng.lat,
                    f.latLng.lng
                )
            );
        });

        // 所在位置跟各點的距離
        const service = new google.maps.DistanceMatrixService();
        
        // 設置超時處理
        const timeout = setTimeout(() => {
            reject(new Error('Google Maps API 請求超時'));
        }, 10000); // 10秒超時

        service.getDistanceMatrix(
            {
                origins: [originPosition],
                destinations: destinations,
                travelMode: google.maps.TravelMode.DRIVING, // 使用常數而非字符串
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false, // 不避開高速公路以獲得更準確的結果
                avoidTolls: false,
            },
            callback
        );
        
        function callback(response, status) {
            clearTimeout(timeout); // 清除超時
            
            console.log('Google Maps DistanceMatrix response:', response, 'status:', status);
            
            if (status !== google.maps.DistanceMatrixStatus.OK) {
                console.error('DistanceMatrix failed:', status);
                
                // 提供更詳細的錯誤信息
                let errorMessage = '距離計算失敗: ' + status;
                if (status === 'REQUEST_DENIED') {
                    errorMessage += ' - 可能是 API 密鑰無效或沒有啟用 Distance Matrix API';
                } else if (status === 'OVER_QUERY_LIMIT') {
                    errorMessage += ' - API 配額已用完';
                } else if (status === 'INVALID_REQUEST') {
                    errorMessage += ' - 請求參數無效';
                }
                
                reject(new Error(errorMessage));
                return;
            }
            
            // 檢查response是否有效
            if (!response.rows || !response.rows[0] || !response.rows[0].elements) {
                console.error('Invalid response format');
                reject(new Error('無效的回應格式'));
                return;
            }
            
            // 把距離寫進json裡
            for (let i = 0, len = features.length; i < len; i++) {
                const element = response.rows[0].elements[i];
                if (element.status === google.maps.DistanceMatrixElementStatus.OK) {
                    features[i].distance = element.distance.value;
                    features[i].km = element.distance.text;
                    features[i].distance_time = element.duration.text;
                    console.log(`${features[i].name} - Google Maps 距離: ${element.distance.text}, 時間: ${element.duration.text}`);
                } else {
                    console.warn('Distance calculation failed for feature', i, element.status);
                    features[i].distance = Infinity;
                    features[i].km = '距離未知';
                    features[i].distance_time = '時間未知';
                }
            }
            
            features = features.sort((a, b) => {
                return a.distance > b.distance ? 1 : -1;
            });
            
            console.log('Google Maps 排序完成:', features);
            resolve(features);
        }
    });
}

// Haversine 公式計算兩點間距離（公里）
function calculateDistanceHaversine(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半徑（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
}

// 使用 Haversine 公式作為後備方案
function calculateDistanceWithHaversine(userPos, destinations) {
    console.log('使用 Haversine 公式計算距離');
    
    const locationsWithDistance = destinations.map((station) => {
        if (!station.latLng || !station.latLng.lat || !station.latLng.lng) {
            console.warn('充電站缺少位置信息:', station.name);
            return {
                ...station,
                distance: Infinity,
                km: '距離未知',
                distance_time: '時間未知'
            };
        }
        
        // 計算直線距離
        const distanceKm = calculateDistanceHaversine(
            userPos.lat, 
            userPos.lng, 
            station.latLng.lat, 
            station.latLng.lng
        );
        
        console.log(`${station.name} 直線距離: ${distanceKm.toFixed(2)} 公里`);
        
        return {
            ...station,
            distance: distanceKm * 1000, // 轉換為公尺
            km: `${distanceKm.toFixed(1)} 公里`,
            distance_time: `約 ${Math.ceil(distanceKm * 2)} 分鐘` // 簡單估算
        };
    });
    
    // 按距離排序
    return locationsWithDistance.sort((a, b) => a.distance - b.distance);
}

export const getKms = async (userPos, destinations) => {
    console.log('開始計算距離 - 用戶位置:', userPos);
    console.log('充電站數據:', destinations);
    
    // 檢查 Google Maps API 是否可用
    if (typeof google !== 'undefined' && google.maps && google.maps.DistanceMatrixService) {
        console.log('Google Maps API 可用，使用精確路線計算');
        try {
            const result = await success(userPos, destinations);
            console.log('Google Maps API 計算成功');
            return result;
        } catch (error) {
            console.warn('Google Maps API 計算失敗，回退到 Haversine 公式:', error);
            return calculateDistanceWithHaversine(userPos, destinations);
        }
    } else {
        console.log('Google Maps API 不可用，使用 Haversine 公式');
        return calculateDistanceWithHaversine(userPos, destinations);
    }
};
