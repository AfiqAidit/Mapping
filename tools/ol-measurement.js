(function (factory, window) {
  if (typeof define === "function" && define.amd) {
    define(["ol"], factory);
  } else if (typeof exports === "object") {
    module.exports = factory(require("ol"));
  } else if (typeof window !== "undefined" && window.ol) {
    factory(window.ol);
  }
})(function (ol) {
  class MeasureControl extends ol.control.Control {
    constructor(options) {
      const optOptions = options || {};
      const element = document.createElement("div");
      element.className = "ol-control ol-unselectable measurement";

      const button = document.createElement("a");
      button.className = "btn border-secondary";


      element.appendChild(button);

      const menu = document.createElement("div");
      menu.className = "measure-menu";
      menu.style.cssText =
        "display:none; position:absolute; ";
      element.appendChild(menu);

      button.addEventListener("click", (e) => {
        e.preventDefault();

        this._toggleMenu(menu);
        if (menu.style.display === "none") {
          this.disableDrawing();
        } else {
          this.enableDrawing();
        }
      });

      super({
        element: element,
        target: options.target,
      });
      this.button = button;
      this.label = "Measurement";
      this.button.title = "Measurement";
      this._createMeasurementSection(menu, "Distance", "LineString");
      this._createMeasurementSection(menu, "Area", "Polygon");

      this._map = null;
      this._draw = null;

      this.style = new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(240, 5, 127, 0.2)",
        }),
        stroke: new ol.style.Stroke({
          color: "rgba(240, 5, 127, 0.5)",
          lineDash: [10, 10],
          width: 2,
        }),
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
        }),
      });

      this.tipStyle = new ol.style.Style({
        text: new ol.style.Text({
          font: "12px Calibri,sans-serif",
          fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 1)",
          }),
          backgroundFill: new ol.style.Fill({
            color: "rgba(0, 0, 0, 0.4)",
          }),
          padding: [2, 2, 2, 2],
          textAlign: "left",
          offsetX: 15,
        }),
      });

      this.modifyStyle = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          fill: new ol.style.Fill({
            color: "rgba(0, 0, 0, 0.4)",
          }),
        }),
        text: new ol.style.Text({
          text: "Drag to modify",
          font: "12px Calibri,sans-serif",
          fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 1)",
          }),
          backgroundFill: new ol.style.Fill({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          padding: [2, 2, 2, 2],
          textAlign: "left",
          offsetX: 15,
        }),
      });

      this.segmentStyle = new ol.style.Style({
        text: new ol.style.Text({
          font: "12px Calibri,sans-serif",
          fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 1)",
          }),
          backgroundFill: new ol.style.Fill({
            color: "rgba(0, 0, 0, 0.4)",
          }),
          padding: [2, 2, 2, 2],
          textBaseline: "bottom",
          offsetY: -12,
        }),
        image: new ol.style.RegularShape({
          radius: 6,
          points: 3,
          angle: Math.PI,
          displacement: [0, 8],
          fill: new ol.style.Fill({
            color: "rgba(0, 0, 0, 0.4)",
          }),
        }),
      });

      this.labelStyle = new ol.style.Style({
        text: new ol.style.Text({
          font: "12px Calibri,sans-serif",
          fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 1)",
          }),
          backgroundFill: new ol.style.Fill({
            color: "rgba(0, 0, 0, 0.4)",
          }),
          padding: [2, 2, 2, 2],
          textBaseline: "bottom",
          offsetY: -15,
        }),
      });

      // Separate sources and layers for LineString and Polygon
      this._lineSource = new ol.source.Vector();
      this._polygonSource = new ol.source.Vector();

      this._modifyLine = new ol.interaction.Modify({
        source: this._lineSource, // Assuming only modifying line features
        style: this.modifyStyle,
      });

      this._modifyPolygon = new ol.interaction.Modify({
        source: this._polygonSource, // Assuming only modifying line features
        style: this.modifyStyle,
      });

      this.vectorLayer = new ol.layer.Vector({
        source: this._lineSource, // Default to line source
        style: (feature) => this.styleFunction(feature, true),
      });

      this.LineStringLayer = new ol.layer.Vector({
        source: this._lineSource,
        style: (feature) => this.styleFunction(feature, true),
      });

      this.PolygonLayer = new ol.layer.Vector({
        source: this._polygonSource,
        style: (feature) => this.styleFunction(feature, false),
      });

      // Initialize segment styles array
      this._segmentStyles = [];
    }

    enableDrawing() {
      if (this._draw) {
        this._draw.setActive(true);
      }
    }

    disableDrawing() {
      if (this._draw) {
        this._draw.setActive(false);
      }
    }

    _createMeasurementSection(menu, label, drawType) {
      // Create navbar
      const navbar = document.createElement("nav");
      navbar.className = "navbar navbar-light bg-light p-0 m-0";
      // navbar.style.cssText = `
      //   padding-right: 25px !important;
      // `;
      menu.appendChild(navbar);
      // Create container
      const container = document.createElement("div");
      container.className = "container";
      container.style.cssText = `
        font-size: 10px;
    `;
      navbar.appendChild(container);

      // Create navbar list
      const ul = document.createElement("ul");
      ul.className = "navbar-nav mr-auto align-items-center";
      container.appendChild(ul);

      // Create list item
      const li = document.createElement("li");
      li.className = "nav-item d-flex align-items-center";
      ul.appendChild(li);

      // Create label span
      const span = document.createElement("span");
      span.className = "navbar-text mr-2";
      span.textContent = label;
      li.appendChild(span);

      // Create start drawing button
      const startDrawButton = document.createElement("button");
      startDrawButton.className = "btn btn-sm mx-1";
      startDrawButton.textContent = "Draw";
      startDrawButton.style.cssText = `
        padding-right: 25px;
      `;
      startDrawButton.onclick = (e) => {
        e.preventDefault();
        this._startMeasurement(drawType);
      };
      li.appendChild(startDrawButton);

      // Create remove button
      const removeDrawButton = document.createElement("button");
      removeDrawButton.className = "btn btn-sm mx-1";
      removeDrawButton.textContent = "Remove";
      removeDrawButton.style.cssText = `
        padding-right: 38px;
      `;
      removeDrawButton.onclick = (e) => {
        e.preventDefault();
        this._removeAllMeasurements(drawType);
      };
      li.appendChild(removeDrawButton);
    }

    _removeAllMeasurements(drawType) {
      if (this._draw) {
        this._map.removeInteraction(this._draw);
      }
      // Remove features from respective source based on draw type
      if (drawType === "LineString") {
        this._lineSource.clear(); // Clear LineString features
      } else if (drawType === "Polygon") {
        this._polygonSource.clear(); // Clear Polygon features
      }
    }

    formatLength(line) {
      const length = ol.sphere.getLength(line);
      let output;
      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + " km";
      } else {
        output = Math.round(length * 100) / 100 + " m";
      }
      return output;
    }

    formatArea(polygon) {
      const area = ol.sphere.getArea(polygon);
      let output;
      if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + " km²";
      } else {
        output = Math.round(area * 100) / 100 + " m²";
      }
      return output;
    }

    styleFunction(feature, segments) {
      const styles = [this.style];
      const geometry = feature.getGeometry();
      const type = geometry.getType();
      let point, label, line;

      if (!this._draw || this._draw.getActive()) {
        if (type === "Polygon") {
          // Areas
          point = geometry.getInteriorPoint();
          label = this.formatArea(geometry);
          this.labelStyle.setGeometry(point);
          this.labelStyle.getText().setText(label);
          styles.push(this.labelStyle);

          if (segments) {
            line = new ol.geom.LineString(geometry.getCoordinates()[0]);
          }
        } else if (type === "LineString") {
          // Total length for LineString (shown at the last point)
          point = new ol.geom.Point(geometry.getLastCoordinate());
          label = this.formatLength(geometry); // Total length of the line
          let totalLengthStyle = new ol.style.Style({
            text: new ol.style.Text({
              font: "bold 14px Calibri,sans-serif", // Different style for total length
              fill: new ol.style.Fill({
                color: "rgba(255, 255, 255, 1)",
              }),
              backgroundFill: new ol.style.Fill({
                color: "rgba(0, 0, 0, 0.6)", // Darker background for total length label
              }),
              padding: [3, 3, 3, 3],
              textBaseline: "top",
              offsetY: 15,
            }),
            image: new ol.style.RegularShape({
              radius: 7,
              points: 3,
              angle: Math.PI,
              displacement: [0, -10],
              fill: new ol.style.Fill({
                color: "rgba(0, 0, 0, 0.6)", // Darker marker for total length
              }),
            }),
          });
          totalLengthStyle.setGeometry(point);
          totalLengthStyle.getText().setText(label); // Set total length label
          styles.push(totalLengthStyle); // Push total length style to styles
        }
      }

      // Adding segment styles
      if (segments && type === "LineString") {
        const coordinates = geometry.getCoordinates();
        this._segmentStyles = [];
        for (let i = 0; i < coordinates.length - 1; i++) {
          let segment = new ol.geom.LineString(coordinates.slice(i, i + 2));
          let segmentLabel = this.formatLength(segment);
          let segmentPoint = new ol.geom.Point(segment.getCoordinateAt(0.5));

          // Apply regular segment style
          let segmentStyle = new ol.style.Style({
            text: new ol.style.Text({
              font: "12px Calibri,sans-serif",
              fill: new ol.style.Fill({
                color: "rgba(255, 255, 255, 1)",
              }),
              backgroundFill: new ol.style.Fill({
                color: "rgba(0, 0, 0, 0.4)", // Regular background for segment labels
              }),
              padding: [2, 2, 2, 2],
              textBaseline: "bottom",
              offsetY: -12,
            }),
            image: new ol.style.RegularShape({
              radius: 6,
              points: 3,
              angle: Math.PI,
              displacement: [0, 8],
              fill: new ol.style.Fill({
                color: "rgba(0, 0, 0, 0.4)", // Regular marker for segments
              }),
            }),
          });

          segmentStyle.setGeometry(segmentPoint);
          segmentStyle.getText().setText(segmentLabel);
          this._segmentStyles.push(segmentStyle);
        }

        styles.push(...this._segmentStyles);
      }

      return styles;
    }

    _toggleMenu(menu) {
      const display = menu.style.display;
      menu.style.display = display === "none" ? "" : "none";

      if (menu.style.display === "none") {
        this.button.classList.remove("active");
        if (this._draw) {
          this._map.removeInteraction(this._draw);
          this._draw = null;
        }
        this._map.removeInteraction(this._modifyLine);
        this._map.removeInteraction(this._modifyPolygon);
      } else {
        this.button.classList.add("active");
        this._map.addInteraction(this._modifyLine);
        this._map.addInteraction(this._modifyPolygon);
      }
    }

    _startMeasurement(drawType) {
      if (this._draw) {
        this._map.removeInteraction(this._draw);
      }

      this._draw = new ol.interaction.Draw({
        source: drawType === "Polygon" ? this._polygonSource : this._lineSource,
        type: drawType,
        style: (feature) => this.styleFunction(feature, true),
      });

      this._draw.on("drawstart", () => {
        if (drawType === "Polygon") {
          this.vectorLayer.setSource(this._polygonSource);
          this._map.addInteraction(this._modifyPolygon);
          this._map.removeInteraction(this._modifyLine);
        } else {
          this.vectorLayer.setSource(this._lineSource);
          this._map.addInteraction(this._modifyLine);
          this._map.removeInteraction(this._modifyPolygon);
        }
      });

      this._map.addInteraction(this._draw);
    }

    setMap(map) {
      super.setMap(map);
      if (map) {
        this._map = map;
        map.addLayer(this.vectorLayer);
        map.addLayer(this.LineStringLayer);
        map.addLayer(this.PolygonLayer);
      }
    }
  }
  window.ol.MeasureControl = MeasureControl;
}, this);
