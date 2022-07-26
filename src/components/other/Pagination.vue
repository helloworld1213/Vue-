<template>
  <div class=''>
     <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[2, 5, 8, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <!-- {{queryInfo}} -->
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  //父组件传递过来的数据
  //注意: props不是写在data里面的,而是跟data并列的
  props: {
    total: Number,
    queryInfo: Object,
    getData: Function
  },
  data () {
    return {
      //想要修改父组件传递过来的数据,可以保存到本地(本组件)
      total1: this.total,
      queryInfo1: this.queryInfo,
      getData1: this.getData
    };
  },
  watch: {
    
  },
  methods: {
    //页面条数发生变化
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getData1()
    },
    //页码发生变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getData1()
    }
  }
}
</script>

<style lang='less' scoped>
  
</style>