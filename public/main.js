var csTripApp = angular.module('csTripApp', []);

csTripApp.controller('CsTripCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.map = new L.amigo.map(
        'map',
        {
            center: [0, 0],
            zoom: 2,
            loadAmigoLayers: false,
            amigoLogo: 'right'
        }
    );
    $scope.route = [];
    $scope.positionMap = {};
    $scope.images = [];
    $scope.datasetData = {};
    $scope.position = -1;

    L.amigo.auth.setToken("R:Z6iIcrcXhuN6mxbvolFrBQFBP4acr7bRyqbTPf");

    $scope.map.addBaseLayer(L.amigo.AmigoGray);

    $scope.previousSlide = function () {
        if ($scope.position >= 0) {
            --$scope.position;
            if ($scope.position >= 0) {
                $scope.goToPosition();
            }
        }
    };

    $scope.nextSlide = function () {
        if ($scope.position < $scope.route.length - 1) {
            ++$scope.position;
            $scope.goToPosition();
        }
    };

    $scope.goToPosition = function () {
        var step = $scope.route[$scope.position];
        $scope.map.setView(step, 10, {
            pan: {duration: 1},
            animate: true
        });
        $scope.showPopup();
        $scope.loadPhotos();
    };

    $scope.loadPhotos = function (amigoId) {
        if (amigoId === undefined) {
            amigoId = $scope.route[$scope.position].amigo_id;
        }

        L.amigo.utils.get(
            '/related_tables/1122/entries', {source_amigo_id: amigoId})
            .then(function (r) {
                $scope.$apply(function () {
                    var url;
                    $scope.images = [];
                    for (var i in r.data) {
                        url = L.amigo.utils.parseUrl('/related_tables/1122/files/' +
                            amigoId + '/' + r.data[i].filename +
                            L.amigo.auth.getTokenParam());
                        $scope.images.push(url);
                    }
                });
            });
    };

    $scope.showPopup = function (amigoId) {
        if (amigoId === undefined) {
            amigoId = $scope.route[$scope.position].amigo_id;
        }

        var step = $scope.route[$scope.positionMap[amigoId]],
            html = '<h3>' + step.title + '<br/><small>' + step.date + '</small></h3><p>' + step.description + '</p>';

        L.popup().setLatLng(step).setContent(html).openOn($scope.map);
    };

    $scope.$watch('map.datasetLayers["CS Trip"].options.datasetData',
        function (datasetData, oldValue) {
            if (datasetData !== oldValue) {
                $scope.datasetData = datasetData;

                L.amigo.utils.get('/users/475/projects/1635/sql', {
                    query:
                    'SELECT ST_X(location) AS lng, ST_Y(location) AS lat, amigo_id, title, description, date FROM ' +
                    datasetData.table_name + ' ORDER BY "order"'
                }).then(function (r) {
                    $scope.$apply(function () {
                        $scope.route = r.data;
                        for (var i in $scope.route) {
                            $scope.positionMap[$scope.route[i].amigo_id] = i;
                        }
                    });
                });
            }
        }
    );

    $scope.map.addDatasetLayer({
        url: '/users/475/projects/1635/datasets/28987',
        popup: {
            overrideCallback: function (e) {
                if (e.data) {
                    var amigoId = e.data.amigo_id, idx;

                    $scope.$apply(function () {
                        $scope.position = $scope.positionMap[amigoId];
                    });

                    $scope.showPopup(amigoId);
                    $scope.loadPhotos(amigoId);
                }
            }
        }
    });

    $timeout(function () {
        $('.leaflet-control-layers-selector').click();
    }, 2000);
}]);
