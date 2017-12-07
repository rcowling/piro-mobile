// create layer selector
function createSelector(layer) {
    var sql = new cartodb.SQL({ user: 'bobcowling' });
    var $options = $('#layer_selector li');
    $options.click(function(e) {
      // get the area of the selected layer
      var $li = $(e.target);
      var selected = $li.attr('data');
      // deselect all and select the clicked one
      $options.removeClass('selected');
      $li.addClass('selected');
      // create query based on data from the table
      var query = "select * from piro_pois";           
      if(selected == 'rest') {
          query = "select * from piro_pois where restrooms = 'Yes' ";          
      } else if(selected == 'dogs') {
          query = "select * from piro_pois where dogs_allowed = 'Yes' ";           
      } else if(selected == 'handicapped') {
          query = "select * from piro_pois where handicapped_accessible = 'Yes' ";          
      } else if(selected == 'picnic') {
          query = "select * from piro_pois where picnic_area = 'Yes' ";
      } else if(selected == 'beaches') {
          query = "select * from piro_pois where type = 'Beach' ";
      } 
        
      // change the query in the layer to update the map
      layer.setQuery(query);      
    });
}

// Create the map and center it on PIRO
var map = new L.Map('map', {
    center: [46.5444394,-86.3288595],
    zoom: 11,  
  });  
map.zoomControl.setPosition('bottomright')

// Add a tileset from Mapbox
var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/rcowling/cj99y3ev02w1o2rpnvhh1zcsd/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicmNvd2xpbmciLCJhIjoiY2lzZ2YwcjZtMDFwdzNvcnQ3bmR3NXFhcCJ9.TI01a_YqNaqKWigFu70x7w', {
    attribution: 'Stamen'
  }).addTo(map);

// Build CartoCSS styles for the layers
// Style for the PIRO Zones
var zonestyle = "#layer { " +
  "polygon-fill: ramp([cartodb_id], (#e7f2d4, #b6dbae), quantiles); " +
  "polygon-opacity: 0.7;"+      
"}" +
"#layer::outline  { "+
  "line-width: 1;" +
  "line-color: #2d9d7a;"+
  "line-opacity: 0.5;"+
"}"

// Style for the Scenic Sites
var scenicstyle = "#layer { " +
  "marker-width: 25;" +
  "marker-fill: black;" +
  "marker-fill-opacity: 1;" +
  "marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/maki-icons/camera-18.svg');" +
  "marker-allow-overlap: true;" +
  "marker-line-width: 0.7;" +
  "marker-line-color: #FFFFFF;" +
  "marker-line-opacity: 1;" +
"}"

// Style for the campgrounds
var campstyle = "#layer { " +
  "marker-width: 25;" +
  "marker-fill: green;" +
  "marker-fill-opacity: 1;" +
  "marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/maki-icons/triangle-18.svg');" +
  "marker-allow-overlap: true;" +
  "marker-line-width: .7;" +
  "marker-line-color: #FFFFFF;" +
  "marker-line-opacity: 1;" +
"}"

// Style for the visitor centers
var visstyle = "#layer { " +
  "marker-width: 25;" +
  "marker-fill: #eeff00;" +
  "marker-fill-opacity: 1;" +
  "marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/maki-icons/building-18.svg');" +
  "marker-allow-overlap: true;" +
  "marker-line-width: 1;" +
  "marker-line-color: #000000;" +
  "marker-line-opacity: 1;" +
"}"

// Style for the user data
var userstyle = "#layer { " +
  "marker-width: 25;" +
  "marker-fill: red;" +
  "marker-fill-opacity: 1;" +
  "marker-file: url('https://s3.amazonaws.com/com.cartodb.users-assets.production/maki-icons/post-18.svg');" +
  "marker-allow-overlap: true;" +
  "marker-line-width: .7;" +
  "marker-line-color: #FFFFFF;" +
  "marker-line-opacity: 1;" +
"}"

// Add the Beaver Basin Wilderness layer to the map
var basin = cartodb.createLayer(map, {
  user_name: 'bobcowling',
  type: 'cartodb',
  sublayers: [{
    sql: "SELECT * FROM test",
    cartocss: '#test{polygon-fill: #FFEACB; polygon-opacity: 0.7;}'
  }]
}).on("done",function(lyr){
    basin = lyr; 
    cartodb.vis.Vis.addInfowindow(map, lyr.getSubLayer(0), ['name']);
    lyr.setZIndex(1);
  })
  
// Add the Zones layer to the map
var ibz = cartodb.createLayer(map, {
  user_name: 'bobcowling',
  type: 'cartodb',
  sublayers: [{
    sql: "SELECT * FROM pirozones2",
    cartocss: zonestyle
  }]
}).on("done",function(lyr){
    ibz = lyr;    
     cartodb.vis.Vis.addInfowindow(map, lyr.getSubLayer(0), ['name', 'ownership']);
   //ibz.addTo(map);
    lyr.setZIndex(0);
  })  

// Add the Trails layer to the map
var trails = cartodb.createLayer(map, {
  user_name: 'bobcowling',
  type: 'cartodb',
  sublayers: [{
    sql: "SELECT * FROM piro_trails",
    cartocss: '#piro_trails{line-color: #D2691E;line-width: 2;}'
  }]
}).on("done",function(lyr){
    trails = lyr; 
    cartodb.vis.Vis.addInfowindow(map, lyr.getSubLayer(0), ['trail_name']);
    trails.addTo(map);
  })  

// Add the Scenic Sites Layer to the map
var scenic_sites = cartodb.createLayer(map, {
  user_name: 'bobcowling',
  type: 'cartodb',
  sublayers: [{
    sql: "SELECT * FROM piro_pois",
    cartocss: scenicstyle
  }]
}).on("done",function(lyr){
scenic_sites = lyr;    
// get selector
var selector = $(".js-city-selector");

// get styles & query
style = $("#style").text(),
query = "select * from piro_pois";

// populate selector with feature names from sublayer data
var sql = new cartodb.SQL({ user: 'bobcowling' });
sql.execute(query)
.done(function(data) {
  for (var i = 0; i < data.total_rows; i++) {

    var name = data.rows[i].name;      

    selector.append('<option value="' + name + '">' + name + '</option>');
    console.log(name);
  }
});

selector.select2();

// filter features when selecting an option from selector
selector.change(function(){

var input = $(".js-city-selector option:selected").val(); 
    
if(input == '#') {
    lyr.setQuery('select * from piro_pois');
} else {   
var sql = new cartodb.SQL({ user: 'bobcowling' });
console.log(input);    
lyr.setQuery("SELECT * FROM piro_pois where name Ilike '" + input + 
"'");    
sql.getBounds("SELECT * FROM piro_pois where name Ilike '" + input + 
"'").done(function(bounds) {
 console.log("im here"  );
 map.fitBounds(bounds)
 map.setZoom(16);
 });
}
});
    
    cartodb.vis.Vis.addInfowindow(map, lyr.getSubLayer(0), ['name','image_url', 'type'], // add an infowindow with a custom html template
                                 { 
             infowindowTemplate: $('#iw_template').html()
          })
    createSelector(lyr);
    scenic_sites.addTo(map);    
  })   

// Add the Campgrounds layer to the map
var campgrounds = cartodb.createLayer(map, {
  user_name: 'bobcowling',
  type: 'cartodb',
  sublayers: [{
    sql: "SELECT * FROM piro_campgrounds",
    cartocss: campstyle
  }]
}).on("done",function(lyr){
    campgrounds = lyr;  
    cartodb.vis.Vis.addInfowindow(map, lyr.getSubLayer(0), ['name']);
    campgrounds.addTo(map);
  })  

// Add the Vistior Centers layer to the map
var visCenters = cartodb.createLayer(map, {
  user_name: 'bobcowling',
  type: 'cartodb',
  sublayers: [{
    sql: "SELECT * FROM piro_centers",
    cartocss: visstyle
  }]
}).on("done",function(lyr){    
    visCenters = lyr;
    cartodb.vis.Vis.addInfowindow(map, lyr.getSubLayer(0), ['name']);
    visCenters.addTo(map);    
    // Create a new layer control and add it to the map      
    L.control.layers(null, {'Zones': ibz, 'Beaver Basin': basin, 'Trails': trails, 'Campgrounds': campgrounds, 'Visitor Centers': visCenters, 'Scenic Sites': scenic_sites }).addTo(map);    
  })        

// Add abutton to get the users location and display it on the map
L.control.locate({icon: 'fa fa-location-arrow', position: 'bottomright'}).addTo(map);

// Add button to allow the user to return to the default map extent
L.easyButton({
    position: 'bottomright',
    states: [{
    icon: 'fa-home',
    onClick: function(btn, map) {
        map.setView([46.5444394,-86.3288595],11);
  }
    }]
}).addTo(map);

// Add a button to toggle the sidebar
L.easyButton({
    position: 'bottomright',
    states: [{
    icon: 'fa-bars',
    onClick: function(btn, map) {
        $("#wrapper").toggleClass("toggled");    
  }
    }]
}).addTo(map);

// *********Let the users add their own data **************************** //

// Add Data from CARTO using the SQL API
// Declare Variables
// Create Global Variable to hold CARTO points
var cartoDBPoints = null;

// Set your CARTO Username
var cartoDBusername = 'bobcowling';

// Write SQL Selection Query to be Used on CARTO Table
// Name of table is 'data_collector'
var sqlQuery = "SELECT * FROM data_collector";

// Get CARTO selection as GeoJSON and Add to Map
/*function getGeoJSON(){
  $.getJSON("https://"+cartoDBusername+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlQuery, function(data) {
    cartoDBPoints = L.geoJson(data,{
      pointToLayer: function(feature,latlng){
        var marker = L.circleMarker(latlng);
        marker.bindPopup('' + feature.properties.description + 'Submitted by ' + feature.properties.name + '');
        return marker;
      }
    }).addTo(map);
  });
};*/

function getGeoJSON(){
    cartoDBPoints = cartodb.createLayer(map, {
  user_name: 'bobcowling',
  type: 'cartodb',
  sublayers: [{
    sql: "SELECT * FROM data_collector",
    cartocss: userstyle
  }]
}).on("done",function(lyr){
    cartoDBPoints = lyr;  
    cartodb.vis.Vis.addInfowindow(map, lyr.getSubLayer(0), ['name', 'description']);
    lyr.setZIndex(100000000000);    
    cartoDBPoints.addTo(map);
  })      
}

// Run showAll function automatically when document loads
$( document ).ready(function() {
  getGeoJSON();
});

// Create Leaflet Draw Control for the draw tools and toolbox
var drawControl = new L.Control.Draw({
    position: 'bottomright',
    draw : {      
    polygon : false,
    polyline : false,
    rectangle : false,
    circle : false
  },
  edit : false,
  remove: false
});

// Boolean global variable used to control visiblity
var controlOnMap = false;

// Create variable for Leaflet.draw features
var drawnItems = new L.FeatureGroup();

// Function to add the draw control to the map to start editing
function startEdits(){
  if(controlOnMap == true){
    map.removeControl(drawControl);
    controlOnMap = false;
  }
  map.addControl(drawControl);
  controlOnMap = true;
    

};

// Function to remove the draw control from the map
function stopEdits(){
  map.removeControl(drawControl);
  controlOnMap = false;
};

// Function to run when feature is drawn on map
map.on('draw:created', function (e) {
  var layer = e.layer;
  drawnItems.addLayer(layer);
  map.addLayer(drawnItems);
  dialog.dialog("open");
});

// Use the jQuery UI dialog to create a dialog and set options
var dialog = $("#dialog").dialog({
  autoOpen: false,
  height: 300,
  width: 350,
  modal: true,
  position: {
    my: "center center",
    at: "center center",
    of: "#map"
  },
  buttons: {
    "Add to Database": setData,
    Cancel: function() {
      dialog.dialog("close");
      map.removeLayer(drawnItems);
    }
  },
  close: function() {
    form[ 0 ].reset();
    console.log("Dialog closed");
  }
});

// Stops default form submission and ensures that setData or the cancel function run
var form = dialog.find("form").on("submit", function(event) {
  event.preventDefault();
});

function setData() {
    var enteredUsername = username.value;
    var enteredDescription = description.value;
    drawnItems.eachLayer(function (layer) {
        var sql = "INSERT INTO data_collector (the_geom, description, name, latitude, longitude) VALUES (ST_SetSRID(ST_GeomFromGeoJSON('";
        var a = layer.getLatLng();
        var sql2 ='{"type":"Point","coordinates":[' + a.lng + "," + a.lat + "]}'),4326),'" + enteredDescription + "','" + enteredUsername + "','" + a.lat + "','" + a.lng +"')";
        var pURL = sql+sql2;
        submitToProxy(pURL);
        console.log("Feature has been submitted to the Proxy");
    });
    map.removeLayer(drawnItems);
    drawnItems = new L.FeatureGroup();
    console.log("drawnItems has been cleared");
    dialog.dialog("close");
};

 // Submit data to the PHP using a jQuery Post method
var submitToProxy = function(q){
  $.post("php/callProxy.php", { // <--- Enter the path to your callProxy.php file here
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  }, function(data) {
    console.log(data);
    refreshLayer();
  });
};

// refresh the layers to show the updated dataset
function refreshLayer() {
  if (map.hasLayer(cartoDBPoints)) {
    map.removeLayer(cartoDBPoints);
  };
  getGeoJSON();
};
 
