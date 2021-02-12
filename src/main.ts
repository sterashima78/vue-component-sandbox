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
export {
  NodeData,
  NodeTree,
  Installer,
  PreProcess,
  RouteNodes,
  EleNode
} from "./type";
export { makeNodeTree } from "@sterashima/vue-component-render";
