<script>
import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/views/MapView"
import { onMounted } from "vue"
import Compass from "@arcgis/core/widgets/Compass.js";
import Search from "@arcgis/core/widgets/Search.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import Point from "@arcgis/core/geometry/Point.js"
import Graphic from "@arcgis/core/Graphic.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import { message } from 'ant-design-vue';
import Polygon from "@arcgis/core/geometry/Polygon.js";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";

export default {
    setup() {
        let pointArr = []
        let view
        let map
        let popu
        let highlight = null;
        const graphicsLayer = new GraphicsLayer();
        onMounted(() => {

            popu = document.querySelector(".popu")
            map = new Map({
                basemap: "satellite"
            });
            view = new MapView({
                container: "viewDiv", // Reference to the DOM node that will contain the view
                map: map, // References the map object created in step 3
                center: [-122.4194, 37.7749],
                zoom: 12
            });

            view.ui.remove("zoom")

            const graphicsLayer = new GraphicsLayer();
            map.add(graphicsLayer);

            let clickPointLatitude = 0;
            let clickPointLongitude = 0;

            let createPointBth = document.querySelector(".createPointBth")


            let test = new FeatureLayer({
                url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0"
            })

            view.on("click", (e) => {

                if (pointArr.length > 3) {

                    pointArr = []

                }
                clickPointLatitude = e.mapPoint.latitude
                clickPointLongitude = e.mapPoint.longitude

                let point = {
                    latitude: clickPointLatitude,
                    longitude: clickPointLongitude
                }

                pointArr.push(point)




                view.hitTest(e).then(function (response) {
                    console.log(response);
                    if (response.results.length > 0) {

                        popu.style.top = response.screenPoint.y + "px"
                        popu.style.left = response.screenPoint.x + "px"
                        popu.style.display = "block"
                        popu.innerHTML = ""
                        popu.innerHTML += response.results[0].graphic.attributes.name



                        view.whenLayerView(response.results[0].graphic.layer)
                            .then(function (layerView) {

                                // The layerview for the layer
                                highlight && highlight.remove()
                                highlight = layerView.highlight(response.results[0].graphic);
                            })
                            .catch(function (error) {
                                console.log(error);
                            });


                        let mapPoint = response.results[0].mapPoint
                        let latitude = response.results[0].mapPoint.latitude
                        let longitude = response.results[0].mapPoint.longitude



                        //弹框跟随
                        view.watch("extent", (event) => {

                            let screenPoint = view.toScreen(mapPoint)
                            popu.style.top = screenPoint.y + "px"
                            popu.style.left = screenPoint.x + "px"



                        })


                    } else {
                        popu.style.display = "none"
                        highlight && highlight.remove()
                        highlight = null
                    }



                });
            })


        })


        //创建一个点的函数
        function createPoint() {


            if (pointArr.length < 1) {
                message.error("请选择至少一个点")
                return
            }



            let point = new Point(pointArr[pointArr.length - 1]);
            let graphic = new Graphic({
                geometry: point,
                symbol: {
                    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                    color: "green",
                    size: 8,
                    outline: { // autocasts as new SimpleLineSymbol()
                        width: 0.5,
                        color: "red"
                    }
                },
                attributes: {
                    name: "这是一个点",
                }
            });


            graphicsLayer.add(graphic);

            map.add(graphicsLayer);

        }


        //创建一条线的函数
        function createPoline() {

            if (pointArr.length < 2) {
                message.error("请选择至少2个点")
                return
            }



            const polyline = {
                type: "polyline",
                paths: [
                    [
                        [pointArr[pointArr.length - 2].longitude, pointArr[pointArr.length - 2].latitude],
                        [pointArr[pointArr.length - 1].longitude, pointArr[pointArr.length - 1].latitude],
                    ]
                ]
            };



            const lineSymbol = {
                type: "simple-line",
                color: [226, 119, 40],
                width: 4
            };


            const polylineGraphic = new Graphic({
                geometry: polyline,
                symbol: lineSymbol,
                attributes: {
                    name: "这是一条线",
                }
            });


            graphicsLayer.add(polylineGraphic);
            map.add(graphicsLayer);

        }


        //创建一个面的函数

        function createPolyGone() {


            if (pointArr.length < 3) {



                message.error("请选择至少3个点")

                return

            }


            const polygon = {
                type: "polygon",
                rings: [
                    [pointArr[pointArr.length - 3].longitude, pointArr[pointArr.length - 3].latitude],
                    [pointArr[pointArr.length - 2].longitude, pointArr[pointArr.length - 2].latitude],
                    [pointArr[pointArr.length - 1].longitude, pointArr[pointArr.length - 1].latitude],

                ]
            };

            const fillSymbol = {
                type: "simple-fill",
                color: [227, 139, 79, 0.8],
                outline: {

                    color: [255, 255, 255],
                    width: 1
                }
            };


            const polygonGraphic = new Graphic({
                geometry: polygon,
                symbol: fillSymbol,
                attributes: {
                    name: "这是一个面",
                }
            });


            graphicsLayer.add(polygonGraphic);
            map.add(graphicsLayer);




        }


        function clearPoint() {
            pointArr = []
        }
        return { createPoint, createPoline, createPolyGone, clearPoint }
    }
}







</script>
<template>
    <div id="viewDiv">
    </div>
    <a-button class="bthPoint" type="primary" @click="createPoint">创建一个点</a-button>
    <a-button class="bthPoline" type="primary" @click="createPoline">创建一个线</a-button>
    <a-button class="bthPolyGone" type="primary" @click="createPolyGone">创建一个面</a-button>
    <a-button class="clearPoint" @click="clearPoint" type="primary" danger ghost>清除当前记录的所有点</a-button>

    <div class="popu">图层名称:</div>
</template>



<style>
#viewDiv {
    width: 100%;
    height: 100vh;
    border: 0px;
}

.xy {
    width: 200px;
    position: absolute;
    background-color: red;
    z-index: 99;
    margin-left: calc(50% - 100px);
}

.bthPoint {
    position: absolute;
    left: 50%;
    top: 20px;
}

.bthPoline {
    position: absolute;
    left: calc(50% + 200px);
    top: 20px;
}

.bthPolyGone {
    position: absolute;
    left: calc(50% - 200px);
    top: 20px;
}

.popu {
    min-width: 200px;
    height: 30px;
    position: absolute;
    background-color: rgb(234, 240, 240);
    z-index: 99;
    left: 50px;
    top: 50px;
    border-radius: 5px;
    display: none;
}

.clearPoint {
    position: absolute;
    left: calc(50%);
    top: 60px;
}

#viewDiv:focus {

    outline: none !important;

}
</style>