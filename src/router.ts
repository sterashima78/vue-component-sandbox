import Vue, { VueConstructor, ComponentOptions } from "vue";
import VueRouter, { Route, RouteConfig } from "vue-router";
import { LocalNodeState, RendererFactory, RouteNodes } from "./type";
import { klona } from "klona/json";

export const routing = (router: Pick<VueRouter, "push" | "currentRoute">) => (
  path: string | undefined
) => {
  if (path === undefined || path === router.currentRoute.path) return;
  router.push({ path });
};


const pathToRoute = (
  Vue: VueConstructor<Vue>,
  rendererFactory: RendererFactory,
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

export const toRouteByPathFactory = (
  store: LocalNodeState,
  Vue: VueConstructor<Vue>,
  rendererFactory: RendererFactory
) => pathToRoute(Vue, rendererFactory, store);

export const createRoute = (
  Vue: VueConstructor<Vue>,
  store: LocalNodeState,
  Router: typeof VueRouter,
  rendererFactory: RendererFactory
) => {
  const routes: RouteConfig[] = Object.keys(store.node).map(
    toRouteByPathFactory(store, Vue, rendererFactory)
  );
  const router = new Router({ routes });
  return router;
};

export const getNewPath = (before: string[], after: string[]) => {
  if (before.length === after.length) return "";
  if (before.length > after.length) return "";
  const diff = after.filter(i => !before.includes(i));
  return diff.length === 0 ? "" : diff[0];
};

export const updateRoute = (
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