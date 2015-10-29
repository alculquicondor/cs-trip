L.amigo.auth.setToken("R:AJYcFuYfi2KJOCaYmLN3uNKvkzceCturgM4EWz");

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
        displayFields: ['date']
    }
});