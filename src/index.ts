import {
  nodeDataConverterFactory,
  nodeRenderFactory
} from "@sterashima/vue-component-render";

import {
  routing,
  createRoute,
  updateRoute,
  toRouteByPathFactory
} from "./router";
import Vue, { VueConstructor, ComponentOptions } from "vue";
import VueRouter, { Route } from "vue-router";
import { klona } from "klona/json";
import { Ref, SetupContext, watch } from "@vue/composition-api";
import {
  PreProcess,
  LocalNodeState,
  RouteNodes,
  IframeWindow,
  LoadedIframeWindow
} from "./type";

export const waitLoad = async (w: IframeWindow) =>
  new Promise<LoadedIframeWindow>(r => {
    if (w.Vue === undefined)
      return setTimeout(async () => {
        const options = await waitLoad(w);
        r(options);
      }, 100);
    r(w as LoadedIframeWindow);
  });

export const createLocalState = (
  Vue: VueConstructor<Vue>,
  nodes: Ref<RouteNodes>
) =>
  Vue.observable<LocalNodeState>({
    node: klona(nodes.value)
  });

export const getComponentsFromVue = (Vue: VueConstructor<Vue>) =>
  //@ts-expect-error
  Object.keys(Vue?.options?.components || {});

const createInstance = (
  Vue: VueConstructor<Vue>,
  VueOption: ComponentOptions<Vue>,
  router: VueRouter
) => {
  const CustomVue = VueOption ? Vue.extend(VueOption) : Vue;
  return new CustomVue({
    el: "#main-wrapper",
    router
  });
};

export const loadedFactory = (
  converterFactory: typeof nodeDataConverterFactory,
  createRendererFactory: typeof nodeRenderFactory,
  getComponents: typeof getComponentsFromVue
) => (
  nodes: Ref<RouteNodes>,
  path: Ref<string>,
  installer: (Vue: VueConstructor<Vue>) => void,
  preprocess: PreProcess,
  emit: SetupContext["emit"]
) => async (w: IframeWindow) => {
  const loadedWindow = await waitLoad(w);
  installer(loadedWindow.Vue);

  const localState = createLocalState(loadedWindow.Vue, nodes);

  const converter = converterFactory(preprocess);
  const rendererFactory = createRendererFactory(converter);

  const router = createRoute(
    loadedWindow.Vue,
    localState,
    loadedWindow.VueRouter,
    rendererFactory
  );
  watch(path, routing(router));
  router.afterEach((to: Route) => {
    emit("update:path", to.path);
  });

  watch(
    nodes,
    updateRoute(
      router,
      toRouteByPathFactory(localState, loadedWindow.Vue, rendererFactory),
      localState
    ),
    {
      immediate: true
    }
  );

  loadedWindow.vm = createInstance(
    loadedWindow.Vue,
    loadedWindow.VueOption,
    router
  );
  emit("loaded", {
    components: getComponents(loadedWindow.Vue)
  });
  loadedWindow.dispatchEvent(new Event("createdVue"));
};

const loaded = loadedFactory(
  nodeDataConverterFactory,
  nodeRenderFactory,
  getComponentsFromVue
);

export const useSandbox = (
  nodes: Ref<RouteNodes>,
  path: Ref<string>,
  installer: (Vue: VueConstructor<Vue>) => void,
  preprocess: PreProcess,
  emit: SetupContext["emit"]
) => {
  return {
    loaded: loaded(nodes, path, installer, preprocess, emit)
  };
};
