// global variabl
var map;

// Data Model
var locations = [{
        title: "King Saud University",
        location: {
            lat: 24.716241,
            lng: 46.619108
        },
        website: "http://ksu.edu.sa/en"
    },
    {
        title: "Imam Muhammad ibn Saud Islamic University",
        location: {
            lat: 24.813595,
            lng: 46.701929
        },
        website: "https://imamu.edu.sa/en"
    },
    {
        title: "Princess Nora bint Abdul Rahman University",
        location: {
            lat: 24.846461,
            lng: 46.724731
        },
        website: "http://pnu.edu.sa/en"
    },
    {
        title: "Riyadh College of Technology",
        location: {
            lat: 24.733313,
            lng: 46.704871
        },
        website: "http://www.rct.edu.sa/"
    },
    {
        title: "Alfaisal University",
        location: {
            lat: 24.664302,
            lng: 46.675966
        },
        website: "http://www.alfaisal.edu/"
    },
    {
        title: "King Saud bin Abdulaziz University for Health Sciences",
        location: {
            lat: 24.754502,
            lng: 46.853317
        },
        website: "http://conj.ksau-hs.edu.sa"
    },
    {
        title: "Prince Sultan University",
        location: {
            lat: 24.734742,
            lng: 46.697575
        },
        website: "http://www.psu.edu.sa/en"
    },
    {
        title: "Dar Al Uloom University",
        location: {
            lat: 24.795804,
            lng: 46.711291
        },
        website: "http://dau.edu.sa/en/"
    },
    {
        title: "Al Yamamah University",
        location: {
            lat: 24.862597,
            lng: 46.591840
        },
        website: "http://yu.edu.sa/"
    },
    {
        title: "Saudi Electronic University",
        location: {
            lat: 24.793859,
            lng: 46.676259
        },
        website: "https://www.seu.edu.sa/sites/en"
    }
];

// the three main properties
var Location = function(data) {
    this.title = data.title;
    this.location = data.location;
    this.website = data.website;
};

//this function will initilize the map
function initMap() {
    // Map Styling
    var styles = [{
        featureType: "all",
        stylers: [{
                hue: "#02b3e4"
            },
            {
                saturation: -80
            }
        ]
    }, {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{
                hue: "#00ffee"
            },
            {
                saturation: 50
            }
        ]
    }, {
        featureType: "poi.business",
        elementType: "labels",
        stylers: [{
            visibility: "off"
        }]
    }];
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 24.774265,
            lng: 46.738586
        },
        zoom: 11,
        styles: styles,
        mapTypeControl: false
    });
}

//ModelView
var mapViewModel = function() {
    var self = this;
    this.locationList = ko.observableArray([]);
    this.filter = ko.observable();
    this.showClass = ko.observable('hamburger-menue');

    locations.forEach(function(loc) {
        self.locationList.push(new Location(loc));
    });

    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    self.locationList().forEach(function(location) {
        // Sets the markers on the map
        var marker = new google.maps.Marker({
            map: map,
            position: location.location,
            title: location.title,
            website: location.website,
            animation: google.maps.Animation.DROP
        });

        location.marker = marker;
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');

        // onclick event to open infoWindow
        location.marker.addListener('click', function() {
            markerWindow(this, infowindow);
            toggleBounce(this);
        });

        bounds.extend(location.marker.position);

    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);
    });

    this.filteredLocations = ko.computed(function() {
        var filter = self.filter();
        if (!self.filter()) {
            self.locationList().forEach(
                function(location) {
                    location.marker.setMap(map);
                });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(),
                function(loc) {
                    if (loc.title.toLowerCase().indexOf(
                            filter.toLowerCase()) !== -1) {
                        loc.marker.setMap(map);
                    } else {
                        loc.marker.setMap(null);
                    }
                    return loc.title.toLowerCase()
                        .indexOf(filter.toLowerCase()) !==
                        -1;
                });
        }
    }, self);

    // animate marker
    function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            for (var i = 0; i < self.locationList().length; i++) {
                var mark = self.locationList()[i].marker;
                if (mark.getAnimation() !== null) {
                    mark.setAnimation(null);
                }
            }
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

    this.currentLocation = ko.observable(this.locationList()[0]);

    this.setLocation = function(clickedLocation) {
        toggleBounce(clickedLocation.marker);
        markerWindow(clickedLocation.marker, infowindow);
        self.currentLocation(clickedLocation);
    };

    // hamburger menu
    toggleHamburger = function() {
        if (self.showClass() == 'hamburger-menue') {
            self.showClass('hamburger-menue show');
        } else {
            self.showClass('hamburger-menue');
        }
    };

};

function markerWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;

        // wikipedia ajax 
        var wikiUrl =
            'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
            marker.title +
            '&format=json&callback=wikiCallback';

        // wikipedia err handling
        var wikiRequestTimeout = setTimeout(
            function() {
                infowindow.setContent(
                    '<p class="info-text">failed to get wikipedia resources</p>'
                );
            }, 8000);

        // json P method
		$.ajax({
			url: wikiUrl,
			dataType: 'jsonp'
		}).done(function(response) {
			var articleList = response[1];
                for (var i = 0; i < articleList.length; i++) {
                    var articleStr = articleList[i];
                    var url =
                        'https://www.wikipedia.org/wiki/' +
                        articleStr;
                    infowindow.setContent('<div class="info-text "><h4>' +
                        marker.title +
                        '</h4><p class="info-text">Website: <a href="' +
                        marker.website + '" target="_blank"> Click here </a></p></div>' +
                        '</h4><p class="info-text">Wiki Info: <a href="' +
                        url + '" target="_blank"> Click here </a></p></div>');
                }

			clearTimeout(wikiRequestTimeout); // because if it success we need to clear timeout err message
		});

        infowindow.open(map, marker);

        infowindow.addListener('closeclick', function() {
            infowindow.close();
            marker.setAnimation(null);
        });
    }
}

// Fallback for Google Maps Api
function mapError() {
    console.log('Error: Google maps API has not loaded');
    alert('There was an error occured with the Google Maps. Please try again later.');
}

window.onload = function() {
    var viewModel = new mapViewModel();
    ko.applyBindings(viewModel);
};