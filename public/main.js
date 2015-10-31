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

    L.amigo.utils.get('/users/475/projects/1635/sql', {
        query: 'SELECT ST_X(location) AS lng, ST_Y(location) AS lat, amigo_id FROM dataset_28987 ORDER BY "order"'
    }).then(function (r) {
        $scope.route = r.data;
        for (var i in $scope.route) {
            $scope.positionMap[$scope.route[i].amigo_id] = i;
        }
    });

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
        $scope.map.setView(step, 8, {
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
            sql = "SELECT title, description FROM " + $scope.datasetData.table_name +
                " WHERE amigo_id='" + amigoId + "'";
        L.amigo.utils.get('/users/475/projects/1635/sql', {query: sql})
            .then(function (r) {
                if (r.data.length > 0) {
                    var data = r.data[0],
                        html = '<h3>' + data.title + '</h3><p>' + data.description + '</p>';
                    L.popup().setLatLng(step).setContent(html).openOn($scope.map);
                }
            })
    };

    $scope.$watch('map.datasetLayers["CS Trip"].options.datasetData',
        function (datasetData, oldValue) {
            if (datasetData !== oldValue) {
                $scope.datasetData = datasetData;
                if (!$scope.map.utfGrids) {
                    $scope.map.utfGrids = {};
                }

                $scope.map.utfGrids[datasetData.name] = L.utfGrid(
                    datasetData.tiles + '/{z}/{x}/{y}.json' + L.amigo.auth.getTokenParam(),
                    {
                        useJsonP: false,
                        datasetData: datasetData
                    }
                ).on('click', function (e) {
                        if (e.data) {
                            var amigoId = e.data.amigo_id, idx;

                            $scope.showPopup(amigoId);
                            $scope.loadPhotos(amigoId);
                            $scope.$apply(function () {
                                $scope.position = $scope.positionMap[amigoId];
                            });
                        }
                    }
                );

                $scope.map.addLayer($scope.map.utfGrids[datasetData.name]);
            }
        }
    );

    $scope.map.addDatasetLayer({
        url: '/users/475/projects/1635/datasets/28987'
    });

    $timeout(function () {
        $('.leaflet-control-layers-selector').click();
    }, 2000);
}]);
