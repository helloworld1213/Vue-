<template>
  <div class=''>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb> 
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 消息提醒区域 -->
      <el-alert title="注意: 只允许为第三级分类设置相关参数!" type="warning" show-icon></el-alert>
      <!-- 级联选择器区域 -->
      <div class="cascader-box">
        <span>选择商品分类:</span>
        <!-- 级联选择器:只能选中最后一级 v-model负责将选中的id双向绑定到对应的数组中-->
        <el-cascader
          ref="cascaderRef"
          v-model="selectedKeys"
          :options="parentCate"
          :props="cascaderProps"
          @change="cascaderChanged"
          clearable>
        </el-cascader>
      </div>
      <!-- tabs标签页 -->
      <el-tabs v-model="activeName" @tab-click="tabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button :disabled="isActive" type="primary" size="mini" @click="addAttributes">动态参数</el-button>
          <!-- 动态参数 -->
          <el-table :data="manyTableData" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag closable class="tagMsg" v-for="(item, i) in scope.row.attr_vals" :key="i"
                  @close="deleteTag(i, scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-tooltip :enterable="false" class="item" effect="dark" content="编辑" placement="top-start">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editAttrDialog(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip :enterable="false" class="item" effect="dark" content="删除" placement="top-start">
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteAttrDialog(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button :disabled="isActive" type="primary" size="mini">静态属性</el-button>
          <!-- 静态属性 -->
          <el-table :data="onlyTableData" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag closable class="tagMsg" v-for="(item, i) in scope.row.attr_vals" :key="i"
                  @close="deleteTag(i, scope.row)">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-tooltip :enterable="false" class="item" effect="dark" content="编辑" placement="top-start">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editAttrDialog(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip :enterable="false" class="item" effect="dark" content="删除" placement="top-start">
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteAttrDialog(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 展示添加动态参数/静态属性的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addAttrDialogVisible"
      width="50%"
      @close="clearAttrForm">
      <el-form :model="addAttrForm" :rules="addAttrFormRules" ref="addAttrFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addAttrForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttr">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示编辑动态参数/静态属性的对话框 -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editAttrDialogVisible"
      width="50%"
      @close="clearEditForm">
      <el-form :model="editAttrForm" :rules="editAttrFormRules" ref="editAttrFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editAttrForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAttr">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../network/request'
export default {
  name: 'Params',
  data () {
    return {
      //父级分类数据
      parentCate: [],
      //选中项的id数组
      selectedKeys: [],
      //配置项
      cascaderProps: {
        checkStrictly: true,
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //tabs活跃时选中的选项
      activeName: 'many',
      //动态属性数据
      manyTableData: [],
      //静态参数数据
      onlyTableData: [],
      // //控制input和button之间的切换
      // inputVisible: false,
      // //表单绑定数据
      // inputValue: '',
      //控制添加动态参数/静态属性对话框的显示与隐藏
      addAttrDialogVisible: false,
      //添加属性校验规则绑定对象
      addAttrForm: {
        attr_name: ''
      },
      //添加属性校验规则对象
      addAttrFormRules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
        ],
      },
      //控制编辑动态参数/静态属性对话框的显示与隐藏
      editAttrDialogVisible: false,
      //编辑属性校验规则绑定对象
      editAttrForm: {
        attr_name: ''
      },
      //编辑属性校验规则对象
      editAttrFormRules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
        ],
      }
    };
  },
  created() {
    this.getParentCate();
  },
  computed: {
    //控制按钮是否可以使用
    isActive() {
      if(this.selectedKeys.length == 3) {
        return false;
      }else {
        return true;
      }
    },
    //返回选中的id
    cateId() {
      if(this.selectedKeys.length == 3) {
        //this.selectedKey[2]就是选中的三级分类的id
        return this.selectedKeys[2]
      }else {
        return null;
      }
    },
    //动态添加标题
    titleText() {
      if(this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  methods: {
    //获取父级分类数据
    async getParentCate() {
      const {data: res} = await request({
        url: 'categories',
        params: {type: 3}
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败!')
      }
      console.log('获取父级分类数据成功!');
      this.parentCate = res.data;
    },
    //级联选择器选中项发生变化
    cascaderChanged() {
      //只能选中第三级分类
      // console.log(this.selectedKeys);
      //在这里使用获取数据的函数
      this.getAttributes();

      //关闭级联选择器
      this.$refs.cascaderRef.dropDownVisible = false;
    },
    //tab标签变化时的操作
    tabClick() {
      //标签页发生变化也获取对应数据
      this.getAttributes();
    },
    //获取动态参数/静态属性
    async getAttributes() {
      if(this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      //在选中第三级分类之后获取动态参数数据/静态属性数据
      const {data: res} = await request({
        url: `categories/${this.cateId}/attributes`,
        params: {sel: this.activeName}
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取参数列表数据失败!')
      }
      console.log('获取参数列表数据成功!');
      res.data.forEach(item => {
        // console.log(item);
        //获取的attr_vals是以空格隔开的字符串,我们需要的是数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
        //给每个输入框添加唯一的inputVisible
        item.inputVisible = false;
        //给每个输入框唯一的值
        item.inputValue = '';

      });
      if(this.activeName === 'many') {
        this.manyTableData = res.data;
      }else {
        this.onlyTableData = res.data;
      }
    },
    //按下enter键/失去焦点后的操作(转为input输入框)
    handleInputConfirm(row) {
      // console.log(row);
      //如果属性里面没有tag标签,则让它的值为空
      if(row.inputValue.trim().length === 0) {
        row.inputValue = '';
        row.inputVisible = false;
        return;//一定要有return
      }
      //把输入的值添加到attr_vals数组里
      row.attr_vals.push(row.inputValue)
      //清空输入框
      row.inputValue = '';
      //关闭输入框
      row.inputVisible = false;
      // console.log(row.attr_vals);
      //把值添加到数据库(提取出来的函数changeData)
      this.changeData(row)
    },
    //把tag里面的值添加到数据库
    async changeData(row) {
      const {data: res} = await request({
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        method: 'put',
        data: {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          //我们改成了数组,要再转成空格隔开的字符串
          attr_vals: row.attr_vals.join(' ')
        }
      })
      console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('修改属性参数失败!')
      }
      console.log('修改属性参数成功!');
      // this.getAttributes()
    },
    //点击tag上的小叉号删除tag
    deleteTag(i, row) {
      //i是选中的那一项
      // console.log(i);
      // console.log(row);
      //删除选中的那一项
      row.attr_vals.splice(i, 1)
      //保存到数据库
      this.changeData(row) 
    },
    //点击显示文本框
    showInput(row) {
      //因为给inputVisible赋值了唯一值,所以
      //这里的调用不是this了,而是发过来的row的值
      row.inputVisible = true;
      // console.log(this);
      //自动获取焦点(这个方法是Vue里面的方法,所以不需要改变this)
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //添加动态参数/静态属性
    addAttributes() {
      this.addAttrDialogVisible = true;
    },
    //关闭添加动态参数/静态属性后重置表单
    clearAttrForm() {
      this.$refs.addAttrFormRef.resetFields()
    },
    //确认往数据库添加动态参数/静态属性
    addAttr() {
      //校验
      this.$refs.addAttrFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) return;
        //校验成功后请求数据
        const {data: res} = await request({
          url: `categories/${this.cateId}/attributes`,
          method: 'post',
          data: {
            attr_name: this.addAttrForm.attr_name,
            attr_sel: this.activeName
          }
        })
        console.log(res);
        if(res.meta.status !== 201) {
          return showMsg('post', 'error', '属性')
        }
        showMsg('post', 'other', '属性')
        this.addAttrDialogVisible = false;
        this.getAttributes()
      })
    },
    //编辑属性
    async editAttrDialog(row) {
      //在打开对话框的时候获取参数
      const {data: res} = await request({
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        params: { attr_sel: this.activeName }
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('根据id获取数据失败!')
      }
      console.log('根据id获取数据成功!');
      //获取到的数据保存到编辑对话框的校验规则对象上
      this.editAttrForm = res.data;

      this.editAttrDialogVisible = true;
    },
    //关闭编辑对话框重置表单
    clearEditForm() {
      this.$refs.editAttrFormRef.resetFields()
    },
    //确认编辑
    editAttr() {
      //校验
      this.$refs.editAttrFormRef.validate(async valid => {
        // console.log(valid);
        if(!valid) return;
        //校验成功,发送请求
        const {data: res} = await request({
          url: `categories/${this.cateId}/attributes/${this.editAttrForm.attr_id}`,
          method: 'put',
          data: {
            attr_name: this.editAttrForm.attr_name,
            attr_sel: this.activeName
          }
        })
        console.log(res);
        if(res.meta.status !== 200) {
          return this.$message.error('编辑属性失败!')
        }
        console.log('编辑属性成功!');
        this.editAttrDialogVisible = false;
        this.getAttributes()
      })
    },
    //删除属性
    async deleteAttrDialog(row) {
      console.log(row);
      const result = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(result);
      if(result !== 'confirm') {
        return this.$message.info('取消了删除属性的操作')
      }
      //发送请求
      const {data: res} = await request({
        //这里的两个id: categories/:id/attributes/:attrid
        //一个是分类id,我们要获取选中的级联选择器第三级分类,刚好是上面的计算属性的分类id
        //第二个是参数id,可以通过函数传参传过来
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        method: 'delete',
      })
      console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('删除属性数据失败!')
      }
      console.log('删除属性数据成功!');
      this.getAttributes()
    }

  }
}
</script>

<style lang='less' scoped>
  .cascader-box {
    margin: 15px 0;

    span {
      margin-right: 15px;
    }
  }
  .tagMsg {
    margin-right: 15px;
  }
  // 给tag标签(button和input之间转换的tag)添加样式
  .el-input--small {
    margin: 10px 0;
    width: 130px;
    height: 32px;
    line-height: 30px;
  }
</style>