<template>
<div>
    <div class="container-fluid fill-height">

        <b-row style="padding-top: 8px; padding-bottom: 8px; background-color:#333333">
            <b-col>
                <div class="float-left">

                    <b-button variant="info" type='button' pill v-b-modal.modal-prevent-closing style="padding-left: 16px;padding-right: 16px;" class="btn-space">
                        New Project
                    </b-button>

                    <b-button variant="success" pill v-on:click="getAllProjects" v-b-modal.modal_list_files style="padding-left: 16px;padding-right: 16px;" class="btn-space">
                        Open Project
                    </b-button>

                    <b-button variant="danger" pill v-on:click="deleteProject" v-b-modal.modal_list_delete_files style="padding-left: 16px;padding-right: 16px;" class="btn-space">
                        Delete Project
                    </b-button>
                </div>
            </b-col>
            <b-col>
                <b-button v-if="isRunHiden" :disabled='isProjectLoaded' variant="danger" pill v-on:click="showCode" style="padding-left: 16px;padding-right: 16px;" class="btn-space">
                    Run
                </b-button>
                <b-button v-if="isRunHiden" :disabled='!isProjectLoaded' variant="success" pill v-on:click="stopRun" style="padding-left: 16px;padding-right: 16px;" class="btn-space">
                    Stop
                </b-button>
                <b-button v-if="isRunHiden" :disabled='isProjectLoaded' variant="success" pill v-on:click="saveWorkspace" style="padding-left: 16px;padding-right: 16px;" class="btn-space">
                    Save Blockly
                </b-button>
                <b-button v-if="isRunHiden" :disabled='isProjectLoaded' variant="success" pill v-on:click="loadWorkspace" style="padding-left: 16px;padding-right: 16px;" class="btn-space">
                    Load Blockly
                </b-button>

            </b-col>
            <b-col>
                <div style="color:#ABEBC6;" class="float-right">Current project : {{getProjectDir}} </div>

            </b-col>
        </b-row>

        <b-row>
            <vue-tabs @tab-change="handleTabChange">
                <v-tab title="Capture" active>
                    <Capture />

                </v-tab>
                <v-tab title="Annotation">
                    <Anotate />
                </v-tab>
                <v-tab title="Coding">

                    <b-container class="bv-example-row">

                        <b-row>
                            <b-col sm="8" style="margin-left: 0px; background-color:#FFF; height: 100vh; width: 100vw;" ref="blocklyDiv" fluid>

                            </b-col>
                            <b-col sm="4" style="background-color:#FFF">
                                <b-row>
                                    <b-container fluid> Camera view </b-container>
                                </b-row>
                                <b-row>
                                    <b-container fluid>
                                        <b-img ref="displayImage" center src="" style="margin-top: 1px;width: 100%;"> </b-img>
                                    </b-container>
                                </b-row>
                                <b-row>
                                    <b-container fluid>
                                        <b-button-group style="margin-top: 10px;">
                                            <b-button pill v-longclick="() => onLeft()" @click="onLeft" style="padding-left: 20px;padding-right: 20px;" class="btn-space">
                                                <v-icon name="angle-left" scale="3" />
                                            </b-button>

                                            <b-button pill v-longclick="() => onForward()" @click="onForward" style="padding-left: 20px;padding-right: 20px;" class="btn-space">
                                                <v-icon name="angle-up" scale="3" />
                                            </b-button>

                                            <b-button pill v-longclick="() => onRight()" @click="onRight" style="padding-left: 20px;padding-right: 20px;" class="btn-space">
                                                <v-icon name="angle-right" scale="3" />
                                            </b-button>
                                        </b-button-group>
                                    </b-container>

                                </b-row>
                                <b-row>
                                    <b-container fluid>
                                        <b-button-group>
                                            <b-button pill v-longclick="() => onCCW()" @click="onCCW" style="padding-left: 16px;padding-right: 16px;" class="btn-space">
                                                <v-icon name="undo" scale="2" />
                                            </b-button>
                                            <b-button pill v-longclick="() => onBackward()" @click="onBackward" style="padding-left: 20px;padding-right: 20px;" class="btn-space">
                                                <v-icon name="angle-down" scale="3" />
                                            </b-button>
                                            <b-button pill v-longclick="() => onCW()" @click="onCW" style="padding-left: 16px;padding-right: 16px;" class="btn-space">
                                                <v-icon name="undo" scale="2" class="fa-flip-horizontal" />
                                            </b-button>
                                        </b-button-group>
                                    </b-container>
                                </b-row>
                            </b-col>

                        </b-row>

                    </b-container>

                </v-tab>
            </vue-tabs>
        </b-row>

    </div>
    <b-modal id="modal-prevent-closing" ref="modal" title="Enter project name" @show="resetModal" @hidden="resetModal" @ok="handleOk">
        <form ref="form" @submit.stop.prevent="handleSubmit">
            <b-form-group :state="nameState" label="Name" label-for="name-input" invalid-feedback="Name is required">
                <b-form-input id="name-input" v-model="projectDirIn" :state="nameState" required></b-form-input>
            </b-form-group>
        </form>
    </b-modal>

    <b-modal id="modal_list_files" title="Projects list">
        <!--<div v-for="(item, index) in projectsName" :key="`fruit-${index}`">
            {{ item }}
        </div>-->
        <b-table show-empty striped hover stacked="md" caption-top selectable :select-mode="selectMode" selectedVariant="success" :items="projectsName" @row-selected="rowSelected" @row-clicked="rowClicked">
        </b-table>
    </b-modal>

    <b-modal id="modal_list_delete_files" title="Project list" @ok="handleProjectDelete">
        <b-table show-empty striped hover stacked="md" caption-top selectable :select-mode="selectMode" selectedVariant="success" :items="projectsName" @row-selected="rowDeleteSelected" @row-clicked="rowDeleteClicked">
        </b-table>
    </b-modal>

    <b-modal ref="pyhonLoading" hide-footer title="Loading code">
        <div class="d-block text-center">

            <b-progress :max="max" height="2rem" :striped="true" show-progress :animated="true">
                <b-progress-bar :value="value" variant="success">
                    <h5 v-if="value > 0">Loading</h5>
                </b-progress-bar>
            </b-progress>
        </div>
    </b-modal>

</div>
</template>

<script>
import axios from 'axios';
import {
    mapGetters
} from 'vuex'
import Anotate from "@/components/anonate.vue";
import Capture from "@/components/capture.vue";
import BlocklyComponent from '@/components/BlocklyComponent.vue';
import '../blocks/stocks';
import '../prompt';
import {
    VueTabs,
    VTab
} from 'vue-nav-tabs'
//you can also import this in your style tag
import 'vue-nav-tabs/themes/vue-tabs.css'
import "vue-awesome/icons";
import VIcon from "vue-awesome/components/Icon";

//import BlocklyJS from 'blockly/javascript';
import blocklyPython from 'blockly/python';
import Blockly from 'blockly';
//import Blockly from 'node-blockly/browser';
//import blocklyPython from 'node-blockly/python';

var axios_options = {
    proxy: {
        host: "127.0.0.1",
        port: 3000
    }
};

export default {
    name: 'Main',
    components: {
        Anotate,
        Capture,
        BlocklyComponent,
        VueTabs,
        VTab,
        VIcon
    },
    data: function () {
        return {
            selectMode: 'single',
            activetab: 1,
            nameState: null,
            projectDirIn: '',
            projectsName: [],
            deletingProject: null,
            loaded: false,
            blockly_woakspace: null,
            code: "",
            code_file: "",
            options: {},
            isRunHiden: false,
            isStopHidden: false,
            isProjectLoaded: true,
            //url: "http://192.168.88.243:8080/stream?topic=/output/image_detected&type=ros_compressed"
            url: "",
            ipAddress: "192.168.88.247",
            value: 0,
            max: 24,
            cmdVel: null,

        }

    },
    methods: {
        rowSelected(items) {
            //console.log(items)
            return this.selected = items
        },
        rowClicked: function (item, index, event) {
            this.$store.dispatch('changeProjectDir', this.projectsName[index].Projects)
            this.$store.dispatch('reqImages')
            this.loadWorkspace()
            console.log(this.$store.getters.getImages)
            console.log(this.projectsName[index].Projects)
            this.isProjectLoaded = false
        },
        rowDeleteSelected(items) {
            //console.log(items)
            return this.selected = items
            this.isProjectLoaded = true
        },
        rowDeleteClicked: function (item, index, event) {
            this.$store.dispatch('changeProjectDir', this.projectsName[index].Projects)
            console.log("deleted = ")
            console.log(this.projectsName[index].Projects)
            this.deletingProject = this.projectsName[index].Projects

        },
        handleProjectDelete: function (bvModalEvt) {
            if (this.deletingProject == null) {
                bvModalEvt.preventDefault()
            } else {
                this.$store.dispatch('deleteProject', this.deletingProject)
                this.$store.dispatch('regProjects').then(response => {
                    console.log("Got some data, now lets show something in this component")
                    this.deletingProject = null
                }, error => {
                    console.error("Got nothing from server. Prompt user to check internet connection and try again")
                })

            }
        },
        deleteProject: function () {
            this.getAllProjects();

        },
        getAllProjects: function () {
            this.$store.dispatch('regProjects').then(response => {
                console.log("Got some data, now lets show something in this component")
                var projectNames = this.$store.getters.getProjects
                while (this.projectsName.length) {
                    this.projectsName.pop();
                }
                projectNames.forEach(function (item) {
                    this.projectsName.push({
                        "Projects": item
                    })
                }.bind(this));
                //this.projectsName = this.$store.getters.getProjects
                //this.$store.dispatch('regProjects')
                console.log(this.projectsName)
            }, error => {
                console.error("Got nothing from server. Prompt user to check internet connection and try again")
            })

        },
        checkFormValidity() {
            const valid = this.$refs.form.checkValidity()
            this.nameState = valid ? 'valid' : 'invalid'
            return valid
        },
        resetModal() {
            this.projectDirIn = ''
            this.nameState = null
        },
        handleOk(bvModalEvt) {
            // Prevent modal from closing
            bvModalEvt.preventDefault()
            // Trigger submit handler
            this.handleSubmit()
        },
        handleSubmit() {
            // Exit when the form isn't valid
            if (!this.checkFormValidity()) {
                return
            }
            // Push the name to submitted names
            //this.submittedNames.push(this.projectDirIn)
            this.$store.dispatch('setProjectDir', this.projectDirIn)
            // Hide the modal manually
            this.$nextTick(() => {
                this.$store.dispatch('regProjects')
                this.$refs.modal.hide()
            })
        },
        handleTabChange(tabIndex, newTab, oldTab) {

            console.log("Tabindex = " + tabIndex)
            if (tabIndex == 2 && this.loaded == false) {

                /* var rawFile = new XMLHttpRequest();
                 var code = "";
                 rawFile.open("GET", "getBlocks", false);
                 rawFile.onreadystatechange = function () {
                     var rr = JSON.parse(rawFile.responseText)
                     if (rawFile.readyState === 4) {
                         if (rawFile.status === 200 || rawFile.status == 0) {
                             code = rr.data;
                             console.log(code)
                             setTimeout(() => {
                                 //alert("Hello blockly")
                                 var tt = {}
                                 tt.toolbox = code
                                 var blckDiv = this.$refs["blocklyDiv"]
                                 this.blockly_woakspace = Blockly.inject(this.$refs["blocklyDiv"], tt);
                                 console.log("Injection running !!!!!!!!!!!!!!!!")
                                 console.log(this.blockly_woakspace)
                                 this.loaded = true
                             }, 500)
                         }
                     }
                 }.bind(this)
                 rawFile.send(null);*/
                this.renderBlocly()

            }
            if (tabIndex == 2) {
                this.isRunHiden = true

            } else {
                this.isRunHiden = false

            }

        },
        renderBlocly() {
            var rawFile = new XMLHttpRequest();
            var code = "";
            rawFile.open("GET", "getBlocks", false);
            rawFile.onreadystatechange = function () {
                var rr = JSON.parse(rawFile.responseText)
                if (rawFile.readyState === 4) {
                    if (rawFile.status === 200 || rawFile.status == 0) {
                        code = rr.data;
                        console.log(code)
                        setTimeout(() => {
                            //alert("Hello blockly")
                            var tt = {}
                            tt.toolbox = code
                            tt.scrollbars = true
                            tt.css = true
                            tt.zoom = {
                                controls: true,
                                wheel: true,
                                startScale: 1.0,
                                maxScale: 4,
                                minScale: .25,
                                scaleSpeed: 1.1
                            }

                            var blckDiv = this.$refs["blocklyDiv"]
                            this.blockly_woakspace = Blockly.inject(this.$refs["blocklyDiv"], tt);
                            console.log("Injection running !!!!!!!!!!!!!!!!")
                            console.log(this.blockly_woakspace)
                            this.loaded = true
                        }, 500)
                    }
                }
            }.bind(this)
            rawFile.send(null);
        },

        showCode() {
            console.log("Hello world code!!!!! b4")
            this.code = blocklyPython.workspaceToCode(this.blockly_woakspace);
            //blocklyPython.workspaceToCode(this.blockly_woakspace).then((returnVal) => {
            //    console.log(returnVal.data.data)
            //})

            console.log("Hello world code!!!!!")

            axios.post("run", {
                filename: this.$store.getters.getProjectDir + "/test1.py",
                data: this.code
            }).then((response) => {
                console.log(response.data)
                this.isProjectLoaded = true
                //this.url = "http://192.168.88.243:8080/stream?topic=/output/image_detected&type=ros_compressed"
                this.$refs['pyhonLoading'].show()
                /* setTimeout(() => {

                     this.url = "http://" + this.ipAddress + ":8080/stream?topic=/output/image_detected&type=ros_compressed"
                     //this.url = "http://0.0.0.0:8080/stream?topic=/output/image_detected&type=ros_compressed"
                     this.$refs.displayImage.src = this.url
                     this.$refs['pyhonLoading'].hide()
                     console.log(this.url)
                 }, 12000)*/

                var timerId, percent;
                percent = 0;
                timerId = setInterval(() => {

                    // increment progress bar
                    percent += 1;
                    console.log(percent)
                    this.value = percent

                    // complete
                    if (percent >= 24) {
                        clearInterval(timerId);
                        this.url = "http://" + this.ipAddress + ":8080/stream?topic=/output/image_detected&type=ros_compressed"
                        //this.url = "http://0.0.0.0:8080/stream?topic=/output/image_detected&type=ros_compressed"
                        this.$refs.displayImage.src = this.url
                        this.$refs['pyhonLoading'].hide()

                        console.log(this.url)

                    }

                }, 500);
                //this.url = "https://picsum.photos/250/250/?image=59"

            });
            console.log(this.code)
        },

        stopRun() {
            axios.post("stop", {
                filename: this.$store.getters.getProjectDir + "/test1.py",
                data: this.code
            }).then((response) => {
                console.log(response.data)
                this.isProjectLoaded = false
                //this.url = "http://" + this.ipAddress + ":8888/round_image_black_48dp.png"
                this.url = 'http://' + this.ipAddress + ':8080/stream?topic=/output/image_raw&type=ros_compressed';
                this.$refs.displayImage.src = this.url
            });
        },
        saveWorkspace() {
            var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)
            let domToPretty = Blockly.Xml.domToPrettyText(xml);
            axios.post("saveXML", {
                filename: this.$store.getters.getProjectDir + "/test1.xml",
                data: domToPretty
            }).then((response) => {
                console.log(response.data)
                //this.isProjectLoaded = true
            });
            console.log(xml)
        },
        loadWorkspace() {
            axios.post("getXML", {
                filename: this.$store.getters.getProjectDir + "/test1.xml"
            }).then((response) => {
                console.log(response.data)
                /*var xml = Blockly.Xml.textToDom(response.data)
                console.log(xml)
                Blockly.mainWorkspace.clear();
                Blockly.Xml.domToWorkspace(Blockly.workspace, xml)*/

                Blockly.mainWorkspace.clear();

                let textToDom = Blockly.Xml.textToDom(response.data);
                Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, textToDom);
                //console.log(xml)
                //this.isProjectLoaded = true
            });

        },
        linkProperties(route) {
            const routeName = route.name ? route.name : route;
            const externalRoute = this.externalRoutes.filter(r => r.name === routeName)[0];
            let url = externalRoute ? externalRoute.url : routeName;

            if (externalRoute || url.match(/^(http(s)?|ftp):\/\//)) {
                if (route.query) {
                    url = `${url}?${$.param(route.query)}`;
                }

                return {
                    is: 'a',
                    href: url,
                };
            }

            return {
                is: 'router-link',
                to: {
                    name: url,
                    query: route.query
                },
            };
        },
        
        onForward: function () {
            var x = 0;
            var y = 0;
            var z = 0;
            var pub = true;
            if (pub === true) {
                var twist = new ROSLIB.Message({
                    angular: {
                        x: 0,
                        y: 0,
                        z: z
                    },
                    linear: {
                        x: 0.1,
                        y: y,
                        z: z
                    }
                });
                console.log(twist);

                this.$store.getters.getCmdVel.publish(twist);
                //console.log(this.cmdVel);
            }
        },

        onBackward: function () {
            var x = 0;
            var y = 0;
            var z = 0;
            var pub = true;
            if (pub === true) {
                var twist = new ROSLIB.Message({
                    angular: {
                        x: 0,
                        y: 0,
                        z: z
                    },
                    linear: {
                        x: -0.1,
                        y: y,
                        z: z
                    }
                });
                console.log(twist);

                this.$store.getters.getCmdVel.publish(twist);
                //console.log(this.cmdVel);
            }
        },
        onLeft: function () {
            var x = 0;
            var y = 0;
            var z = 0;
            var pub = true;
            if (pub === true) {
                var twist = new ROSLIB.Message({
                    angular: {
                        x: 0,
                        y: 0,
                        z: -0.3
                    },
                    linear: {
                        x: 0.1,
                        y: y,
                        z: z
                    }
                });
                console.log(twist);

                this.$store.getters.getCmdVel.publish(twist);
                //console.log(this.cmdVel);
            }
        },

        onRight: function () {
            var x = 0;
            var y = 0;
            var z = 0;
            var pub = true;
            if (pub === true) {
                var twist = new ROSLIB.Message({
                    angular: {
                        x: 0,
                        y: 0,
                        z: 0.3
                    },
                    linear: {
                        x: 0.1,
                        y: y,
                        z: z
                    }
                });
                console.log(twist);

                this.$store.getters.getCmdVel.publish(twist);
                //console.log(this.cmdVel);
            }
        },
        onCCW: function () {
            var x = 0;
            var y = 0;
            var z = 0;
            var pub = true;
            if (pub === true) {
                var twist = new ROSLIB.Message({
                    angular: {
                        x: 0,
                        y: 0,
                        z: 0.3
                    },
                    linear: {
                        x: 0,
                        y: y,
                        z: z
                    }
                });
                console.log(twist);

                this.$store.getters.getCmdVel.publish(twist);
                //console.log(this.cmdVel);
            }
        },

        onCW: function () {
            var x = 0;
            var y = 0;
            var z = 0;
            var pub = true;
            if (pub === true) {
                var twist = new ROSLIB.Message({
                    angular: {
                        x: 0,
                        y: 0,
                        z: -0.3
                    },
                    linear: {
                        x: 0,
                        y: y,
                        z: z
                    }
                });
                console.log(twist);

                this.$store.getters.getCmdVel.publish(twist);
                //console.log(this.cmdVel);
            }
        },

        getBlock() {

        }
    },
    mounted() {

        /*axios.get("getIP", axios_options).then(response => {
            var ipAddress = response.data.IP
            let recaptchaScript = document.createElement('script')
            recaptchaScript.setAttribute('src', 'http://' + ipAddress + ':3000/getBlocksDefinition.js')
            document.head.appendChild(recaptchaScript)
        });*/

        this.$store.dispatch('regProjects')

        Blockly.readPythonFile = function (file) {
            var rawFile = new XMLHttpRequest();
            var code = "";
            rawFile.open("GET", file, false);
            rawFile.onreadystatechange = function () {
                var rr = JSON.parse(rawFile.responseText)
                if (rawFile.readyState === 4) {
                    if (rawFile.status === 200 || rawFile.status == 0) {
                        code = rr.data;
                    }
                }
            }
            rawFile.send(null);
            return code;
        };

        Blockly.Python['start_object_detector'] = function (block) {
            //var code = Blockly.readPythonFile("/getPython" + "?file=start_object_detector.py")
            //var code1 = code.toString().split("\n");
            //console.log("Split code")
            //code1.splice(6, 0, "\tcommand=\'rosrun kidbright_tpu tpu_detect.py\'");
            //var text = code1.join("\n");
            //console.log(this.$store.getters.getProjectDir )

            var cc = "import rosnode\nimport subprocess\nimport time\nimport os\nros_nodes = rosnode.get_node_names()\nif not \'/image_feature\' in ros_nodes:\n"
            cc = cc + "\tcommand=\'rosrun kidbright_tpu tpu_detect.py /home/pi/nodejs/kbclient/client/public/" + this.$store.getters.getProjectDir + "\'\n"
            cc = cc +  "\tprocess = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)\n\ttime.sleep(10) \n"        

            return cc;

        }.bind(this);

        Blockly.Python['init_ros_node'] = function (block) {
            var code = "from geometry_msgs.msg import Twist\nimport rospy\nrospy.init_node('get_center', anonymous=True)\nvelocity_publisher = rospy.Publisher('/cmd_vel', Twist, queue_size=1)\nvel_msg = Twist()\n"
            return code;

        };

        /*Blockly.Blocks['get_objects'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("Get objects");
                this.setOutput(true, null);
                this.setColour(230);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };*/

        Blockly.Blocks['get_objects'] = {
            init: function () {
                this.appendValueInput("Objs")
                    .appendField("Get objects");

                this.setPreviousStatement(true);
                this.setNextStatement(true);

                this.setColour(0);
                this.setTooltip('');
                this.setHelpUrl('');
            }
        };

        Blockly.Blocks['sumorobot_opponent'] = {
            init: function () {
                this.setColour("#0099E6");
                this.appendDummyInput().appendField('opponent');
                this.setOutput(true, 'Boolean');
            }
        };

        Blockly.Blocks['start_object_detector'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("Start object detector");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(230);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };

        Blockly.Blocks['init_ros_node'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("ROS node initialization");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(230);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };

        Blockly.Blocks['rospy_loop'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("ROS LOOP");
                this.appendStatementInput("DO")
                    .setCheck(null)
                    .setAlign(Blockly.ALIGN_RIGHT);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(230);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };

        Blockly.Blocks['get_object_attr'] = {
            init: function () {
                this.appendValueInput("VAR")
                    .setCheck(null)
                    .appendField("get")
                    .appendField(new Blockly.FieldDropdown([
                        ["cx", "cx"],
                        ["cy", "cy"],
                        ["width", "width"],
                        ["height", "height"],
                        ["label", "label"]
                    ]), "DATA_FIELD")
                    .appendField(" from");
                this.setOutput(true, null);
                this.setColour(230);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };

        Blockly.Blocks['set_velocity'] = {
            init: function () {
                this.appendDummyInput()
                    .appendField("move with ");
                this.appendDummyInput()
                    .appendField("linear velocity")
                    .appendField(new Blockly.FieldNumber(0), "LINEAR");
                this.appendDummyInput()
                    .appendField("angular velocity")
                    .appendField(new Blockly.FieldNumber(0), "ANGULAR");
                this.setInputsInline(true);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(230);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };

        Blockly.Python['set_velocity'] = function (block) {
            var number_linear = block.getFieldValue('LINEAR');
            var number_angular = block.getFieldValue('ANGULAR');
            var code = "vel_msg.linear.y = 0\nvel_msg.linear.z = 0\nvel_msg.angular.x = 0\nvel_msg.angular.y = 0\n"
            code = code + "vel_msg.linear.x = " + number_linear + "\n" + "vel_msg.angular.z = " + number_angular + "\n"
            code = code + "velocity_publisher.publish(vel_msg)\n"

            return code;
        };

        Blockly.Python['get_object_attr'] = function (block) {
            var dropdown_data_field = block.getFieldValue('DATA_FIELD');
            var value_var = Blockly.Python.valueToCode(block, 'VAR', Blockly.Python.ORDER_ATOMIC);
            // TODO: Assemble Python into code variable.
            console.log(block.getFieldValue('DATA_FIELD'));
            var code = value_var + "." + block.getFieldValue('DATA_FIELD');
            // TODO: Change ORDER_NONE to the correct strength.
            return [code, Blockly.Python.ORDER_NONE];
        };

        Blockly.Python['rospy_loop'] = function (block) {
            var statements_name = Blockly.Python.statementToCode(block, 'NAME');
            // TODO: Assemble Python into code variable.
            var branch = Blockly.Python.statementToCode(block, 'DO');
            branch = Blockly.Python.addLoopTrap(branch, block) || Blockly.Python.PASS;
            var code = 'while not rospy.is_shutdown():\n' + branch;
            return code;
        };

        Blockly.Python['get_objects'] = function (block) {
            // TODO: Assemble Python into code variable.
            var code = "import roslib\nimport rospy\nfrom kidbright_tpu.msg import tpu_object\nfrom kidbright_tpu.msg import tpu_objects \n"
            //code = code + "rospy.wait_for_message('/tpu_objects', tpu_objects, timeout=4)\n";
            // TODO: Change ORDER_NONE to the correct strength.
            //return [code, Blockly.Python.ORDER_NONE];

            var varName = Blockly.Python.valueToCode(block, 'Objs', Blockly.Python.ORDER_ATOMIC);

            //var code = "";
            //code += Blockly.readPythonFile("../blockly/generators/python/scripts/brain/get_laser.py");
            return code + varName + " = rospy.wait_for_message('/tpu_objects', tpu_objects, timeout=4).tpu_objects\n"
        };

        //this.renderBlocly()
        axios.get("getIP", axios_options).then(response => {
            this.ipAddress = response.data.IP
            console.log("ROS IP = " + this.ipAddress);
            //this.url = "http://" + this.ipAddress + ":8888/image640.png"
            this.url = 'http://' + this.ipAddress + ':8080/stream?topic=/output/image_raw&type=ros_compressed';
            this.$refs.displayImage.src = this.url
        });

        this.cmdVel = this.$store.getters.getCmdVel

    },
    computed: {
        ...mapGetters([
            'getProjectDir',
            'getProjects',
            'getImages',
            'getProjectStatus',
            'getCmdVel'
        ]),
        getImgSrc: function () {
            return this.url
        },

        /*
        getImgSrc: function () {
            return this.imgSrc
        }*/

    },
    props: {
        msg: String,
    },
};
</script>

<style scoped>
/* RESET */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.container {
    max-width: 100%;
    min-width: 100%;
    max-height: 100%;
    min-height: 100%;
    margin: 0px auto;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.9em;
    color: #888;
}

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}

html,
body {
    margin: 0;
}

#blocklyDiv {
    position: absolute;
    height: 100%;
    width: 100%;
    margin-left: 33.33%;
}
</style>
