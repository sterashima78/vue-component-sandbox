# @sterashima/vue-component-sandbox

## Example
```
<meta charset="utf-8" />
<title>vue-component-sandbox demo</title>
<script src="https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@vue/composition-api@1.0.0-rc.1"></script>
<script src="./vue-component-sandbox.umd.js"></script>
<style>
  #app {
    width: 100vw;
    height: 100vh;
  }
</style>
<template id="script">
  window.VueOption = { vuetify: new Vuetify() }
  window.addEventListener("createdVue", ()=> console.log("[Inner iframe]: VM",
  window.vm))
</template>
<div id="app">
  <button @click="path='/a'" :disabled="path === '/a'">to /a</button>
  <button @click="path='/'" :disabled="path === '/'">to /</button>
  <v-component-sandbox
    :script="script"
    :scripts="scripts"
    :styles="styles"
    :nodes="nodes"
    :path.sync="path"
    :preprocess="preprocess"
    @loaded="log"
  />
</div>
<script>
  console.log(window["vue-component-sandbox"]);
  const make = window["vue-component-sandbox"].makeNodeTree;
  const VComponentSandbox = window["vue-component-sandbox"].VComponentSandbox;
  const data1 = make({ tag: "v-app" }, [
    make({ tag: "v-main" }, [
      make({ tag: "v-container" }, [
        "Hello world1",
        make(
          {
            tag: "router-link",
            attributes: {
              to: "/a",
            },
          },
          ["to /a"]
        ),
      ]),
    ]),
  ]);
  const data2 = make({ tag: "v-app" }, [
    make({ tag: "v-main" }, [
      make({ tag: "v-container" }, [
        "Hello world2",
        make(
          {
            tag: "router-link",
            attributes: {
              to: "/",
            },
          },
          ["to /"]
        ),
      ]),
    ]),
  ]);
  console.log(data1, data2);
  const vue = new Vue({
    el: "#app",
    components: {
      VComponentSandbox,
    },
    methods: {
      log: console.log,
    },
    mounted(){
      setInterval(()=> {
        this.nodes = {
          "/": this.nodes["/a"],
          "/a": this.nodes["/"],
        }
      }, 1000)
    },
    data() {
      return {
        script: document.getElementById("script").content.textContent,
        scripts: [
          "https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.js",
          "https://unpkg.com/vue-router@3.5.1/dist/vue-router.js",
          "https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.js",
        ],
        styles: [
          "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900",
          "https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css",
          "https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css",
        ],
        nodes: {
          "/": data1,
          "/a": data2,
        },
        path: "/",
        preprocess(data) {
          return {
            tag: data.tag,
            data: {
              ...data.data,
              style: {
                ...data.data.style,
                border: "solid red 1px"
              }
            },
          };
        },
      };
    },
  });
</script>
```