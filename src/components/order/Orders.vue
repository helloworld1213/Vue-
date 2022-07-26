<template>
  <div class=''>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb> 
    <!-- 卡片视图区域 --> 
    <el-card>
      <!-- 搜索框区域 -->
      <!-- <search-input :parentData="queryInfo.query" :parentURL="propsURL"></search-input> -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- table区域 -->
      <el-table :data="ordersList" stripe border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="220"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template v-slot="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success" size="mini">已付款</el-tag>
            <el-tag v-else type="warning" size="mini">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template v-slot="scope">
            {{scope.row.create_time | timerFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-tooltip :enterable="false" class="item" effect="dark" content="编辑" placement="top">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialog(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" class="item" effect="dark" content="位置" placement="top">
              <el-button type="success" icon="el-icon-location" size="mini" @click="locationDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <pagination :queryInfo="queryInfo" :total="total" :get-data="getOrdersList"></pagination>

      <!-- 编辑对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="editAddrDialogVisible"
        width="50%"
        @close="resetEditAddrDialog">
        <el-form :model="editForm" :rules="editFormRrules" ref="editFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="addr1">
            <!-- 级联选择器 -->
            <el-cascader
              ref="cascaderRef"
              v-model="selectedKeys"
              :options="cityData"
              :props="propsObj"
              @change="handleChange">
            </el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="addr2">
            <el-input v-model="editForm.addr2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editAddrDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editAddrDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 物流进度对话框 -->
      <el-dialog
        title="物流进度"
        :visible.sync="logisticsDialogVisible"
        width="50%">
        <el-timeline :reverse="true">
          <el-timeline-item
            v-for="(activity, index) in logistics"
            :key="index"
            :timestamp="activity.time">
            {{ activity.context }}
          </el-timeline-item>
        </el-timeline>
        <span slot="footer" class="dialog-footer">
          <el-button @click="logisticsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="logisticsDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import Pagination from '../other/Pagination.vue'
import request from '../../network/request'
import cityData from './citydata'
import logistics from './logistics'
export default {
  name: 'Orders',
  components: {
    Pagination,
  },
  data () {
    return {
      //单选框默认值
      radio: 3,
      //订单数据列表
      ordersList: [],
      //查询参数对象
      queryInfo: {
        query: '',
        pagesize: 5,
        pagenum: 1
      },
      //总条数
      total: 0,
      //搜索框请求路径对象
      propsURL: {
        url: 'orders',
        params: this.queryInfo
      },
      //校验对象
      editForm: {
        addr1: '',
        addr2: ''
      },
      //校验规则
      editFormRrules: {
        addr1: [
          { required: true, message: '请选择地址', trigger: 'blur' },
        ],
        addr2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
      },
      dialogVisible: '',
      //级联选择器数据来源项
      cityData,
      //级联选择器配置对象
      propsObj: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'value',
        label: 'label',
        children: 'children',
      },
      //级联选择器选中项的数组
      selectedKeys: [],
      //控制位置对话框的显示与隐藏
      // locationDialogVisible: false,
      //物流信息(接口失效了,所以这里暂时写死)
      logistics,
      //控制修改地址对话框的显示与隐藏
      editAddrDialogVisible: false,
      //控制物流进度对话框的显示与隐藏
      logisticsDialogVisible: false,

    };
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    //获取订单列表数据
    async getOrdersList() {
      const {data: res} = await request({
        url: 'orders',
        params: this.queryInfo
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败!')
      }
      console.log('获取订单列表成功!');
      this.ordersList = res.data.goods;
      this.total = res.data.total;
    },
    //编辑对话框的显示与隐藏
    editDialog() {

      this.editAddrDialogVisible = true;
    },
    //重置编辑对话框
    resetEditAddrDialog() {
      this.$refs.editFormRef.resetFields()
      this.selectedKeys = []
    },
    //位置对话框的显示与隐藏
    locationDialog(row) {
      //获取物流信息(不求了,接口失效了)
      // const {data: res} = await request({
      //   url: `/kuaidi/row.order_id`
      // })
      // console.log(res);

      this.logisticsDialogVisible = true;
    },
    //级联选择器选中项发生变化
    handleChange() {
      //关闭级联选择器
      this.$refs.cascaderRef.dropDownVisible = false;
    }
  },
}
</script>

<style lang='less' scoped>
  .el-cascader {
    width: 100%;
  }
</style>