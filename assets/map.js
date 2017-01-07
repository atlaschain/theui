var map;
function initMap() {

  /******************** init map ******************************/
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    scrollwheel: false,
    center: {lat: 25.146204, lng: 55.217527},
    styles: [
      {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#263c3f'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#6b9a76'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}]
      }
    ]
  });
/******************** end init map ******************************/

/*******  set style ********/
  map.data.setStyle({
    fillColor: 'white',
    strokeWeight: 1
  }); 
/****** end set style *****/


/******** set circle for random generation ****************/
  var circle = new google.maps.Circle({
    strokeWeight: 0,
    fillOpacity: 0,
    map: map,
    center:{lat: 24.935298, lng: 55.591337},
    radius: 50000
  });
/*********** end set circle ********************************/


/******** Random geojson ****************/

var category = [
  "Department of Economic Development",
  "Dubai Chamber",
  "Dubai Customs",
  "Dubai Smart Department",
  "Dubai Municipality",
  "Financial Audit Department",
  "Land Department",
  "Awqaf and Minors Affairs Foundation",
  "Dubai Government Workshop",
  "Dubai Police",
  "Dubai Health Authority",
  "Roads and Transport Authority"
];

var name = [
  "Lorem Ipsum is simply",
  "Dummy text of the printing",
  "Ypesetting industry",
  "Tandard dummy text",
  "Ever since the 1500s",
  "When an unknown printer",
  "Scrambled it to make"
  ];

var icon = [
 "bank.png",
 "hospital.png",
 "internet.png",
 "restaurant.png",
 "works.png"
];

var counter = 0;

var looper = window.setInterval(function() {
  counter++;
  var bounds = circle.getBounds();
  map.fitBounds(bounds);
  var sw = bounds.getSouthWest();
  var ne = bounds.getNorthEast();
  var ptLat = Math.random() * (ne.lat() - sw.lat()) + sw.lat();
  var ptLng = Math.random() * (ne.lng() - sw.lng()) + sw.lng();
  var iconData = icon[Math.floor(Math.random() * icon.length)];

  var geoJsonData = GeoJSON.parse({
    Name: name[Math.floor(Math.random() * name.length)], 
    Department: category[Math.floor(Math.random() * category.length)], 
    icon: "assets/"+iconData,
    lat: ptLat, 
    lng: ptLng
  }, 
  {Point: ['lat', 'lng'], include: ['Name','icon','lat', 'lng']});

 map.data.addGeoJson(geoJsonData);
 if (counter >= 15)
  {
      clearInterval(looper);
  }

}, Math.random() * (10000 - 3000) + 3000);

/*********** end Random geojson ********************************/

/********** Info Window ***********************/
  var infowindow = new google.maps.InfoWindow();

  map.data.addListener('click', function(event) {

    var myHTML = "";
    event.feature.forEachProperty(function(value,property) {
      if (property != "icon")
        myHTML += property + ': ' + value + "<br>";
    });

    infowindow.setContent("<div style='width:150px; text-align: center;'>"+myHTML+"</div>");
        infowindow.setPosition(event.feature.getGeometry().get());
    infowindow.setOptions({pixelOffset: new google.maps.Size(0,-30)});
        infowindow.open(map);
  }); 
/********** End Info Window *******************/
}

