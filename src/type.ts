import {
  NodeTree,
  nodeRenderFactory,
  NodeData
} from "@sterashima/vue-component-render";
import Vue, { VueConstructor, ComponentOptions } from "vue";
import VueRouter from "vue-router";

export type RouteNodes = {
  [path: string]: NodeTree;
};

export type LocalNodeState = {
  node: RouteNodes;
};

export type RendererFactory = ReturnType<typeof nodeRenderFactory>

export type VueProps = {
  Vue?: VueConstructor<Vue>;
  vm: Vue;
  VueOption: ComponentOptions<Vue>;
  VueRouter: typeof VueRouter;
};
export type IframeWindow = Window & VueProps;
export type LoadedIframeWindow = Window & Required<VueProps>;
export type PreProcess = (before: NodeData) => NodeData;
export type Installer = (Vue: VueConstructor<Vue>) => void
export { NodeData } from "@sterashima/vue-component-render"