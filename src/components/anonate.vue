<template>
<div style="height: 100vh; width: 100vw;">
    <multipane class="custom-resizer" layout="vertical">
        <div class="pane" :style="{ width: '25%', maxWidth: '25%' ,  minWidth: '15%'}">
            <!--<b-button class="mb-2" pill  variant="primary" v-on:click="listFiles">List</b-button>-->
            <!--<p>{{info}}</p>-->
            <div id="scrollspy-nested" style="position:relative; height:100vh; overflow-y:auto">
                <b-table show-empty striped hover stacked="md" caption-top selectable :select-mode="selectMode" selectedVariant="success" :items="getImages" :fields="imageFields" @row-selected="rowSelected" @row-clicked="rowClicked">
                    <template slot="file" slot-scope="row">
                        <b-img :src=row.value width="200"></b-img>
                    </template>
                </b-table>
            </div>

        </div>
        <multipane-resizer></multipane-resizer>
        <div class="pane" :style="{ flexGrow: 1 }">
            <b-container class="container_middle">
                <b-row>
                    <b-col md="auto">
                        <div class="image-container">
                            <clipper-basic ref="clipper" class="my-clipper" :src="imSrc" @load="loadCb"></clipper-basic>
                            <div v-if="showBound" :style="drawBox">{{annotationName}}</div>
                        </div>
                    </b-col>

                </b-row>
                <b-row>
                    {{imSrc}}
                </b-row>
            </b-container>
        </div>
        <multipane-resizer></multipane-resizer>
        <div class="pane" :style="{ width: '25%', maxWidth: '30%' , minWidth: '15%'}">
            <b-container>
                <b-row>
                    <b-button class="mb-2" pill variant="primary" v-b-modal.anotateDiaglog>Add label</b-button>
                    <b-button class="mb-2" pill variant="primary" v-on:click="saveAnotationFile">Save Anotation</b-button>
                    <b-modal ref="saveAnotation" id="saveAnotateDiaglog" title="Save file" ok-only>
                        {{savedXmlFilename}}
                    </b-modal>
                    <b-table :items="classes" :fields="classesFields">
                        <template slot="Label" slot-scope="row">
                            {{row.value}}
                        </template>
                        <template slot="actions" slot-scope="row">
                            <b-button pill size="sm" @click="anotateFunc(row)" class="mr-1" variant="info">
                                Anotate
                            </b-button>
                            <b-button pill size="sm" variant="danger">
                                Delete
                            </b-button>
                        </template>
                    </b-table>
                </b-row>
                <b-row>
                    <p> {{anotate.annotation.size}}{{anotate.annotation.filename}}</p>
                    <b-table :items="anotate.annotation.object" :fields="bndFields" selectable :select-mode="selectMode" selectedVariant="success" @row-selected="boxRowSelected" @row-clicked="boxRowClicked">
                        <template slot="name" slot-scope="row">
                            {{row.value}}
                        </template>
                        <template slot="bndbox" slot-scope="row">
                            {{row.value}}
                        </template>
                        <template slot="Actions" slot-scope="row">
                            <b-button size="sm" pill variant="danger" @click="deleteBox(row)" class="mr-1">
                                Delete
                            </b-button>

                        </template>
                    </b-table>
                </b-row>

                <b-modal ref="class-modal" id="anotateDiaglog" title="Add a label" hide-footer>
                    <b-form @submit="onSubmit" @reset="onReset">
                        <b-container fluid class="bv-example-row">
                            <b-form-row class="mb-3">
                                <b-form-input id="input-2" v-model="form.name" required placeholder="Enter name"></b-form-input>
                            </b-form-row>
                            <b-form-row>
                                <b-col md="4">
                                    <b-button pill block type="submit" variant="primary">Ok</b-button>
                                </b-col>
                                <b-col md="4" class="ml-md-auto ">
                                    <b-button pill block type="reset" variant="danger">Reset</b-button>
                                </b-col>
                            </b-form-row>
                        </b-container>
                    </b-form>
                </b-modal>
            </b-container>

        </div>
    </multipane>
</div>
</template>

<script>
import {
    clipperBasic
} from 'vuejs-clipper'
import {
    Multipane,
    MultipaneResizer
} from 'vue-multipane';

//import Splitpanes from 'splitpanes'
//import 'splitpanes/dist/splitpanes.css'

import "vuejs-clipper/dist/vuejs-clipper.css"
import axios from 'axios';
import {
    mapGetters
} from 'vuex'
//import VueAxios from 'vue-axios';

var convert = require('xml-js');
//const API_URL = "http://localhost:3000/getFiles";

var axios_options = {
    proxy: {
        host: '127.0.0.1',
        port: 3000
    }
}

export default {
    name: "Anotate",
    components: {
        clipperBasic,
        Multipane,
        MultipaneResizer,

        //Splitpanes,
    },
    props: {

    },
    created() {

    },
    data() {
        return {
            form: {
                name: ''
            },
            sortBy: 'name',
            bndFields: [{
                key: 'name',
                sortable: false
            }, {
                key: 'bndbox',
                sortable: false
            }, {
                key: 'Actions'
            }],
            imageFields: [{
                key: 'file',
                sortable: false
            }],
            fullPath: "",
            projectDir: "",
            imFolder: "",
            images: [],
            selectedFile: "",
            selectedPath: "",
            classes: [],
            classesFields: [{
                key: 'Label'
            }, {
                key: 'actions',
                label: 'Actions'
            }],
            modes: ['multi', 'single', 'range'],
            selectMode: 'single',
            selected: [],
            im_file: "",
            selectedIndx: 3,
            imSrc: './round_image_black_48dp.png',
            options: {},
            sel: {},
            anotate: {
                "annotation": {
                    "folder": " ",
                    "filename": " ",
                    "path": " ",
                    "source": {
                        "database": "Unknown"
                    },
                    "size": {
                        "width": 500,
                        "height": 300,
                        "depth": 3
                    },
                    "segmented": 0,
                    "object": []
                }

            },
            info: [],
            anotationWidth: 100,
            anotationHeight: 100,
            anotationX: 0,
            anotationY: 0,
            annotationName: "",
            showBound: false,
            savedXmlFilename: "",
        }
    },
    methods: {

        imageSrc: function () {
            console.log("Image sr called!!!!")
            console.log(this.$store.getters.getImages[this.selectedIndx].file) // this.images[this.selectedIndx].file)
            return this.$store.getters.getImages[this.selectedIndx].file //this.images[this.selectedIndx].file
        },
        rowSelected(items) {
            console.log(items)
            return this.selected = items
        },
        rowClicked: function (item, index, event) {
            while (this.anotate.annotation.object.length) {
                this.anotate.annotation.object.pop();
            }

            this.showBound = false
            console.log("Hello")
            console.log(event)
            //console.log(this.images[index].file)
            console.log(this.$store.getters.getImages[index].file)
            this.imSrc = this.$store.getters.getImages[index].file
            this.selectedFile = this.$store.getters.getImages[index].fileName
            this.imFolder = 'images'
            var imPath = "/" + this.$store.getters.getProjectDir  + "/" + this.imFolder + "/"
            var xmlFileName = imPath + this.selectedFile.replace(/\.[^/.]+$/, "") + ".xml"
            console.log("xmlFileName = ")
            console.log(xmlFileName)

            axios.post('checkXmlFile', {
                    filename: xmlFileName
                })
                .then(function (response) {
                    console.log(response.data.status);

                    //console.log(JSON.stringify(jobj));
                    if (response.data.status == "OK") {
                        var jobj = JSON.parse(response.data.data)
                        if (Array.isArray(jobj.annotation.object)) {
                            this.anotate.annotation.object = jobj.annotation.object
                        } else {
                            this.anotate.annotation.object.push(jobj.annotation.object)
                        }

                        console.log(JSON.stringify(this.anotate));
                        console.log("OK");
                        //console.log(JSON.stringify(jobj.data));
                    } else {
                        console.log("FAIL");
                    }
                }.bind(this))
                .catch(function (error) {
                    console.log(error);
                });
            return this.selectedIndx = index

        },
        boxRowSelected: function () {

        },
        boxRowClicked: function (item, index, event) {

            console.log("Anotation click!!!!!!")
            console.log(this.anotate.annotation.object[index])
            this.showBound = true
            var selectedObj = this.anotate.annotation.object[index]
            this.annotationName = selectedObj.name
            this.anotationX = selectedObj.bndbox.xmin
            this.anotationY = selectedObj.bndbox.ymin
            this.anotationWidth = selectedObj.bndbox.xmax - selectedObj.bndbox.xmin
            this.anotationHeight = selectedObj.bndbox.ymax - selectedObj.bndbox.ymin

        },

        anotateFunc: function (row) {

            console.log("Label = " + row.item.Label)
            const canvas = this.$refs.clipper.clip()
            console.log(canvas)
            const pos = this.$refs.clipper.getDrawPos()
            console.log(pos)
            console.log(pos.pos.sx)
            console.log(pos.pos.sy)

            this.anotate.annotation.object.push({
                "name": row.item.Label,
                "pose": "Unspecified",
                "truncated": 0,
                "difficult": 0,
                "bndbox": {
                    "xmin": Math.floor(pos.pos.sx),
                    "ymin": Math.floor(pos.pos.sy),
                    "xmax": Math.floor(pos.pos.sx + pos.pos.swidth),
                    "ymax": Math.floor(pos.pos.sy + pos.pos.sheight)
                }
            })
            console.log(this.anotate.annotation.object)
            console.log("Done anotation!!!!!!")

        },
        deleteBox: function (row) {
            this.anotate.annotation.object.pop(row)
        },
        delAnotateFunc: function () {
            this.anotate.annotation.object.pop()
        },
        loadCb: function () {

            var imsr = this.imageSrc()

            this.anotate.annotation.filename = this.selectedFile
            this.anotate.annotation.folder = this.imFolder.substr(1, this.imFolder.length)
            this.anotate.annotation.path = this.fullPath + "/client/" + imsr //imsr.substr(1, imsr.length);
            if (this.images === undefined || this.images.length == 0) {
                // array empty or does not exist
            } else {
                var img = new Image();
                img.src = this.imageSrc();

                img.onload = function () {
                    // here you got the width and height
                    this.anotate.annotation.size.width = img.width;
                    this.anotate.annotation.size.height = img.height;

                }.bind(this);

                img.onerror = function () {

                    console.log("Load image error")
                }.bind(this);
            }
        },
        onSubmit(evt) {
            evt.preventDefault()
            this.classes.push({
                "Label": this.form.name
            })
            console.log(this.classes)
            this.$refs['class-modal'].hide()
        },
        onReset: function () {

        },
        /*listFiles: function () {
            while (this.images.length) {
                this.images.pop();
            }
            let uri = 'getFiles';
            axios.post(uri, {
                path: this.$store.state.projectDir
            }).then((response) => {
                this.info = response.data.files;
                this.projectDir = response.data.projectDir;
                this.imFolder = response.data.folder;
                this.fullPath = response.data.fullPath
                var index, len;
                for (index = 0, len = this.info.length; index < len; ++index) {
                    var imPath = response.data.projectDir + response.data.folder + "/" + this.info[index].file;
                    this.images.push({
                        fileName: this.info[index].file,
                        file: imPath,
                        id: this.info[index].id
                    })
                }

                console.log(response.data.files)
            });

        },*/
        saveAnotationFile: async function () {
            var options = {
                compact: true,
                ignoreComment: true,
                spaces: 4
            };
            var result = convert.json2xml(this.anotate, options);
            var imPath = "/" + this.$store.getters.getProjectDir + "/" + this.imFolder + "/"
            var xmlFileName = imPath + this.selectedFile.replace(/\.[^/.]+$/, "") + ".xml"
            this.savedXmlFilename = "Anotated file is saved as " + this.selectedFile.replace(/\.[^/.]+$/, "") + ".xml"
            //console.log(xmlFileName)
            //console.log(JSON.parse(this.annotate))
            console.log(result)

            await axios.post('writeXml', {
                    filename: xmlFileName,
                    data: result
                })
                .then((response) => {
                    console.log(response.data);
                    if (response.data.status === 'OK') {
                        console.log("File is OK!!!!");

                        this.$refs['saveAnotation'].show()
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }

    },
    directives: {

    },
    mounted() {
        this.images = this.$store.getters.getImages
        this.projectDir = this.$store.getters.getProjectDir
    },
    computed: {
        ...mapGetters([
            'getProjectDir',
            'getImages'
        ]),
        drawBox() {
            var sty = "position: absolute;" +
                "top: 0;" +
                "left: 0;" +
                "width: " + this.anotationWidth + "px;" +
                "height: " + this.anotationHeight + "px;" +
                "margin-top: " + this.anotationY + "px;" +
                "margin-left: " + this.anotationX + "px;" +
                "display: none;" +
                "color: #FFF;" +
                "display: block;" +
                "background: rgba(0, 0, 0, .5);";
            console.log(sty)

            return sty;
        }
    },

}
</script>

<style lang="scss" scoped>
.my-clipper {
    width: 100%;
}

.custom-resizer {
    width: 100%;
    height: 100vh;
}

.custom-resizer>.pane {
    text-align: left;
    padding: 10px;
    overflow: hidden;
    background: #eee;
    border: 1px solid #ccc;
}

.custom-resizer>.pane~.pane {}

.custom-resizer>.multipane-resizer {
    margin: 0;
    left: 0;
    width: 8px;
    position: relative;
    background: #999;

    &:before {
        display: block;
        content: "";
        width: 3px;
        height: 100vh;
        position: absolute;
        top: 0%;
        left: 50%;
        margin-top: 0vh;
        margin-left: -1.5px;
        border-left: 1px solid #444;
        border-right: 1px solid #444;
    }

    &:hover {
        &:before {
            border-color: #999;
        }
    }
}

.container_middle {
    width: 100%;
    padding-right: 0px;
    padding-left: 0px;
    margin-right: 1px;
    margin-left: 1px;
}

.splitpanes {
    .splitpanes__pane {
        box-shadow: 0 0 3px rgba(185, 185, 185, 0.2) inset;
        justify-content: center;
        align-items: center;
        display: flex;
        position: relative;
    }
}

.splitpanes span {
    font-family: Helvetica, Arial, sans-serif;
    color: #f00;
    opacity: 0.7;
}

em.specs {
    font-size: 0.2em;
    line-height: 1;
    position: absolute;
    color: #999;
    bottom: 0.5em;
    left: 0;
    right: 0;
    text-align: center;
}

.multipane.foo.layout-v .multipane-resizer {
    margin: 0;
    left: 0;
    /* reset default styling */
    width: 10px;
    background: #999;
}

.vertical-panes {
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
}

.vertical-panes>.pane {
    text-align: left;
    padding: 15px;
    overflow: hidden;
    background: #eee;
}

html,
body {
    height: 100%;
}

.container-fluid {
    height: 100%;
    overflow-y: hidden;
    /* don't show content that exceeds my height */
}

.body-film {
    min-height: 100%;
    overflow-y: scroll;
}

.my-table {
    max-height: 600px;
    overflow-y: scroll;
}

.fullHeight {
    height: 100%;
    background: rebeccapurple;
}

.image-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.image-container .after {
    position: absolute;
    top: 0;
    left: 0;
    width: 50px;
    height: 50px;
    margin-top: 30px;
    margin-left: 30px;
    display: none;
    color: #FFF;
    display: block;
    background: rgba(121, 121, 121, 0.5);

}

.image-container:hover .after {}
</style>
