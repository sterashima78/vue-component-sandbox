import {
  NodeTree,
  nodeDataConverterFactory,
  nodeRenderFactory,
  NodeData
} from "@sterashima/vue-component-render";

import Vue, { VueConstructor } from "vue";
import VueRouter, { Route, RouteConfig } from "vue-router";
import { klona } from "klona/json";
import { Ref, SetupContext, toRaw, watch } from "@vue/composition-api";
import { ComponentOptions } from "vue/types/umd";
export type RouteNodes = {
  [path: string]: NodeTree;
};

export type PreProcess = (before: NodeData) => NodeData;

type LocalNodeState = {
  node: RouteNodes;
};

type VueProps = {
  Vue?: VueConstructor<Vue>;
  vm: Vue;
  VueOption: ComponentOptions<Vue>;
  VueRouter: typeof VueRouter;
};
export type IframeWindow = Window & VueProps;
type LoadedIframeWindow = Window & Required<VueProps>;

export const waitLoad = async (w: IframeWindow) =>
  new Promise<LoadedIframeWindow>(r => {
    if (w.Vue === undefined)
      return setTimeout(async () => {
        const options = await waitLoad(w);
        r(options);
      }, 100);
    r(w as LoadedIframeWindow);
  });

export const createLocalState = (nodes: Ref<RouteNodes>) =>
  Vue.observable<LocalNodeState>({
    node: klona(toRaw(nodes.value))
  });

export const getComponentsFromVue = (Vue: VueConstructor<Vue>) =>
  //@ts-expect-error
  Object.keys(Vue?.options?.components || {});

const pathToRoute = (
  Vue: VueConstructor<Vue>,
  rendererFactory: ReturnType<typeof nodeRenderFactory>,
  store: LocalNodeState
) => (path: string) => ({
  path,
  component: Vue.extend({
    render(h) {
      const renderer = rendererFactory(h);
      return renderer(store.node[path]);
    }
  })
});

const toRouteByPathFactory = (
  store: LocalNodeState,
  Vue: VueConstructor<Vue>,
  rendererFactory: ReturnType<typeof nodeRenderFactory>
) => pathToRoute(Vue, rendererFactory, store);

const createRoute = (
  Vue: VueConstructor<Vue>,
  store: LocalNodeState,
  Router: typeof VueRouter,
  rendererFactory: ReturnType<typeof nodeRenderFactory>
) => {
  const routes: RouteConfig[] = Object.keys(store.node).map(
    toRouteByPathFactory(store, Vue, rendererFactory)
  );
  const router = new Router({ routes });
  return router;
};

const routing = (router: Pick<VueRouter, "push" | "currentRoute">) => (
  path: string | undefined
) => {
  if (path === undefined || path === router.currentRoute.path) return;
  router.push({ path });
};

const getNewPath = (before: string[], after: string[]) => {
  if (before.length === after.length) return "";
  if (before.length > after.length) return "";
  const diff = after.filter(i => !before.includes(i));
  return diff.length === 0 ? "" : diff[0];
};

const updateRoute = (
  router: VueRouter,
  toRouteByPath: ReturnType<typeof pathToRoute>,
  store: LocalNodeState
) => (now: RouteNodes | undefined, before: RouteNodes | undefined) => {
  if (now === undefined) return;
  store.node = klona(now);
  if (before === undefined) return;
  const addedPath = getNewPath(Object.keys(before), Object.keys(now));
  if (addedPath === "") return;
  router.addRoutes([toRouteByPath(addedPath)]);
};

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

  const localState = createLocalState(nodes);

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
      toRouteByPathFactory(localState, Vue, rendererFactory),
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

export { NodeTree, makeNodeTree } from "@sterashima/vue-component-render";
