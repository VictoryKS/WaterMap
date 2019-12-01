const LAT = 50.4500336;
const LNG = 30.5241361; // kyiv center
const ZOOM = 10;
const SIZE = 48; // size of icons

let dprocessing, mprocessing;

$(function() {
  mprocessing = new MapProcessing();
  dprocessing = new DataProcessing();
  dprocessing.getData();
  mprocessing.makeLayer(0, dprocessing.waterData);
  mprocessing.filter(0);
});

// Data Processing

function DataProcessing() {
  this.waterData;
}

DataProcessing.prototype.filterData = function(type) {
  if (type == 0)
    return this.waterData.features;

  let data = [];

  for (let item of this.waterData.features) {
    let point = item.properties;
    if (point.type == type) {
    let d = {
      "type": "Feature",
      "properties": point,
      "geometry": {
        "type": "Point",
        "coordinates": [point.lon, point.lat]}
      };
      data.push(d);
    }
  }
  return data;
}

DataProcessing.prototype.getData = function() {
  jQuery.ajax({
    url: 'https://ecomapgen.pythonanywhere.com',
    crossdomain: true,
    cache: true,
    dataType: 'text',
    async: false,
    success: function(response) {
        if (response) {
          dprocessing.waterData = JSON.parse(response);
        }
      }
  });
}

// Map Processing

function MapProcessing() {
  this.map = L.map('map').setView([LAT, LNG], ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  L.control.locate({ watch: true, icon: 'fa fa-map-marker filterIcon' }).addTo(this.map);

  const CafesIcon = L.Icon.extend({ options: { iconUrl: './style/images/cafes.svg',
    iconSize: [SIZE, SIZE], iconAnchor: [SIZE / 2, SIZE / 2], popupAnchor: [0, -SIZE / 2], shadowSize: [0,0]}});
  const AutomatesIcon = L.Icon.extend({ options: { iconUrl: './style/images/automates.svg',
    iconSize: [SIZE, SIZE], iconAnchor: [SIZE / 2, SIZE / 2], popupAnchor: [0, -SIZE / 2], shadowSize: [0,0]}});

  this.icons = { 1: new AutomatesIcon(), 2: new CafesIcon() };
  this.waterLayers = [];
}

MapProcessing.prototype.onEachWaterFeature = function(feature, layer) {
  const props = feature.properties;
  let str = '<p class="caption">' + props.name +'</p>';
  str += '<p class="cafe">' + (props.type == 1 ? 'Автомат з водою' : 'Заклад') +'</p>';
  str += '<p class="price">' + (props.price ? props.price + ' грн/л' : 'Безкоштовно') +'</p>';

  if (props.note)
    str += '<tr><td><b>' + props.note +'</b></td></tr>';

  if (props.images) {
    str += '<p>';
    for (let item of props.images) {
      str += '<img class="cafe" src="./style/images/' + item +'">';
    }
    str += '</p>';
  }

  layer.bindPopup(str);

  const icon = mprocessing.icons[props.type];
  layer.setIcon(icon);
}

MapProcessing.prototype.makeLayer = function(type, data) {
  if (!this.waterLayers[type]) {
    this.waterLayers[type] = L.geoJson( data, { onEachFeature: this.onEachWaterFeature});
  }
}

MapProcessing.prototype.filter = function(type) {
  for (let i = 0; i < 3; i++) {
    if (i == type) {
      if (this.waterLayers[i]) {
        this.waterLayers[i].addTo(this.map);
        this.map.fitBounds(this.waterLayers[i].getBounds());
      }
    } else {
      if (this.waterLayers[i] && this.map.hasLayer(this.waterLayers[i]))
        this.map.removeLayer(this.waterLayers[i]);
    }
  }
}

// global functions

function filter(type) {
  for (let i = 0; i < 3; i++) {
    if (i == type) {
      $('#tab' + i).addClass("active");
      mprocessing.makeLayer(type, dprocessing.filterData(type));
    } else {
      $('#tab' + i).removeClass("active");
    }
  }
  mprocessing.filter(type);
}

function showNavigator() {
  if(!$("#navigator").is(":visible")) {
    $("#navigator").show();
  } else {
    $("#navigator").hide();
  }
}
