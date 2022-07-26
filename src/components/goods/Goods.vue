<template>
  <div class=''>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input clearable placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goToAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140">
          <template v-slot="scope">
            {{scope.row.add_time | timerFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template v-slot="scope">
            <el-tooltip :enterable="false" class="item" effect="dark" content="编辑" placement="top-start">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="editGoodsDialog(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" class="item" effect="dark" content="删除" placement="top-start">
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteGoodsDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <!-- 改写 -->
      <pagination :total="total" :queryInfo="queryInfo" :get-data="getGoodsList"></pagination>

      <!-- 编辑对话框 -->
      <el-dialog
        title="修改商品数据"
        :visible.sync="editGoodsDialogVisible"
        width="50%"
        @close="resetEditGoodsDialog">
        <el-form :model="editGoodsForm" :rules="editGoodsFormRules" ref="editGoodsFormRef" label-width="100px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editGoodsForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="editGoodsForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="editGoodsForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editGoodsForm.goods_weight"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editGoodsConfirm">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import request from '../../network/request'
import Pagination from '../other/Pagination.vue'
export default {
  name: 'Goods',
  components: {
    Pagination
  },
  data () {
    return {
      //商品列表
      goodsList: [],
      //请求参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      //总条数
      total: 0,
      //点击控制编辑商品对话框的显示与隐藏
      editGoodsDialogVisible: false,
      //编辑商品对象
      editGoodsForm: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: ''
      },
      //编辑商品校验规则对象
      editGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入要修改的商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入要修改的商品价格', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入要修改的商品数量', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入要修改的商品重量', trigger: 'blur' },
        ]
      },
      //商品id
      goodsId: ''
    };
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //获取商品数据
    async getGoodsList() {
      const {data: res} = await request({
        url: 'goods',
        params: this.queryInfo
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败!')
      }
      console.log('获取商品列表数据成功!');
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    //点击控制编辑商品对话框的显示与隐藏
    async editGoodsDialog(row) {
      // console.log(row);
      this.goodsId = row.goods_id;
      // console.log(this.goodsId);
      //先根据id获取商品数据
      const {data: res} = await request({
        url: `goods/${row.goods_id}`
      })
      console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败!')
      }
      console.log('获取商品数据成功!');
      this.editGoodsForm = res.data;

      this.editGoodsDialogVisible = true;
    },
    //重置编辑商品表单
    resetEditGoodsDialog() {
      this.$refs.editGoodsFormRef.resetFields()
    },
    //确认修改商品数据
    editGoodsConfirm() {
      this.$refs.editGoodsFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) return;

        const {data: res} = await request({
          url: `goods/${this.goodsId}`,
          method: 'put',
          data: this.editGoodsForm
        })
        // console.log(res);
        if(res.meta.status !== 200) {
          return this.$message.error('修改商品信息数据失败!')
        }
        console.log('修改商品信息数据成功!');
        this.getGoodsList()
        this.editGoodsDialogVisible = false;
      })
    },
    //删除商品
    async deleteGoodsDialog(row) {
      const result = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(result);
      if(result !== 'confirm') {
        return this.$message.info('取消了删除商品的操作!')
      }
      //发送请求
      const {data: res} = await request({
        url: `goods/${row.goods_id}`,
        method: 'delete'
      })
      console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('删除商品数据失败!')
      }
      console.log('删除商品数据成功!');
      this.getGoodsList();
    },
    //点击跳转到添加商品页面
    goToAddGoods() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang='less' scoped>
  
</style>