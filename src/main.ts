import { PluginObject } from "vue";
import Vue from "vue";
import ComponentSandbox from "./ComponentSandbox.vue";

const VueComponentSandbox: PluginObject<void> = {
  install(vue: typeof Vue) {
    vue.component("v-component-sandbox", ComponentSandbox);
  }
};
export const VComponentSandbox = ComponentSandbox;
export default VueComponentSandbox;
export { NodeTree, makeNodeTree } from "@sterashima/vue-component-render";
