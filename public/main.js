TOKEN = "R:Z6iIcrcXhuN6mxbvolFrBQFBP4acr7bRyqbTPf";
L.amigo.auth.setToken(TOKEN);

var map = new L.amigo.map(
    'map',
    {
        center: [0, 0],
        zoom: 2,
        loadAmigoLayers: false,
        amigoLogo: 'right'
    }
);

map.addBaseLayer(L.amigo.AmigoGray);

map.addDatasetLayer({
    url: 'https://www.amigocloud.com/api/v1/users/475/projects/1635/datasets/28987',
    popup: {
        popupTitle: 'description',
        className: 'amigo-popup',
        displayFields: ['description', 'date'],
        additionalCallback: function (e, map) {
            if (e.data) {
                L.amigo.utils.get(
                    'https://www.amigocloud.com/api/v1/related_tables/1122/entries',
                    {source_amigo_id: e.data.amigo_id})
                    .then(function (r) {
                        var html = '', url;
                        for (var i in r.data) {
                            url = 'https://www.amigocloud.com/api/v1/related_tables/1122/files/' +
                                e.data.amigo_id + '/' + r.data[i].filename + '?token=' + TOKEN;
                            html += '<img class="img-responsive img-thumbnail" src="' + url + '"/>'
                        }
                        $('#photos').html(html);
                    });
            }
        }
    }
});