<template>
    <div class="smallTool">
        <h1>多人拼单小工具</h1>
        <el-form ref="form" :model="form" label-width="100px" class="form">
            <el-form-item
                class="textLeft"
                v-for="(item, index) in form.customerList"
                :label="'客户'+index"
                :key="item.key"
                :rules="{required: true, message: '金额不能为空', trigger: 'blur'}"
            >
                <el-input type="number" v-model="item.money" placeholder="请输入支付金额"></el-input>
                <el-button @click.prevent="onDeleteCustomer(item)">删除</el-button>
            </el-form-item>
            <el-form-item class="textLeft">
                <el-button @click.prevent="onAddCustomer">添加</el-button>
            </el-form-item>
            <el-form-item class="textLeft" label="活动规则">
                <div>
                    <span class="mr5">满</span>
                    <el-input type="number" v-model="form.fullMoney" class="smallInput"></el-input>
                    <span class="mr5">减</span>
                    <el-input type="number" v-model="form.minusMoney" class="smallInput"></el-input>
                </div>
            </el-form-item>
            <el-form-item class="textLeft" label="配送费">
                <el-input type="number" v-model="form.deliveryMoney" placeholder="请输入配送费"></el-input>
            </el-form-item>
            <el-form-item class="textLeft">
                <el-button type="primary" @click="onSubmit">确认</el-button>
                <el-button @click="onReset">重置</el-button>
            </el-form-item>
            <el-form-item label="实付总额：" class="textLeft mt50" v-if="form.resultFlag">
                <div>￥{{ form.sum }}</div>
            </el-form-item>
            <el-form-item
                class="textLeft"
                :label="'客户'+index + '实付：'"
                v-for="(item, index) in form.customerList"
                :key="item.key"
                v-if="form.resultFlag"
            >
                <div>￥{{ item.result || '' }}</div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: "Index",
    data() {
        return {
            form: {
                customerList: [
                    {
                        result: "", // 实付金额
                        money: "", // 支付金额
                        rate: 0, // 占比
                        key: Date.now()
                    }
                ],
                sum: "", // 总额
                fullMoney: "", // 满多少
                minusMoney: "", // 减多少
                deliveryMoney: "", // 配送费
                resultFlag: false // 输出结果标记
            }
        };
    },
    mounted() {},
    methods: {
        onAddCustomer() {
            this.form.customerList.push({
                label: "A", // 支付人名称
                result: "", // 实付金额
                money: "", // 支付金额
                rate: 0, // 占比
                key: Date.now()
            });
        },
        onDeleteCustomer(item) {
            var index = this.form.customerList.indexOf(item);
            if (index !== -1) {
                this.form.customerList.splice(index, 1);
            }
        },
        // 计算
        count() {
            let customerList = this.form.customerList;
            var sum = customerList.reduce(function(prev, cur) {
                return cur.money*1 + prev;
            }, 0);
            // (总价 - 满减 + 配送费) * (支付金额 / 总价) = 实际支付金额
            if (sum >= this.form.fullMoney) {
                this.form.sum = sum - this.form.minusMoney * 1;
            } else {
                this.$message({
                    type: "warning",
                    message: "拼单总额不满足活动规则"
                });
                this.form.sum = sum;
            }
            customerList.map(v => {
                v.rate = v.money / sum;
                v.result = this.round(
                    this.form.sum * v.rate + this.form.deliveryMoney / customerList.length
                );
            });
        },
        // 四舍五入保留两位
        round(money) {
            return Math.round(money * 100) / 100;
        },
        check() {
            this.form.resultFlag = false;
            const exp = /^(\d+\.\d{1,2}|\d+)$/;
            if (!exp.test(this.form.fullMoney)) {
                this.$message({
                    type: "error",
                    message: "请填写正确的活动规则"
                });
                return false;
            } else if (!exp.test(this.form.minusMoney)) {
                this.$message({
                    type: "error",
                    message: "请填写正确的活动规则"
                });
                return false;
            } else if (!exp.test(this.form.deliveryMoney)) {
                this.$message({
                    type: "error",
                    message: "请填写正常配送费"
                });
                return false;
            }
            return true;
        },
        // 点击确定提交
        onSubmit() {
            if (!this.check()) {
                return false;
            }
            this.form.resultFlag = true;
            this.count();
        },
        // 点击重置清空
        onReset() {
            this.form = {
                customerList: [
                    {
                        label: "客户A", // 支付人名称
                        result: "", // 实付金额
                        money: "", // 支付金额
                        rate: 0,
                        key: Date.now()
                    }
                ],
                sum: "", // 总额
                fullMoney: "", // 满多少
                minusMoney: "", // 减多少
                deliveryMoney: "", // 配送费
                resultFlag: false // 输出结果标记
            };
        }
    }
};
</script>

<style lang="less">
.smallTool {
    padding: 20px;
    text-align: center;
    h1 {
        font-size: 24px;
        color: #333;
        text-align: center;
        margin-bottom: 50px;
    }
    .form {
        display: inline-block;
    }
    .tip {
        color: red;
    }
    .el-input {
        width: 220px;
    }
    .el-input__inner {
    }
    .smallInput {
        width: 84px;
        display: inline-block;
        .el-input__inner {
            width: 100%;
        }
    }
    .el-form-item__label {
        text-align: left;
    }
    .mt50 {
        margin-top: 50px;
    }
    .mr5 {
        margin-right: 5px;
    }
    .textLeft {
        text-align: left;
    }
}
</style>