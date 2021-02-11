<template>
  <VIframeSandbox
    style="width: 100%;height: 100%;"
    body="<div id='main-wrapper' style='height: 100%;'><router-view /></div>"
    :script="script"
    :scriptsSrc="scripts"
    :styles="css"
    :cssLinks="styles"
    @loaded="loaded"
  />
</template>
<script lang="ts">
import { PropType, defineComponent, toRef } from "@vue/composition-api";
import Vue, { VueConstructor } from "vue";
import { VIframeSandbox } from "vue-iframe-sandbox";
import { RouteNodes, useSandbox } from ".";
import { NodeData } from "@sterashima/vue-component-render";

export default defineComponent({
  props: {
    script: {
      type: String as PropType<string>,
      default: ""
    },
    css: {
      type: String as PropType<string>,
      default: ""
    },
    scripts: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    styles: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    installer: {
      type: Function as PropType<(Vue: VueConstructor<Vue>) => void>,
      default: () => undefined
    },
    nodes: {
      type: Object as PropType<RouteNodes>,
      default: () => ({})
    },
    preprocess: {
      type: Function as PropType<(before: NodeData) => NodeData>,
      default: (v: NodeData) => v
    },
    path: {
      type: String as PropType<string>,
      default: ""
    }
  },
  components: {
    VIframeSandbox
  },
  setup(props, { emit }) {
    const nodes = toRef(props, "nodes");
    const path = toRef(props, "path");
    return useSandbox(nodes, path, props.installer, props.preprocess, emit);
  }
});
</script>
