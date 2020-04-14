<template>
    <div class="home">
        <div>{{ name }}</div>
        <hello></hello>
    </div>
</template>

<script>
/* eslint-disable */
import hello from "../components/HelloWorld";
// import findIndex from "lodash.findindex";
export default {
    components: {
        hello
    },
    data() {
        return {
            name: 123,
            arr: [1, 2, 3]
        };
    },
    created() {
        console.log(123);
    },
    methods: {
        find() {}
    },
    computed: {},
    watch: {}
};
</script>

<style lang="less">
.home {
    font-size: 12px;
}
</style>
