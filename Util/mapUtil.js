class MapUtil {
  static map;
  static baseLayers = {
    osm: new ol.layer.Tile({
      title: "OpenStreetMap",
      type: "base",
      visible: false,
      source: new ol.source.OSM({
        crossOrigin: "anonymous",
        maxZoom: 20,
      }),
    }),
    streets: new ol.layer.Tile({
      title: "Google Streets",
      type: "base",
      visible: false,
      source: new ol.source.XYZ({
        url: "https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        maxZoom: 20,
        crossOrigin: "anonymous",
      }),
    }),
    satellite: new ol.layer.Tile({
      title: "Satellite",
      type: "base",
      visible: false,
      source: new ol.source.XYZ({
        url: "https://mt{0-3}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        maxZoom: 20,
        crossOrigin: "anonymous",
      }),
    }),
    terrain: new ol.layer.Tile({
      title: "Terrain",
      type: "base",
      visible: false,
      source: new ol.source.XYZ({
        url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
        maxZoom: 20,
        crossOrigin: "anonymous",
      }),
    }),
    hybrid: new ol.layer.Tile({
      title: "Hybrid Satellite",
      type: "base",
      visible: true,
      source: new ol.source.XYZ({
        url: "https://mt{0-3}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        maxZoom: 20,
        crossOrigin: "anonymous",
      }),
    }),
    blank: new ol.layer.Tile({
      title: "Blank",
      type: "base",
      visible: false,
      source: new ol.source.XYZ({
        url: "",
        maxZoom: 20,
      }),
    }),
  };

  static initMap() {
    const urlParams = new URLSearchParams(window.location.searcha);
    const kodNegeri = urlParams.get("KodNegeri");

    const targetCoordinates = getZoomCoordinates(kodNegeri);
    let zoomLevel = 7;
    if (kodNegeri) {
      zoomLevel = 10;
      if (kodNegeri == "00") {
        zoomLevel = 6;
      }
    }

    const scaleLine = new ol.control.ScaleLine({
      units: "metric",
    });

    const mousePositionControl = new ol.control.MousePosition({
      coordinateFormat: this.customCoordinateFormat,
      projection: "EPSG:4326",
      className: "custom-mouse-position",
      target: document.getElementById("mouse-position"),
    });

    const layers = Object.values(this.baseLayers).reverse();

    this.map = new ol.Map({
      target: "map",
      layers: layers,
      view: new ol.View({
        center: targetCoordinates,
        zoom: zoomLevel,
      }),
      controls: new ol.Collection([
        new ol.control.Zoom(),
        new ol.control.Attribution(),
        scaleLine,
        mousePositionControl,
      ]),
    });

    let measureControl = new ol.MeasureControl({
      title: "Measurement",
      color: "#FF0080",
    });

    let zoomExtent = new ZoomExtent();

    let geocoder = new Geocoder("nominatim", {
      provider: "osm",
      targetType: "glass-button",
      lang: "en",
      placeholder: "Search for address...",
      limit: 5,
      keepOpen: true,
      countrycodes: "MY",
    });
    this.map.addControl(geocoder);
    this.map.addControl(zoomExtent);
    this.map.addControl(measureControl);

    this.initLayerSwitcher();
  }

  static initLayerSwitcher() {
    const layerSwitcherDiv = document.getElementById("layer-switcher");

    Object.entries(this.baseLayers).forEach(([key, layer]) => {
      const div = document.createElement("div");

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "baseLayer";
      input.id = key;
      input.checked = layer.getVisible();
      input.onclick = () => this.switchBaseLayer(key);

      const label = document.createElement("label");
      label.htmlFor = key;
      label.textContent = layer.get("title");

      div.appendChild(input);
      div.appendChild(label);
      layerSwitcherDiv.appendChild(div);
    });
  }

  static switchBaseLayer(selectedKey) {
    Object.entries(this.baseLayers).forEach(([key, layer]) => {
      layer.setVisible(key === selectedKey);
    });
  }

  static customCoordinateFormat(coordinate) {
    const fractionDigits = 3;
    return (
      "Long: " +
      coordinate[0].toFixed(fractionDigits) +
      " : Lat: " +
      coordinate[1].toFixed(fractionDigits)
    );
  }
}
