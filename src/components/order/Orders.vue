<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="200px"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货">否</el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
              @click="addEditDialog"></el-button>
            <el-button size="mini" type="success"
             icon="el-icon-location" @click="addProgressDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 编辑对话框弹出 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="adressDialogClosed">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityDate" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%">
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityDate from '../../assets/citydata/citydata.js'
export default {
  name: 'Orders',
  data() {
    return {
      //请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      //订单列表数据
      orderList: [],
      //编辑对话框的显示与隐藏
      addressDialogVisible: false,
      //绑定的数据
      addressForm: {
        address1: [],
        address2: ''
      },
      //拿到的城市名(外部引入)
      cityDate,
      //物流进度对话框的显示与隐藏
      progressDialogVisible: false,
      //物流信息
      progressInfo: [],
      //校验规则
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
      }
    }
  },
  created() {
    this.getOrdersList();
  },
  methods: {
    async getOrdersList() {
      // console.log('111');
      const {data: res} = await this.$http.get('orders', {
        params: this.queryInfo
      });
      if(res.meta.status !== 200) {
        return this.$message.error("请求订单数据失败");
      }else {
        // console.log(res.data);
        this.orderList = res.data.goods;
        this.total = res.data.total;
      }
    },
    //页面条数改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrdersList();
    },
    //页面改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrdersList();
    },
    //添加编辑对话框
    addEditDialog() {
      // console.log('111');
      this.addressDialogVisible = true;
    },
    //监听对话框的关闭事件
    adressDialogClosed() {
      this.$refs.addressFormRef.resetFields();
      // this.addressDialogVisible = false
    },
    //点击展示物流进度对话框
    addProgressDialog() {
    //   const {data: res} = await this.$http.get('/kuaidi/')
    //   if(res.meta.status !== 200) {
    //     return this.$message.error("获取物流信息失败");
    //   }else {
    //     console.log(res.data);
        this.progressInfo = res.data;
    //   this.progressDialogVisible = true;
        console.log(this.progressInfo);
    //   }

    }
  }
}
</script>

<style lang="less" scope>
  .el-cascader {
    width: 100%;
  }
</style>