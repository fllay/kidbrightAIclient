<template>
<div>

    <div id="blocklyDiv" ref="blocklyDiv">
    </div>
    <xml ref="toolbox" style="display: none">
        <category name="Logic" colour="%{BKY_LOGIC_HUE}">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
            <block type="logic_operation"></block>
            <block type="logic_negate"></block>
            <block type="logic_boolean"></block>
        </category>
        <category name="Loops" colour="%{BKY_LOOPS_HUE}">
            <block type="controls_repeat_ext">
                <value name="TIMES">
                    <block type="math_number">
                        <field name="NUM">10</field>
                    </block>
                </value>
            </block>
            <block type="controls_whileUntil"></block>
        </category>
        <category name="Math" colour="%{BKY_MATH_HUE}">
            <block type="math_number">
                <field name="NUM">123</field>
            </block>
            <block type="math_arithmetic"></block>
            <block type="math_single"></block>
        </category>
        <category name="Text" colour="%{BKY_TEXTS_HUE}">
            <block type="text"></block>
            <block type="text_length"></block>
            <block type="text_print"></block>
        </category>
        <category name="Variables" custom="VARIABLE" colour="%{BKY_VARIABLES_HUE}">
        </category>

    </xml>
</div>
</template>

<script>
/**
 * @license
 * 
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blockly Vue Component.
 * @author samelh@google.com (Sam El-Husseini)
 */

import Blockly from 'blockly';

export default {
    name: 'BlocklyComponent',
    data() {
        return {
            workspace: null
        }
    },
    mounted() {
        setTimeout(() => {
            //alert("Hello blockly")
            var tt = {}
            tt.toolbox = this.$refs["toolbox"]
            var blckDiv = this.$refs["blocklyDiv"]
            this.workspace = Blockly.inject(this.$refs["blocklyDiv"], tt);
            console.log("Injection running !!!!!!!!!!!!!!!!")
        }, 500)

    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style scoped>
#blocklyDiv {
    position: absolute;
    height: 100%;
    width: 100%;
}

.fullHeight {
    height: 100%;
    background: rebeccapurple;
}
</style>
