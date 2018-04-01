

(function () {
    'use strict';
    /**
     * screenshot 截图
     * Author: Veiss Date: 2018/4/1
    */

    angular.module('screenshotFeedBack', [])
        .directive('feedback', ['$compile', feedbackDirective]);

    function feedbackDirective($compile) {
        return {
            restrict: 'A',
            scope: {
                imgUrl: '=' //将指令内部scope字段和指令外部模块scope字段双向绑定  
            },
            link: function ($scope, element, attrs) {

                $scope.flag = false;

                /*点击截图*/
                element.bind('click', function () {
                    getBodyArea();
                    layout(true);
                });

                /*获取截图区域*/
                $scope.area = {
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0
                };

                /*方法*/
                $scope.method = {
                    screenShot: screenShot, //截图
                    cancelArea: cancelArea, //取消截图
                }

                /*关闭截图框*/
                function cancelArea() {
                    document.body.className -= ' body-selection';
                    removeArea();
                    layout(false);
                };

                function getBodyArea(status) {
                    var wId = "w";
                    var index = 0;
                    var startX = 0, startY = 0;
                    var retcLeft = "0px", retcTop = "0px", retcHeight = "0px", retcWidth = "0px";

                    document.body.style.cursor = 'crosshair';
                    document.body.className += ' body-selection';

                    //解除事件
                    if (status) {
                        document.body.style.cursor = 'default';
                        document.onmousedown = '';
                        document.onmousemove = '';
                        document.onmouseup = '';
                    } else {
                        document.body.style.cursor = 'crosshair';
                        document.onmousedown = areaOnmousedown;
                        document.onmousemove = areaOnmousemove;
                        document.onmouseup = areaOnmouseup;
                    }

                    function areaOnmousedown(e) {
                        $scope.flag = true;
                        try {
                            var evt = window.event || e;
                            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                            var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
                            startX = evt.clientX + scrollLeft;
                            startY = evt.clientY + scrollTop;
                            index++;
                            var div = document.createElement("div");
                            div.id = wId + index;
                            div.className = "snap-box";
                            div.style.left = startX + "px";
                            div.style.top = startY + "px";
                            document.body.appendChild(div);
                        } catch (e) {
                            console.error('error', e);
                        }
                    }

                    function areaOnmouseup() {
                        $scope.flag = false;
                        layout(false);
                        try {
                            document.body.removeChild(document.getElementById(wId + index));
                            var div = document.createElement("div");
                            div.className = "retc";
                            div.style.left = retcLeft;
                            div.style.top = retcTop;
                            div.style.width = retcWidth;
                            div.style.height = retcHeight;
                            document.body.appendChild(div);

                        } catch (e) {
                            console.error('error', e);
                        }

                        //储存坐标
                        $scope.area.left = parseInt(retcLeft.replace(/px/, ''));
                        $scope.area.top = parseInt(retcTop.replace(/px/, ''));
                        $scope.area.width = parseInt(retcWidth.replace(/px/, ''));
                        $scope.area.height = parseInt(retcHeight.replace(/px/, ''));

                        if ($scope.area.left > 0 && $scope.area.top > 0 && $scope.area.width > 0 && $scope.area.height > 0) {
                            var _position = "left:" + ($scope.area.left + $scope.area.width - 150) + "px; top:" + ($scope.area.top + $scope.area.height + 5) + "px";
                            var _div = $('<div ng-cloak class="retc-tool" style="' + _position + '"><a href="javascript:;" class="btn btn-primary" ng-click="method.screenShot($event)">截图</a><a href="" class="btn btn-light" ng-click="method.cancelArea()">取消</a></div>');
                            $compile(_div)($scope);
                            $(div).after(_div);

                            //解除事件
                            getBodyArea(true);
                        } else {
                            removeArea();
                        }
                        document.body.style.cursor = 'default';
                    }

                    function areaOnmousemove(e) {
                        if ($scope.flag) {
                            try {
                                var evt = window.event || e;
                                var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                                var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
                                var retDom = document.getElementById(wId + index);
                                retcLeft = (startX - evt.clientX - scrollLeft > 0 ? evt.clientX + scrollLeft : startX) + "px";
                                retcTop = (startY - evt.clientY - scrollTop > 0 ? evt.clientY + scrollTop : startY) + "px";
                                retcHeight = Math.abs(startY - evt.clientY - scrollTop) + "px";
                                retcWidth = Math.abs(startX - evt.clientX - scrollLeft) + "px";
                                retDom.style.left = retcLeft;
                                retDom.style.top = retcTop;
                                retDom.style.width = retcWidth;
                                retDom.style.height = retcHeight;
                            } catch (e) {
                                console.error('error', e);
                            }
                        }
                    }
                }

                /*点击截图*/
                function screenShot(event) {
                    $(event.target).text('截图中').attr('disabled', 'disabled');

                    html2canvas(document.body, {
                        //foreignObjectRendering: true,
                        logging: true,
                        allowTaint: false
                    }).then(function (canvas) {
                        var img = convertCanvasToImage(canvas);
                        img.onload = function () {
                            img.onload = null;
                            canvas = convertImageToCanvas(img, $scope.area.left, $scope.area.top, $scope.area.width, $scope.area.height);
                            img.src = convertCanvasToImage(canvas).src;
                            $scope.$apply(function () {
                                $scope.imgUrl = img.src;
                            });

                            //删除节点
                            cancelArea();
                        };
                    }).catch(function (e) {
                        console.error('error', e);
                    });
                }

                // Converts canvas to an image
                function convertCanvasToImage(canvas) {
                    var image = new Image();
                    image.crossOrigin = '*';
                    image.src = canvas.toDataURL("image/png");
                    return image;
                }

                // Converts image to canvas; returns new canvas element
                function convertImageToCanvas(image, startX, startY, width, height) {
                    var canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext("2d").drawImage(image, startX, startY, width, height, 0, 0, width, height);
                    return canvas;
                }

                /*删除选取框和虚线框*/
                function removeArea() {
                    $(document).find($('.snap-box')).remove();
                    $(document).find($('.retc')).remove();
                    $(document).find($('.retc-tool')).remove();
                }

                /*遮罩层*/
                function layout(flag) {
                    var layout = $('<div class="snap-layout"></div>');
                    if (flag) {
                        $('body').append(layout);
                    } else {
                        $('body').find('.snap-layout').remove();
                    }
                }
            }
        };
    }


})();