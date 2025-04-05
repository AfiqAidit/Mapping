class ZoomExtent extends ol.control.Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    const button = document.createElement("a");
    button.className = "btn border-secondary";
    const element = document.createElement("div");
    element.className = "zoom-extent ol-unselectable ol-control";
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });
    button.title = "Zoom to extent";
    button.addEventListener("click", this.setMapView.bind(this), false);
  }

  setMapView(e) {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const kodNegeri = urlParams.get("KodNegeri");

    let targetCoordinates;
    targetCoordinates = getZoomCoordinates(kodNegeri); // Use the function from zoomLocation.js

    const zoomLevel = kodNegeri ? 10 : 7;

    const viewSetting = new ol.View({
      center: targetCoordinates,
      zoom: zoomLevel,
    });

    this.getMap().setView(viewSetting);
  }
}
