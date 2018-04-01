(function () {
    'use strict';

    /**
     * index page
    */
    var app = angular.module('app', ['screenshotFeedBack']).controller('appCtrl', appCtrl);

    appCtrl.$inject = ['$scope'];

    function appCtrl($scope) {
        $scope.imgUrl = '111';
        
    }
})()