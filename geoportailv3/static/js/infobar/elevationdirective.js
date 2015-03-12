/**
 * @fileoverview This file provides a "elevation" directive. This directive is
 * used to insert Elevation information into the HTML page.
 * Example:
 *
 * <app-elevation app-elevation-active="mainCtrl.infobarOpen"
 *     app-elevation-map="::mainCtrl.map"></app-elevation>
 *
 * Note the use of the one-time binding operator (::) in the map expression.
 * One-time binding is used because we know the map is not going to change
 * during the lifetime of the application.
 *
 */
goog.provide('app.elevationDirective');

goog.require('app');
goog.require('app.projections');
goog.require('ngeo.Debounce');


/**
 * @return {angular.Directive} The Directive Object Definition.
 * @ngInject
 */
app.elevationDirective = function() {
  return {
    restrict: 'E',
    scope: {
      'map': '=appElevationMap',
      'active': '=appElevationActive'
    },
    controller: 'AppElevationController',
    controllerAs: 'ctrl',
    bindToController: true,
    template: '<span class="elevation" translate>' +
        'Elevation: {{ctrl.elevation}} m</span>'
  };
};


app.module.directive('appElevation', app.elevationDirective);



/**
 * @ngInject
 * @constructor
 * @param {angular.$http} $http
 * @param {ngeo.Debounce} ngeoDebounce
 * @param {string} elevationServiceUrl
 */
app.ElevationDirectiveController =
    function($http, ngeoDebounce, elevationServiceUrl) {
  var map = this['map'];
  map.on('pointermove',
      ngeoDebounce(
      function(e) {
        if (this['active']) {
          var lonlat = /** @type {ol.Coordinate} */
             (ol.proj.transform(e.coordinate,
             map.getView().getProjection(), 'EPSG:2169'));
          $http.get(elevationServiceUrl, {
                params: {'lon': lonlat[0], 'lat': lonlat[1]}
          }).
             success(goog.bind(function(data) {
                this['elevation'] = data['dhm'] > 0 ?
               parseInt(data['dhm'] / 100, 0) : 'N/A';
             }, this));
        }
      }, 300, true), this);
};


app.module.controller('AppElevationController',
    app.ElevationDirectiveController);