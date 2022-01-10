<template>
  <div>
    <p>{{ this.$store.state.num }}</p>

    <p>{{ this.$store.getters.filterNum }}</p>

    <div>
      <button @click="mutationAddNum(1)">同步增加</button>
      <button @click="mutationReduceNum(1)">同步减少</button>
    </div>
    <div style="margin-top: 20px">
      <button @click="actionAddNum(2)">异步增加</button>
      <button @click="actionReduceNum(2)">异步减少</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "vuex-demo",
  data() {
    return {};
  },
  methods: {
    mutationAddNum(payload) {
      this.$store.commit("add", payload);
    },
    mutationReduceNum(payload) {
      this.$store.commit("reduce", payload);
    },
    actionAddNum(payload) {
      this.$store.dispatch("asyncAdd", payload);
    },
    actionReduceNum(payload) {
      this.$store.dispatch("asyncReduce", payload);
    },
  },
};
</script>

<style scoped>
</style>

