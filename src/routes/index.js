var express = require('express');
var axios = require('axios');
var moment = require('moment');
var timezone = require('moment-timezone');
var router = express.Router();

let fromWithTimezone = moment('2019-10-18T13:34:01.862Z').tz("America/Sao_Paulo");
let untilWithTimezone = moment('2019-10-22T01:43:32.317Z').tz("America/Sao_Paulo");
let request = {
  'capabilities': ['location_monitoring'],
  'start_date': fromWithTimezone.toDate(),
  'end_date': untilWithTimezone.toDate()
};

var markers =  [
  {
    "name": "Canada",
    "url": "https://en.wikipedia.org/wiki/Canada",
    "lat": -28.232780,
    "lng": -52.381092
  },
  {
    "name": "Anguilla",
    "url": "https://en.wikipedia.org/wiki/Anguilla",
    "lat": 18.220554,
    "lng": -63.068615
  },
  {
    "name": "Japan",
    "url": "https://en.wikipedia.org/wiki/Japan",
    "lat": 36.204824,
    "lng": 138.252924
  }
]

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express powered by Plesk', page:'Home', markers: markers});
});

router.get('/teste', function(req, res, next) {
  res.render('teste', { title: 'Express powered by Plesk', page:'Home', markers: markers});
});

// fetchOrganization
function getSomeData(params) {
  request.start_date = params.dateFrom;
  request.end_date = params.dateUntil;
  console.log(JSON.stringify(request));
  return axios.post('http://177.67.253.26:8000/collector/resources/data', request);
}

// Route
router.post("/v1/resources/data", (req, res) => {
  console.log("aqui ", req.body);
  getSomeData(req.body)
    .then(response => {
      let markers = {
        max: 100,
        min: 0,
        data: [] 
      };
      response.data.resources.forEach(res => {
        res.capabilities.location_monitoring.forEach(capabilitie =>{
          if(capabilitie.position.lat != "" && capabilitie.position.lng != ""){
            var foundIndex = markers.data.findIndex(x => x.lat == capabilitie.position.lat && x.lng == capabilitie.position.lng);
            if(foundIndex != -1) {
              markers.data[foundIndex].count++;
            } else {
              markers.data.push({"lat": capabilitie.position.lat, "lng": capabilitie.position.lng, "count": 1});
            }
          }
        });
      });
      // Find the the nearest beacon
      /*let maxCount = markers.data.reduce((prev, current) => { 
        return (prev.count > current.count) ? prev : current 
      });
      markers.max = maxCount.count;
      */
     console.log('resp: ' + JSON.stringify(markers));
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(markers, null, 3));
    })
});


module.exports = router;