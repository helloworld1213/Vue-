<template>
  <div class=''>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb> 
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <table-tree :data="categoryList" :columns="columns"
        :selection-type="false" border :expand-type="false"
        show-index index-text="#">
        <!-- 是否删除 -->
        <template slot="isOk" slot-scope="scope"> 
          <i v-if="scope.row.cat_deleted === false" class="el-icon-success" style="color: lightgreen"></i>
          <i v-else class="el-icon-error" style="color: red"></i>
        </template>
        <!-- 排序 --> 
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" type="primary" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success" size="mini">二级</el-tag>
          <el-tag v-else type="warning" size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="options" slot-scope="scope">
          <el-tooltip :enterable="false" class="item" effect="dark" content="编辑" placement="top-start">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCateDialog(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip :enterable="false" class="item" effect="dark" content="删除" placement="top-start">
            <el-button icon="el-icon-delete" type="danger" size="mini" @click="deleteCate(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </table-tree>
      <!-- 分页 -->
      <!-- 改写 -->
      <pagination :total="total" :queryInfo="queryInfo" :get-data="getCategories"></pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            ref="cascaderRef"
            v-model="selectedKeys"
            :options="parentCate"
            :props="cascaderProps"
            @change="cascaderChange"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加编辑对话框 -->
    <el-dialog
      title="修改分类数据"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="resetEditCateDialog">
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../network/request'
import Pagination from '../other/Pagination.vue'
export default {
  name: 'Categories',
  components: {
    Pagination
  },
  data () {
    return {
      //商品分类数据
      categoryList: [],
      //查询参数对象
      queryInfo: {
        //type=1,表示获取一级分类数据,
        //type=2,表示获取一级二级分类数据,
        //type=3,表示获取一级二级三级分类数据
        //不选,默认获取所有级别的分类
        type: '',
        pagesize: 5,
        pagenum: 1
      },
      //总条数
      total: 0,
      //表格各列的配置对象
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否删除',
          //列类型(可选值有'template')
          type: 'template',
          //选择列类型template后定义的作用域插槽名字
          template: 'isOk'
        },
        {
          label: '排序',
          //列类型(可选值有'template')
          type: 'template',
          //选择列类型template后定义的作用域插槽名字
          template: 'order'
        },
        {
          label: '操作',
          //列类型(可选值有'template')
          type: 'template',
          //选择列类型template后定义的作用域插槽名字
          template: 'options'
        },

      ],
      //控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //添加分类表单数据对象
      addCateForm: {
        //分类名称
        cat_name: '',
        //分类层级
        cat_level: 0,
        //分类父id
        cat_pid: 0
      },
      //添加分类校验规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
        
      },
      //级联选择器父级分类数据
      //父级分类数据需要发送请求获取
      parentCate: [],
      //级联选择器选项数组
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true,
      },
      //级联选择器选中的父级分类id项数组
      selectedKeys: [],
      //控制修改分类对话框的显示与隐藏
      editCateDialogVisible: false,
      //编辑分类表单对象
      editCateForm: {
        cat_name: ''
      },
      //校验规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      //分类id
      cateId: ''
    };
  },
  created() {
    this.getCategories()
  },
  methods: {
    //获取商品分类数据
    async getCategories() {
      const {data: res} = await request({
        url: 'categories',
        params: this.queryInfo
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败!')
      }
      console.log('获取商品分类数据成功!');
      this.categoryList = res.data.result;
      this.total = res.data.total;
    },
    //获取父级分类id数据
    async getAddCate() {
      const {data: res} = await request({
        url: 'categories',
        //这里的type之所以是2,而不是3,是因为只能给一级或者二级
        //添加分类,三级是最后一级,添加的分类就是三级的
        params: {type: 2}
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败!')
      }
      console.log('获取父级分类数据成功!');
      this.parentCate = res.data;
    },
    //点击展示添加分类对话框
    addCateDialog() {
      //在这里使用
      this.getAddCate();
      this.addCateDialogVisible = true;
    },
    //选择项发生变化时的操作
    cascaderChange() {
      // console.log(this.selectedKeys);
      if(this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
      console.log(this.addCateForm);
      //关闭级联选择器
      this.$refs.cascaderRef.dropDownVisible = false;
    },
    //添加分类对话框关闭
    addCateDialogClosed() {
      //清空表单
      this.$refs.addCateFormRef.resetFields();
      //清空级联选择器
      this.selectedKeys = [];
      //还要清空cat_pid和cat_level
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    //点击确定添加分类
    addCate() {
      //测试一下cascaderChange的结果是否正确
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) return;
        const {data: res} = await request({
          url: 'categories',
          method: 'post',
          data: this.addCateForm
        })
        console.log(res);
        if(res.meta.status !== 201) {
          return this.$message.error('添加分类数据失败!')
        }
        console.log('添加分类数据成功!');
        this.addCateDialogVisible = false;
        this.getCategories();
      })
    },
    //控制编辑对话框的显示与隐藏
    async editCateDialog(row) {
      // console.log(row);
      //保存分类id供确认编辑事件引用
      this.cateId = row.cat_id;
      //先根据id获取到数据
      const {data: res} = await request({
        url: `categories/${row.cat_id}`
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('根据id获取分类数据失败!')
      }
      console.log('根据id获取分类数据成功!');
      this.editCateForm = res.data;
      this.editCateDialogVisible = true;
    },
    //重置编辑表单
    resetEditCateDialog() {
      this.$refs.editCateFormRef.resetFields()
    },
    //确认编辑分类
    editCateConfirm() {
      //先校验
      this.$refs.editCateFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) return;

        const {data: res} = await request({
          url: `categories/${this.cateId}`,
          method: 'put',
          data: {cat_name: this.editCateForm.cat_name}
        })
        console.log(res);
        if(res.meta.status !== 200) {
          return this.$message.error('修改分类数据失败!')
        }
        console.log('修改分类数据成功!');
        this.getCategories()
        this.editCateDialogVisible = false;
      })
    },
    //控制编辑对话框的显示与隐藏
    async deleteCate(row) {
      // console.log(row.cat_id);
      const result = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if(result !== 'confirm') {
        return this.$message.info('取消了删除分类的操作!')
      }
      const {data: res} = await request({
        url: `categories/${row.cat_id}`,
        method: 'delete'
      })
      console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('删除分类失败!')
      }
      console.log('删除分类成功!');
      this.getCategories()
    }
  }
}
</script>

<style lang='less' scoped>
  .el-cascader {
    width: 100%;
  }
</style>