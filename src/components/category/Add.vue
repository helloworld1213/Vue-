<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加商品信息 -->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <!-- 进度条区域 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <!-- 上面发生变化,下面跟着展示对应数字的项目 v-model动态绑定的值和name对应,
        和上面的active也是对应的,但是上面需要的是一个数字 -->
        <!-- 这里有个注意点,就是el-form不能放到el-tabs里面,不会显示,放在外面没有问题 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" 
        label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex"
          :before-leave="beforeTabLeave" @tab-click="tabClick">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price" type="number">
                <el-input v-model="addForm.goods_price"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight" type="number">
                <el-input v-model="addForm.goods_weight"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number" type="number">
                <el-input v-model="addForm.goods_number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <el-cascader
                  v-model="addForm.goods_cat"
                  :options="cateList"
                  :props="cateProps"
                  @change="handleChange">
                </el-cascader>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <!-- 渲染表单的item项 -->
              <el-form-item :label="item.attr_name"
               v-for="item in manyTableData" :key="item.attr_id">
               <!-- 复选框组 -->
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals">
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item :label="item.attr_name"
                v-for="item in onlyTableData" :key="item.attr_id">
                <el-input v-model="item.attr_vals">
                </el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <el-upload
                :action="uploadUrl"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headersObj"
                :on-success="handleSuccess">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <quill-editor v-model="addForm.goods_introduce">
              </quill-editor>
              <el-button type="primary" @click="addGoods">添加商品</el-button>
            </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'Add',
  data() {
    return {
      // active: 0,
      activeIndex: '0',
      //添加商品的数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品所属的分类数组
        goods_cat: [],
        //图片的数组
        pics: [],
        //富文本绑定的数据
        goods_introduce: ''
      },
      //分类列表的数据
      cateList: [],
      //级联选择器的prop
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      //动态参数数据
      manyTableData: [],
      //静态属性数据
      onlyTableData: [],
      //图片上传的地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      //图片上传组件的请求头headers对象
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //图片预览真实地址
      previewPath: '',
      //图片预览对话框的显示与隐藏
      previewVisible: false,
      //商品的参数（数组），包含 动态参数 和 静态属性
      attrs: [],
      //添加商品的规则
      addFormRules: {
        goods_name: [
           { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
           { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
           { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
           { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
           { required: true, message: '请选择商品分类', trigger: 'blur' }
        ],
      },
    }
  },
  created() {
    this.getCategoryList();
  },
  methods: {
    async getCategoryList() {
      const {data: res} = await this.$http.get('categories')
      if(res.meta.status !== 200) {
        return this.$message.error("获取数据失败");
      }else {
        // console.log(res.data);
        this.cateList = res.data;
      }
    },
    //级联选择器选中项发生变化就会触发该函数
    handleChange() {
      //只允许选中级联选择器第三项,如果不是第三项,
      //清空级联选择器
      if(this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      //console.log('即将进入的标签页名字是:' + activeName);
      //console.log('即将离开的标签页名字是:' + oldActiveName);
      if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        //给出提示信息
        this.$message.error("请先选择底部的商品分类");
        //同时不允许跳转
        return false;
      }
    },
    async tabClick() {
      // console.log(this.activeIndex);
      //也就是说当activeIndex = 1的时候,点击的是
      //动态参数,所以可以在满足条件的时候发送请求
      //这里的请求是去动态参数那里请求
      //activeIndex === '1'表示进入了动态参数页面
      if(this.activeIndex === '1') {
        // const {data: res} = await this.$http.get(`categories/${this.addForm.goods_cat[2]}/attributes`, {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'many'}
        })
        if(res.meta.status !== 200) {
          return this.$message.error("请求动态参数失败");
        }else {
          // console.log(res.data);
          //现在得到的res.data里面的attr_vals是一个
          //以空格分割的字符串,而我们需要的是数组,所以
          //先遍历一下,得到数组
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0? [] : item.attr_vals.split(' ');
          })
          this.manyTableData = res.data;
        }
      }else if(this.activeIndex === '2'){
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'only'}
        })
        if(res.meta.status !== 200) {
          return this.$message.error("请求静态属性失败");
        }else {
          // console.log(res.data);
          
          this.onlyTableData = res.data;
        }
      }
      
    },
    //图片预览
    handlePreview(file) {
      //获取图片预览真实地址
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    //移除图片
    handleRemove(file) {
      //1.找到要删除图片的路径
      // console.log(file);
      const filePath = file.response.data.tmp_path;
      //2.在addForm里的pics里面找到对应的索引
      const i =  this.addForm.pics.findIndex(x => {
        x.pic = filePath;
      })
      //3.调用splice方法,把图片信息从pics中移除
      console.log(this.addForm);
      this.addForm.pics.splice(i, 1);
    },
    //监听图片上传成功的事件
    handleSuccess(response) {
      // console.log(response);
      //1.拼接得到一个图片信息对象
      const picsInfo = {pic : response.data.tmp_path}
      //2.将图片信息对象,push到pics数组中
      // console.log(this.addForm);
      this.addForm.pics.push(picsInfo);
    },
    //点击按钮添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) {
          return this.$message.error("请填写对应的校验");
        }else {
          // console.log('111');
          //要求addForm.goods_cat为以','分割的分类列表
          // this.addForm.goods_cat = this.addForm.goods_cat.join(',');
          // console.log(this.addForm.goods_cat);
          //但是会报错,因为el-form/el-form-item/el-cascader
          //也就是级联选择器里面要求双向绑定的必须是一个数组
          //解决方法:lodash深拷贝
          //安装lodash,然后在本组件内导入
          //深拷贝
          const form = _.cloneDeep(this.addForm);
          //console.log(form === this.addForm);//false
          // console.log(this.addForm.goods_cat);
          this.addForm.goods_cat = form.goods_cat.join(',');
          // console.log(this.addForm.goods_cat);

          // console.log(this.addForm);
          // console.log(form);
          //处理动态参数,遍历从addForm上拿到attr_id"和attr_value
          // this.manyTableData.forEach(item => {
          //   const newInfo = {
          //     attr_id: item.attr_id,
          //     attr_value : item.attr_vals.join(' ')
          //   }
          //   this.addForm.attrs.push(newInfo);
          // })
          //处理静态属性
          // this.onlyTableData.forEach(item => {
          //   const newInfo = {
          //     attr_id: item.attr_id,
          //     attr_value : item.attr_vals
          //   }
          //   this.addForm.attrs.push(newInfo);
          // })
          // form.attrs = this.addForm.attrs;
          // console.log(this.manyTableData);
          // console.log(this.onlyTableData);
          // console.log(form);
          // const {data: res} = await this.$http.post('goods', form) 
          // if(res.meta.status !== 200) {
          //   return this.$message.error("添加商品失败");
          // }else {
          //   this.$message.success("添加商品成功");
          //   //跳转到商品页
          //   this.$router.push('/goods');
          // }
        }
      })
    }
  },
  computed: {
    //
    cateId() {
      //如果满足选择的是第三级级联选择器这个条件,
      //就把第三级级联选择器发送出去
      if(this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }else {
        return null;
      }
    }
  }
}
</script>

<style lang="less" scope>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  .previewImg {
    width: 100%;
  }
  .el-button {
    margin-top: 15px;
  }
</style>