const stateCoordinates = {
    "01": ol.proj.fromLonLat([103.7634, 1.4927]), // Johor
    "02": ol.proj.fromLonLat([100.3689, 5.3557]), // Kedah
    "03": ol.proj.fromLonLat([102.2386, 6.1254]), // Kelantan
    "04": ol.proj.fromLonLat([102.2519, 2.1896]), // Melaka
    "05": ol.proj.fromLonLat([102.2414, 2.7258]), // Negeri Sembilan
    "06": ol.proj.fromLonLat([103.3258, 3.8168]), // Pahang
    "07": ol.proj.fromLonLat([100.3324, 5.4141]), // Penang
    "08": ol.proj.fromLonLat([101.0901, 4.5975]), // Perak
    "09": ol.proj.fromLonLat([100.3018, 6.4414]), // Perlis
    "10": ol.proj.fromLonLat([101.5184, 3.0319]), // Selangor
    "11": ol.proj.fromLonLat([103.1408, 5.3117]), // Terengganu
    "12": ol.proj.fromLonLat([116.0769, 5.9804]), // Sabah
    "13": ol.proj.fromLonLat([110.3429, 1.5495]), // Sarawak
    "14": ol.proj.fromLonLat([101.6869, 3.1390]), // Kuala Lumpur
    "15": ol.proj.fromLonLat([115.2413, 5.3004]), // Labuan
    "16": ol.proj.fromLonLat([101.6974, 2.9353])  // Putrajaya
};

function getZoomCoordinates(kodNegeri) {
    return stateCoordinates[kodNegeri] || ol.proj.fromLonLat([107.200, 2.660]); // Default to Malaysia center
}