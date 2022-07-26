<template>
  <div class='addCate'>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 消息提示 -->
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs区域 -->
      <el-form label-position="top" :model="addCateList" :rules="addCateListRules" ref="addCateListRulesRef" label-width="100px">
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeLeave" @tab-click="getAttributes">
          <el-tab-pane label="基本信息"  name="0">
            <!-- <el-form label-position="top" :model="addCateList" :rules="addCateListRules" ref="addCateListRulesRef" label-width="100px"> -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addCateList.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addCateList.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addCateList.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addCateList.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                ref="cascaderRef"
                v-model="addCateList.goods_cat"
                :options="cascaderOptions"
                :props="propsObj"
                @change="cascaderChange">
              </el-cascader>
            </el-form-item>
            <!-- </el-form> -->
          </el-tab-pane>
          <el-tab-pane label="商品参数"  name="1">
            <el-form-item :label="item.attr_name" v-for="(item, i) in manyTableData" :key="i">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item1"  v-for="(item1, i1) in item.attr_vals" :key="i1" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item, i) in onlyTableData" :key="i">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="imageURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addCateList.goods_introduce"></quill-editor>
            <el-button type="primary" class="btns" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog
      title="预览图片"
      :visible.sync="previewDialogVisible"
      width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import request from '../../network/request'
import _ from 'lodash'
export default {
  name: 'Add',
  data () {
    return {
      //当前活跃
      activeIndex: '0',
      //添加商品数据对象
      addCateList: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: '',
        //图片保存的临时路径
        pics: [],
        //添加的商品介绍
        goods_introduce: '',
        //商品的参数数组,包含动态参数和静态属性
        attrs: []

      },
      //校验规则
      addCateListRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' },
        ],
      },
      //级联选择器的数据源
      cascaderOptions: [],
      //级联选择器配置对象
      propsObj: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      //动态参数数据
      manyTableData: [],
      //静态属性数据
      onlyTableData: [],
      //文件上传路径
      imageURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      //
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //图片预览
      previewDialogVisible: false,
      //预览路径
      previewPath: '',
      
    };
  },
  computed: {
    //选中的第三级分类的id
    cateId() {
      if(this.addCateList.goods_cat.length === 3) {
        return this.addCateList.goods_cat[2]
      }
      return null;
    }
  },
  created() {
    this.getCascader()
  },
  methods: {
    //获取级联选择器数据
    async getCascader() {
      const {data: res} = await request({
        url: 'categories',
      })
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类参数失败!')
      }
      console.log('获取商品分类参数成功!');
      this.cascaderOptions = res.data
    },
    //tabs离开
    beforeLeave(activeName, oldActiveName) {
      // console.log('activeName', activeName);
      // console.log('oldActiveName', oldActiveName);
      if(activeName !== '0' && this.addCateList.goods_cat.length !== 3) {
        this.$message.info('请先选择级联选择器选项')
        return false;
      }
    },
    //级联选择器数据发生变化
    cascaderChange() {
      //如果选中的不是三级选择器,则清空
      if(this.addCateList.goods_cat.length !== 3) {
        this.addCateList.goods_cat = []
      }
      //关闭级联选择器
      this.$refs.cascaderRef.dropDownVisible = false;
    },
    //获取动态参数/静态属性数据
    async getAttributes() {
      if(this.activeIndex === '1') {
        //获取动态参数
        const {data: res} = await request({
          url: `categories/${this.cateId}/attributes`,
          params: {sel: 'many'}
        })
        // console.log(res);
        if(res.meta.status !== 200) {
          return this.$message.error('获取动态参数数据失败!')
        }
        console.log('获取动态参数数据成功!');
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.split(' ')
        });
        this.manyTableData = res.data;
        // console.log(this.manyTableData);
      } else if(this.activeIndex === '2') {
        //获取静态属性
        const {data: res} = await request({
          url: `categories/${this.cateId}/attributes`,
          params: {sel: 'only'}
        })
        // console.log(res);
        if(res.meta.status !== 200) {
          return this.$message.error('获取静态属性数据失败!')
        }
        console.log('获取静态属性数据成功!');
        // res.data.forEach(item => {
        //   item.attr_vals = item.attr_vals.split(' ')
        // });
        this.onlyTableData = res.data;
        // console.log(this.onlyTableData);
      }
    },
    //文件预览
    handlePreview(file) {
      // console.log(file);
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true;
    },
    //添加成功时的操作
    handleSuccess(response) {
      // console.log(response);
      //1.获取图片临时路径
      const picInfo = {
        pic: response.data.tmp_path
      }
      // console.log(picInfo);
      //2.添加到addCateList中
      this.addCateList.pics.push(picInfo)
      // console.log(this.addCateList);
    },
    //移除文件
    handleRemove(file) {
      // console.log(file);
      //1.获取图片临时路径
      const picInfo = file.response.data.tmp_path;
      // console.log(picInfo);
      //2.过滤掉不符合条件的
      //filter会创建一个新数组,返回所有符合条件的,所以要把
      //过滤后的值重新赋值给pics
      this.addCateList.pics =  this.addCateList.pics.filter(x => x.pic !== picInfo)
      // console.log(this.addCateList);
    },
    //确认添加商品
    addGoods() {
      //校验
      this.$refs.addCateListRulesRef.validate(async valid => {
        // console.log(valid);
        if(!valid) {
          return this.$message.info('请填写必要的表单项!')
        }
        //通过校验,对数据做一下处理
        //goods_cat要求是以逗号分割的分类列表,但是级联选择器要求的是数组
        const form = _.cloneDeep(this.addCateList)
        form.goods_cat = form.goods_cat.join(',')

        //需要对动态参数和静态属性做一下处理
        this.manyTableData.forEach(item => {
          // console.log(item);
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addCateList.attrs.push(newInfo)
        });
        // console.log(this.addCateList);
        //需要对静态属性做一下处理
        this.onlyTableData.forEach(item => {
          // console.log(item);
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addCateList.attrs.push(newInfo)
        });
        form.attrs = this.addCateList.attrs;
        // console.log(form);
        //发送请求
        const {data: res} = await request({
          url: 'goods',
          method: 'post',
          data: form
        })
        console.log(res);
        if(res.meta.status !== 201) {
          return this.$message.error('添加商品失败!')
        }
        this.$message.success('添加商品成功!');
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang='less' scoped>
  .el-checkbox {
    margin-left: 10px !important;
  }

  .previewImg {
    width: 100%;
  }

  
  .btns {
    margin-top: 15px;
  }
</style>