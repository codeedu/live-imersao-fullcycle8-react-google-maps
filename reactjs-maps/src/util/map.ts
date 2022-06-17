export class Path {
    public currentMarker: google.maps.Marker;
    public endMarker: google.maps.Marker;
    public directionsRenderer: google.maps.DirectionsRenderer;
  
    constructor(markerOptions: {
      currentMarkerOptions: google.maps.ReadonlyMarkerOptions;
      endMarkerOptions: google.maps.ReadonlyMarkerOptions;
    }) {
      const { currentMarkerOptions, endMarkerOptions } = markerOptions;
      this.currentMarker = new google.maps.Marker(currentMarkerOptions);
      this.endMarker = new google.maps.Marker(endMarkerOptions);
  
      const icon = this.currentMarker.getIcon() as google.maps.ReadonlySymbol;
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        // markerOptions: {
        //   icon: {
        //     path: "M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z    M37,41.4c0-5.2,4.3-9.5,9.5-9.5c5.2,0,9.5,4.2,9.5,9.5c0,5.2-4.2,9.5-9.5,9.5C41.3,50.9,37,46.6,37,41.4z",
        //     strokeColor: icon!.strokeColor,
        //     fillColor: icon!.fillColor,
        //     strokeOpacity: 1,
        //     strokeWeight: 1,
        //     fillOpacity: 1,
        //     anchor: new google.maps.Point(43, 55),
        //   }
        // },
        polylineOptions: {
          strokeColor: icon.strokeColor,
          strokeOpacity: 0.5,
          strokeWeight: 5,
        },
      });
      this.directionsRenderer.setMap(
        this.currentMarker.getMap() as google.maps.Map
      );
      this.calculatePath();
    }
  
    private calculatePath() {
      const currentPosition = this.currentMarker.getPosition();
      const endPosition = this.endMarker.getPosition();
      new google.maps.DirectionsService().route(
        {
          origin: { lat: currentPosition!.lat(), lng: currentPosition!.lng() },
          destination: { lat: endPosition!.lat(), lng: endPosition!.lng() },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            this.directionsRenderer.setDirections(result);
            return;
          }
  
          throw new Error(status);
        }
      );
    }
  
    delete() {
      this.currentMarker.setMap(null);
      this.endMarker.setMap(null);
      this.directionsRenderer.setMap(null);
    }
  }
  
  export class Map {
    private _map: google.maps.Map;
    private paths: { [key: string]: Path } = {};
    private directionsRenderer = new google.maps.DirectionsRenderer();
  
    constructor(element: Element, options: google.maps.MapOptions) {
      this._map = new google.maps.Map(element, options);
      this.directionsRenderer.setMap(this._map);
    }
  
    get map() {
      return this._map;
    }
  
    addPath(
      id: string,
      currentMarkerOptions: google.maps.ReadonlyMarkerOptions,
      endMarkerOptions: google.maps.ReadonlyMarkerOptions
    ) {
      if (id in this.paths) {
        throw new RouteExistsError();
      }
      this.paths[id] = new Path({
        currentMarkerOptions: { ...currentMarkerOptions, map: this.map },
        endMarkerOptions: { ...endMarkerOptions, map: this.map },
      });
      this.fitBounds();
    }
  
    removePath(id: string) {
      const path = this.paths[id];
      path.delete();
      delete this.paths[id];
    }
  
    moveCurrentMarker(id: string, position: google.maps.LatLngLiteral) {
      this.paths[id].currentMarker.setPosition(position);
  
      //this.fitBounds();
    }
  
    private fitBounds() {
      const bounds = new google.maps.LatLngBounds();
  
      Object.keys(this.paths).forEach((key: string) => {
        const route = this.paths[key];
        bounds.extend(route.currentMarker.getPosition() as any);
        bounds.extend(route.endMarker.getPosition() as any);
      });
  
      this.map.fitBounds(bounds);
    }
  }
  
  export const makeCarIcon = (color: string) => ({
    path:
      "M23.5 7c.276 0 .5.224.5.5v.511c0 .793-.926.989-1.616.989l-1.086-2h2.202zm-1.441 3.506c.639 1.186.946 2.252.946 3.666 0 1.37-.397 2.533-1.005 3.981v1.847c0 .552-.448 1-1 1h-1.5c-.552 0-1-.448-1-1v-1h-13v1c0 .552-.448 1-1 1h-1.5c-.552 0-1-.448-1-1v-1.847c-.608-1.448-1.005-2.611-1.005-3.981 0-1.414.307-2.48.946-3.666.829-1.537 1.851-3.453 2.93-5.252.828-1.382 1.262-1.707 2.278-1.889 1.532-.275 2.918-.365 4.851-.365s3.319.09 4.851.365c1.016.182 1.45.507 2.278 1.889 1.079 1.799 2.101 3.715 2.93 5.252zm-16.059 2.994c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm10 1c0-.276-.224-.5-.5-.5h-7c-.276 0-.5.224-.5.5s.224.5.5.5h7c.276 0 .5-.224.5-.5zm2.941-5.527s-.74-1.826-1.631-3.142c-.202-.298-.515-.502-.869-.566-1.511-.272-2.835-.359-4.441-.359s-2.93.087-4.441.359c-.354.063-.667.267-.869.566-.891 1.315-1.631 3.142-1.631 3.142 1.64.313 4.309.497 6.941.497s5.301-.184 6.941-.497zm2.059 4.527c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm-18.298-6.5h-2.202c-.276 0-.5.224-.5.5v.511c0 .793.926.989 1.616.989l1.086-2z",
    //url: 'M2352.9,4975.7c-209.4-58.7-388.3-160.9-549.2-314.2c-181.3-173.7-286.1-332.1-372.9-572.2l-69-186.5l-7.7-1448.3l-7.7-1450.9h107.3c89.4,0,102.2-7.7,86.8-43.4c-155.8-401-1192.9-3277.2-1210.8-3358.9c-61.3-281,97.1-615.6,367.8-774c186.5-109.8,4304-1599,4459.9-1614.3c268.2-25.5,564.5,109.8,694.8,316.7c46,74.1,1384.5,3652.7,1941.3,5182.7l74.1,209.4l235,40.9c127.7,23,291.2,53.6,362.7,69l130.3,25.5l17.9,181.3c7.7,99.6,7.7,191.6-2.6,201.8c-12.8,10.2-980.8,370.4-2153.3,796.9c-1172.4,429.1-2153.3,786.7-2176.3,797c-40.9,15.3-46,58.7-46,390.8c0,528.8-69,774-309.1,1095.8c-120,160.9-378,349.9-577.3,421.5C3155,5014,2557.3,5034.5,2352.9,4975.7z M3295.5,4521c186.5-92,380.6-304,457.2-498.1c46-117.5,58.7-209.5,69-487.9c10.2-324.4,7.7-342.3-35.8-324.4c-28.1,10.2-316.7,117.5-646.2,237.6c-441.9,163.5-600.3,212-615.6,189c-10.2-17.9-183.9-485.3-385.7-1039.6l-367.8-1009l-7.7,1055c-5.1,738.2,0,1095.8,23,1195.4c56.2,263.1,224.8,518.5,424,641.1c163.5,102.2,283.5,125.2,620.7,117.5C3121.8,4592.6,3162.7,4587.5,3295.5,4521z M3303.1,2960.4l510.9-189l7.7-883.8l5.1-883.8h204.3h204.3v804.6c0,441.9,2.6,804.6,7.7,804.6c17.9,0,3499.4-1277.2,3512.2-1287.4c5.1-7.7-30.7-20.4-81.7-28.1c-51.1-10.2-99.6-28.1-104.7-38.3c-7.7-12.8-467.4-1249.1-1021.7-2748.5c-554.3-1499.4-1029.4-2748.4-1054.9-2776.5c-66.4-74.1-171.1-120.1-268.2-120.1S971-2876.3,874-2807.3c-33.2,23-84.3,94.5-114.9,153.3c-48.5,97.1-51.1,125.2-28.1,204.3c61.3,196.7,2035.8,5599.1,2048.6,5599.1C2787.2,3149.4,3022.2,3062.5,3303.1,2960.4z"/><path d="M8455.2-812.4c-579.8-1024.3-791.8-1527.5-817.4-1941.3c-28.1-510.9,196.7-748.4,781.6-814.8c398.5-43.4,802.1,35.8,1001.3,201.8c337.2,278.4,350,896.6,35.8,1660.3c-107.3,258-416.4,871-595.2,1175l-122.6,212L8455.2-812.4z M9162.8-2074.2c194.1-587.5,153.3-881.2-148.2-1029.4c-127.7-61.3-171.1-69-388.2-66.4c-209.5,0-265.7,10.2-367.8,63.9c-168.6,84.3-224.8,191.6-206.9,393.4c23,275.9,217.1,743.3,559.4,1353.8l130.3,229.9l173.7-357.6C9009.5-1683.4,9121.9-1946.5,9162.8-2074.2z',
    fillColor: color,
    strokeColor: color,
    strokeWeight: 1,
    fillOpacity: 1,
    anchor: new google.maps.Point(26, 20),
  });
  
  export const makeMarkerIcon = (color: string) => ({
    path:
      "M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z    M37,41.4c0-5.2,4.3-9.5,9.5-9.5c5.2,0,9.5,4.2,9.5,9.5c0,5.2-4.2,9.5-9.5,9.5C41.3,50.9,37,46.6,37,41.4z",
    strokeColor: color,
    fillColor: color,
    strokeOpacity: 1,
    strokeWeight: 1,
    fillOpacity: 1,
    anchor: new google.maps.Point(46, 70),
  });
  
  
  export class RouteExistsError extends Error {}
  