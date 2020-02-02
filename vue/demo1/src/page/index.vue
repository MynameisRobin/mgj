<template>
    <div class="home">
        <div>{{ name }}</div>
    </div>
</template>

<script>
    // import findIndex from "lodash.findindex";
    export default {
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
        }
    };
</script>

<style lang="less">
    .home {
        font-size: 12px;
    }
</style>
